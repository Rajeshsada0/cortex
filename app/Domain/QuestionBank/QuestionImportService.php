<?php

namespace App\Domain\QuestionBank;

use App\Models\Question;
use App\Models\QuestionExamRelevance;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\Topic;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuestionImportService
{
    /**
     * Import questions from an uploaded file (CSV or JSON).
     *
     * @return array{total: int, imported: int, failed: int, errors: array<array{row: int|string, identifier: string, messages: array<string>}>, created_codes: array<string>}
     */
    public function import(UploadedFile $file, bool $publishAsActive = true, ?int $defaultSubjectId = null): array
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(600);

        $extension = strtolower($file->getClientOriginalExtension());
        $content = file_get_contents($file->getRealPath());

        if (empty($content)) {
            return [
                'total' => 0,
                'imported' => 0,
                'failed' => 0,
                'errors' => [
                    ['row' => 0, 'identifier' => 'File', 'messages' => ['The uploaded file is empty.']],
                ],
                'created_codes' => [],
            ];
        }

        if ($extension === 'json') {
            return $this->importFromJson($content, $publishAsActive, $defaultSubjectId);
        }

        return $this->importFromCsv($content, $publishAsActive, $defaultSubjectId);
    }

    /**
     * Import questions from CSV string.
     */
    public function importFromCsv(string $csvContent, bool $publishAsActive = true, ?int $defaultSubjectId = null): array
    {
        // Strip UTF-8 BOM if present
        $csvContent = preg_replace('/^\xEF\xBB\xBF/', '', $csvContent);

        // Normalize newlines
        $lines = preg_split('/\r\n|\r|\n/', trim($csvContent));
        if (empty($lines) || count($lines) < 2) {
            return [
                'total' => 0,
                'imported' => 0,
                'failed' => 0,
                'errors' => [
                    ['row' => 1, 'identifier' => 'CSV Header', 'messages' => ['CSV file must contain a header row and at least one data row.']],
                ],
                'created_codes' => [],
            ];
        }

        // Detect delimiter (comma, semicolon, tab)
        $firstLine = $lines[0];
        $delimiter = ',';
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $delimiter = ';';
        } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
            $delimiter = "\t";
        }

        $stream = fopen('php://memory', 'r+');
        fwrite($stream, $csvContent);
        rewind($stream);

        $headers = fgetcsv($stream, 0, $delimiter);
        if (! $headers) {
            fclose($stream);

            return [
                'total' => 0,
                'imported' => 0,
                'failed' => 0,
                'errors' => [['row' => 1, 'identifier' => 'CSV', 'messages' => ['Failed to parse CSV header.']]],
                'created_codes' => [],
            ];
        }

        $normalizedHeaders = array_map(function ($h) {
            return strtolower(trim(str_replace([' ', '-', '_'], '', (string) $h)));
        }, $headers);

        $rows = [];
        $rowNumber = 1;
        while (($data = fgetcsv($stream, 0, $delimiter)) !== false) {
            $rowNumber++;
            // Skip empty rows
            if (empty(array_filter($data, fn ($val) => trim((string) $val) !== ''))) {
                continue;
            }

            $mappedRow = [];
            foreach ($data as $index => $value) {
                if (isset($normalizedHeaders[$index])) {
                    $mappedRow[$normalizedHeaders[$index]] = trim((string) $value);
                }
            }
            $rows[] = [
                'row_number' => $rowNumber,
                'data' => $mappedRow,
            ];
        }
        fclose($stream);

        return $this->processMappedItems($rows, $publishAsActive, $defaultSubjectId, 'csv');
    }

    /**
     * Import questions from JSON string.
     */
    public function importFromJson(string $jsonContent, bool $publishAsActive = true, ?int $defaultSubjectId = null): array
    {
        $decoded = json_decode($jsonContent, true);
        if (! is_array($decoded)) {
            return [
                'total' => 0,
                'imported' => 0,
                'failed' => 0,
                'errors' => [
                    ['row' => 1, 'identifier' => 'JSON', 'messages' => ['Invalid JSON format. Please ensure valid JSON structure.']],
                ],
                'created_codes' => [],
            ];
        }

        // Allow wrapper e.g. { "questions": [...] }
        if (isset($decoded['questions']) && is_array($decoded['questions'])) {
            $items = $decoded['questions'];
        } else {
            $items = $decoded;
        }

        $rows = [];
        $index = 1;
        foreach ($items as $item) {
            if (is_array($item)) {
                $rows[] = [
                    'row_number' => $index,
                    'data' => $item,
                ];
                $index++;
            }
        }

        return $this->processMappedItems($rows, $publishAsActive, $defaultSubjectId, 'json');
    }

    /**
     * Process mapped rows and insert them into DB.
     *
     * @param  array<array{row_number: int, data: array<string, mixed>}>  $items
     * @return array{total: int, imported: int, failed: int, errors: array<array{row: int|string, identifier: string, messages: array<string>}>, created_codes: array<string>}
     */
    protected function processMappedItems(array $items, bool $publishAsActive, ?int $defaultSubjectId, string $sourceType): array
    {
        $imported = 0;
        $failed = 0;
        $errors = [];
        $createdCodes = [];

        // Preload subjects and topics for fast in-memory matching
        $subjects = Subject::with('topics.subtopics')->get();

        foreach ($items as $entry) {
            $rowNum = $entry['row_number'];
            $raw = $entry['data'];

            $validation = $this->validateAndNormalizeItem($raw, $subjects, $defaultSubjectId, $sourceType);

            if (! empty($validation['errors'])) {
                $failed++;
                $errors[] = [
                    'row' => $rowNum,
                    'identifier' => $validation['code'] ?? "Row {$rowNum}",
                    'messages' => $validation['errors'],
                ];

                continue;
            }

            try {
                $createdQuestion = DB::transaction(function () use ($validation, $publishAsActive) {
                    $question = Question::create([
                        'code' => $validation['code'],
                        'subject_id' => $validation['subject_id'],
                        'topic_id' => $validation['topic_id'],
                        'subtopic_id' => $validation['subtopic_id'] ?? null,
                        'difficulty' => $validation['difficulty'],
                        'question_type' => $validation['question_type'] ?? 'SINGLE_BEST_ANSWER',
                        'stem' => $validation['stem'],
                        'image_url' => $validation['image_url'] ?? null,
                        'image_caption' => $validation['image_caption'] ?? null,
                        'correct_option' => $validation['correct_option'],
                        'learning_objective' => $validation['learning_objective'],
                        'foundation_explanation' => $validation['foundation_explanation'],
                        'integration_explanation' => $validation['integration_explanation'],
                        'application_explanation' => $validation['application_explanation'],
                        'memory_peg' => $validation['memory_peg'] ?? null,
                        'is_active' => $validation['is_active'] ?? $publishAsActive,
                    ]);

                    // Insert Options (A, B, C, D)
                    $sortedOptions = $validation['options'];
                    usort($sortedOptions, fn ($a, $b) => strcmp($a['option_key'] ?? '', $b['option_key'] ?? ''));
                    foreach ($sortedOptions as $opt) {
                        QuestionOption::create([
                            'question_id' => $question->id,
                            'option_key' => $opt['option_key'],
                            'option_text' => $opt['option_text'],
                            'rationale' => $opt['rationale'] ?? '',
                        ]);
                    }

                    // Insert Exam Relevance
                    foreach ($validation['relevant_exams'] as $exam) {
                        QuestionExamRelevance::create([
                            'question_id' => $question->id,
                            'exam' => $exam,
                        ]);
                    }

                    return $question;
                });

                $imported++;
                $createdCodes[] = $createdQuestion->code;
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = [
                    'row' => $rowNum,
                    'identifier' => $validation['code'] ?? "Row {$rowNum}",
                    'messages' => ['Database save failed: '.$e->getMessage()],
                ];
            }
        }

        return [
            'total' => count($items),
            'imported' => $imported,
            'failed' => $failed,
            'errors' => $errors,
            'created_codes' => $createdCodes,
        ];
    }

    /**
     * Validate and normalize a single item.
     *
     * @param  array<string, mixed>  $data
     * @param  Collection<int, Subject>  $subjects
     * @return array<string, mixed>
     */
    protected function validateAndNormalizeItem(array $data, $subjects, ?int $defaultSubjectId, string $sourceType): array
    {
        $errors = [];

        // Helper to extract value by multiple possible key names
        $get = function (array $keys, $default = null) use ($data) {
            foreach ($keys as $k) {
                $cleanK = strtolower(trim(str_replace([' ', '-', '_'], '', $k)));
                if (isset($data[$cleanK]) && $data[$cleanK] !== '') {
                    return $data[$cleanK];
                }
                if (isset($data[$k]) && $data[$k] !== '') {
                    return $data[$k];
                }
            }

            return $default;
        };

        // 1. Stem
        $stem = $get(['stem', 'question', 'vignette', 'question_stem']);
        if (empty($stem)) {
            $errors[] = 'Question stem / vignette is required.';
        }

        // 2. Correct Option
        $correctOption = strtoupper((string) $get(['correct_option', 'answer', 'correct', 'correct_answer', 'correctoption'], ''));
        if (! in_array($correctOption, ['A', 'B', 'C', 'D'])) {
            $errors[] = "Correct option must be one of 'A', 'B', 'C', or 'D'. Received: '{$correctOption}'.";
        }

        // 3. Options extraction
        $options = [];
        if ($sourceType === 'json' && isset($data['options']) && is_array($data['options'])) {
            foreach ($data['options'] as $rawOpt) {
                $key = strtoupper((string) ($rawOpt['option_key'] ?? $rawOpt['key'] ?? ''));
                $text = (string) ($rawOpt['option_text'] ?? $rawOpt['text'] ?? '');
                $rationale = (string) ($rawOpt['rationale'] ?? $rawOpt['explanation'] ?? '');
                if (in_array($key, ['A', 'B', 'C', 'D'])) {
                    $options[$key] = [
                        'option_key' => $key,
                        'option_text' => $text,
                        'rationale' => $rationale,
                    ];
                }
            }
        }

        // Fallback or CSV extraction for options
        foreach (['A', 'B', 'C', 'D'] as $key) {
            if (! isset($options[$key])) {
                $lowerKey = strtolower($key);
                $text = $get([
                    "option_{$lowerKey}",
                    "option{$lowerKey}",
                    "opt_{$lowerKey}",
                    "choice_{$lowerKey}",
                    "choice{$lowerKey}",
                    $lowerKey,
                ]);

                $rationale = $get([
                    "option_{$lowerKey}_rationale",
                    "option{$lowerKey}rationale",
                    "rationale_{$lowerKey}",
                    "rationale{$lowerKey}",
                    "explanation_{$lowerKey}",
                ], '');

                if (! empty($text)) {
                    $options[$key] = [
                        'option_key' => $key,
                        'option_text' => (string) $text,
                        'rationale' => (string) $rationale,
                    ];
                }
            }
        }

        if (count($options) < 4 || ! isset($options['A'], $options['B'], $options['C'], $options['D'])) {
            $errors[] = 'All 4 options (A, B, C, D) must have valid text.';
        }

        // 4. Subject Resolution
        $subjectInput = $get(['subject', 'subject_id', 'subject_name', 'subjectid', 'subjectname']);
        $matchedSubject = null;

        if ($subjectInput) {
            $matchedSubject = $subjects->first(function ($s) use ($subjectInput) {
                return (string) $s->id === (string) $subjectInput
                    || strcasecmp($s->name, (string) $subjectInput) === 0
                    || strcasecmp($s->slug, (string) $subjectInput) === 0;
            });
        }

        if (! $matchedSubject && $defaultSubjectId) {
            $matchedSubject = $subjects->firstWhere('id', $defaultSubjectId);
        }

        if (! $matchedSubject) {
            // Fallback to first available subject (e.g. Anatomy)
            $matchedSubject = $subjects->first();
            if (! $matchedSubject) {
                $errors[] = 'No medical subject found or specified in database.';
            }
        }

        // 5. Topic Resolution
        $matchedTopic = null;
        if ($matchedSubject) {
            $topicInput = $get(['topic', 'topic_id', 'topic_name', 'topicid', 'topicname']);
            if ($topicInput) {
                $matchedTopic = $matchedSubject->topics->first(function ($t) use ($topicInput) {
                    return (string) $t->id === (string) $topicInput
                        || strcasecmp($t->name, (string) $topicInput) === 0
                        || strcasecmp($t->slug, (string) $topicInput) === 0;
                });
            }

            if (! $matchedTopic) {
                // Fallback to first topic in this subject
                $matchedTopic = $matchedSubject->topics->first();
            }

            if (! $matchedTopic) {
                $errors[] = "Subject '{$matchedSubject->name}' does not have any topics.";
            }
        }

        // 6. Subtopic (Optional)
        $matchedSubtopic = null;
        if ($matchedTopic) {
            $subtopicInput = $get(['subtopic', 'subtopic_id', 'subtopic_name']);
            if ($subtopicInput) {
                $matchedSubtopic = $matchedTopic->subtopics->first(function ($st) use ($subtopicInput) {
                    return (string) $st->id === (string) $subtopicInput
                        || strcasecmp($st->name, (string) $subtopicInput) === 0;
                });
            }
        }

        // 7. Difficulty
        $difficulty = strtoupper((string) $get(['difficulty'], 'MEDIUM'));
        if (! in_array($difficulty, ['EASY', 'MEDIUM', 'HARD'])) {
            $difficulty = 'MEDIUM';
        }

        // 8. 3-Tier Explanations & Learning Objective
        $learningObjective = $get(['learning_objective', 'objective', 'key_takeaway', 'learningobjective'], 'Clinical diagnostic and therapeutic assessment.');
        $foundation = $get(['foundation_explanation', 'foundation', 'mechanism', 'pathophysiology', 'foundationexplanation']);
        $integration = $get(['integration_explanation', 'integration', 'differential', 'integrationexplanation']);
        $application = $get(['application_explanation', 'application', 'management', 'gold_standard', 'applicationexplanation']);

        // If explanations are missing, synthesize from general explanation or provide fallback
        $generalExplanation = $get(['explanation', 'rationale', 'discuss'], '');
        if (empty($foundation)) {
            $foundation = ! empty($generalExplanation) ? $generalExplanation : 'Core biological and anatomical mechanism underlying the presentation.';
        }
        if (empty($integration)) {
            $integration = 'Differential diagnosis reasoning and clinical correlation with laboratory/imaging findings.';
        }
        if (empty($application)) {
            $application = 'Evidence-based therapeutic guideline, drug of choice, or clinical intervention.';
        }

        // 9. Memory Peg
        $memoryPeg = $get(['memory_peg', 'peg', 'mnemonic', 'high_yield_pearl', 'memorypeg']);

        // 10. Code
        $code = $get(['code', 'question_code', 'id']);
        if (empty($code)) {
            $code = 'Q-'.strtoupper(Str::random(8));
        } else {
            $code = trim((string) $code);
            // Check uniqueness if provided
            if (Question::where('code', $code)->exists()) {
                $code = $code.'-'.strtoupper(Str::random(4));
            }
        }

        // 11. Relevant Exams
        $examsInput = $get(['relevant_exams', 'exams', 'exam', 'pathways', 'relevantexams'], 'COMBINED');
        $validExams = ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'];
        $relevantExams = [];

        if (is_array($examsInput)) {
            foreach ($examsInput as $e) {
                $up = strtoupper(trim((string) $e));
                if (in_array($up, $validExams)) {
                    $relevantExams[] = $up;
                }
            }
        } else {
            $parts = explode(',', (string) $examsInput);
            foreach ($parts as $p) {
                $up = strtoupper(trim($p));
                if (in_array($up, $validExams)) {
                    $relevantExams[] = $up;
                }
            }
        }

        if (empty($relevantExams)) {
            $relevantExams = ['COMBINED'];
        }

        return [
            'errors' => $errors,
            'code' => $code,
            'subject_id' => $matchedSubject?->id,
            'topic_id' => $matchedTopic?->id,
            'subtopic_id' => $matchedSubtopic?->id,
            'difficulty' => $difficulty,
            'question_type' => 'SINGLE_BEST_ANSWER',
            'stem' => (string) $stem,
            'image_url' => $get(['image_url', 'image', 'imageurl']),
            'image_caption' => $get(['image_caption', 'caption', 'imagecaption']),
            'correct_option' => $correctOption,
            'learning_objective' => (string) $learningObjective,
            'foundation_explanation' => (string) $foundation,
            'integration_explanation' => (string) $integration,
            'application_explanation' => (string) $application,
            'memory_peg' => $memoryPeg ? (string) $memoryPeg : null,
            'options' => array_values($options),
            'relevant_exams' => array_unique($relevantExams),
        ];
    }

    /**
     * Generate starter sample CSV string with comprehensive clinical vignettes.
     */
    public function getSampleCsv(): string
    {
        $headers = [
            'code',
            'subject',
            'topic',
            'difficulty',
            'stem',
            'option_a',
            'option_a_rationale',
            'option_b',
            'option_b_rationale',
            'option_c',
            'option_c_rationale',
            'option_d',
            'option_d_rationale',
            'correct_option',
            'learning_objective',
            'foundation_explanation',
            'integration_explanation',
            'application_explanation',
            'memory_peg',
            'relevant_exams',
        ];

        $sampleRows = [
            [
                'Q-SAMPLE-001',
                'Internal Medicine',
                'Cardiovascular System',
                'HARD',
                'A 58-year-old male with a history of hypertension and dyslipidemia presents with crushing substernal chest pressure radiating to the left arm for 90 minutes. ECG demonstrates 2.5 mm ST elevations in leads V1-V4 with reciprocal depressions in leads II, III, and aVF. Which coronary artery is most likely occluded?',
                'Right Coronary Artery (RCA)',
                'RCA occlusion causes inferior wall STEMI (leads II, III, aVF).',
                'Left Anterior Descending (LAD)',
                'LAD supplies the anteroseptal myocardium and anterior wall, matching leads V1-V4 elevations.',
                'Left Circumflex Artery (LCx)',
                'LCx occlusion causes lateral wall STEMI (leads I, aVL, V5, V6).',
                'Left Main Coronary Artery (LMCA)',
                'LMCA occlusion causes widespread anterior/lateral depression with aVR elevation.',
                'B',
                'Identify coronary artery vascular territories corresponding to 12-lead ECG findings.',
                'The LAD coronary artery courses in the anterior interventricular groove, perfusing the anterior two-thirds of the interventricular septum and the anterior wall of the left ventricle.',
                'ST elevations in leads V1-V2 (septal) and V3-V4 (anterior) localize ischemia precisely to the LAD territory.',
                'Emergency primary percutaneous coronary intervention (PCI) with door-to-balloon time < 90 minutes is the therapeutic standard.',
                'Widow Maker = LAD = V1-V4 anterior wall STEMI',
                'MECEE_PG,INI_CET,USMLE_STEP2CK',
            ],
            [
                'Q-SAMPLE-002',
                'Pharmacology',
                'Autonomic Nervous System',
                'MEDIUM',
                'A 34-year-old agricultural worker is brought to the emergency department unconscious, profusely sweating, salivating, and in respiratory distress. Pupils are 1 mm bilaterally and heart rate is 42 bpm. Which initial antidote should be administered immediately?',
                'Pralidoxime (2-PAM) monotherapy',
                'Pralidoxime regenerates AChE but works slowly and does not reverse central or muscarinic bronchospasm immediately.',
                'Atropine Sulfate IV',
                'Atropine is a competitive muscarinic antagonist that immediately reverses life-threatening bronchospasm, bronchorrhea, and bradycardia.',
                'Physostigmine',
                'Physostigmine is an AChE inhibitor and would worsen organophosphate toxicity.',
                'Naloxone IV',
                'Naloxone is indicated for opioid toxicity (pinpoint pupils with respiratory depression, but without hypersecretion/diaphoresis).',
                'B',
                'Select the first-line antidote for acute organophosphate toxidrome.',
                'Organophosphates irreversibly inhibit acetylcholinesterase, producing toxic accumulation of acetylcholine at muscarinic and nicotinic synapses.',
                'Excess muscarinic stimulation produces DUMBBELLS: Diarrhea, Urination, Miosis, Bradycardia, Bronchorrhea/Bronchospasm, Emesis, Lacrimation, Salivation.',
                'Intravenous Atropine titrated until pulmonary secretions clear is the immediate life-saving therapy, followed by Pralidoxime for enzyme regeneration.',
                'Atropine FIRST until lungs are dry, then 2-PAM to break the bond!',
                'COMBINED',
            ],
        ];

        $stream = fopen('php://memory', 'r+');
        fputcsv($stream, $headers);
        foreach ($sampleRows as $row) {
            fputcsv($stream, $row);
        }
        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);

        return $csv;
    }

    /**
     * Generate starter sample JSON string with realistic clinical vignettes.
     */
    public function getSampleJson(): string
    {
        $data = [
            'questions' => [
                [
                    'code' => 'Q-JSON-001',
                    'subject' => 'Pathology',
                    'topic' => 'Cell Injury and Adaptation',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 62-year-old woman with chronic poorly controlled hypertension dies from a catastrophic intracranial hemorrhage. Autopsy reveals a concentric thickening of the left ventricular myocardium with a left ventricular wall thickness of 18 mm (normal: 8-11 mm). Histopathology demonstrates enlarged myocytes with hyperchromatic "boxcar" nuclei. Which cellular adaptation is depicted?',
                    'correct_option' => 'A',
                    'options' => [
                        [
                            'option_key' => 'A',
                            'option_text' => 'Pathologic Hypertrophy',
                            'rationale' => 'Cardiac myocytes are permanent cells with no regenerative capacity; increased hemodynamic afterload forces cellular enlargement through synthesis of more myofilaments.',
                        ],
                        [
                            'option_key' => 'B',
                            'option_text' => 'Hyperplasia',
                            'rationale' => 'Hyperplasia involves an increase in cell number, which adult cardiac myocytes cannot undergo.',
                        ],
                        [
                            'option_key' => 'C',
                            'option_text' => 'Metaplasia',
                            'rationale' => 'Metaplasia is a reversible phenotypic change from one adult cell type to another (e.g. Barrett esophagus).',
                        ],
                        [
                            'option_key' => 'D',
                            'option_text' => 'Coagulative Necrosis',
                            'rationale' => 'Coagulative necrosis involves ghost outlines with nuclear pyknosis/karyorrhexis, seen in acute infarction rather than chronic hypertensive adaptation.',
                        ],
                    ],
                    'learning_objective' => 'Differentiate hypertrophy from hyperplasia and describe cardiac adaptive mechanisms.',
                    'foundation_explanation' => 'Permanent cells (neurons, cardiac myocytes, skeletal muscle cells) respond to increased hemodynamic workload exclusively through hypertrophy (increase in individual cell volume and protein synthesis).',
                    'integration_explanation' => 'Systemic hypertension increases left ventricular afterload, stimulating mechanical stretch receptors and alpha-adrenergic cascades leading to gene induction of ANP and fetal contractile proteins.',
                    'application_explanation' => 'Without pharmacologic afterload reduction (ACE inhibitors, ARBs), concentric hypertrophy compromises ventricular compliance and progresses to diastolic heart failure.',
                    'memory_peg' => 'Hearts only grow bigger (Hypertrophy), never multiply (Hyperplasia)!',
                    'relevant_exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1'],
                ],
            ],
        ];

        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}
