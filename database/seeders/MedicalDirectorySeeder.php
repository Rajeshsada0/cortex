<?php

namespace Database\Seeders;

use App\Models\ExamPathway;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\QuestionExamRelevance;
use App\Models\QuestionOption;
use App\Models\SpacedRepetitionQueue;
use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\TestSession;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MedicalDirectorySeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Seeding 19-Subject Medical Directory curriculum & question bank...');

        // 1. Seed or retrieve primary candidate user (Dr. Cortex)
        $user = User::firstOrCreate(
            ['email' => 'dr.cortex@example.com'],
            [
                'name' => 'Dr. Aayush Sharma, MBBS',
                'is_admin' => true,
                'password' => bcrypt('password123'),
                'active_pathway' => 'INI_CET',
                'target_exam_date' => Carbon::now()->addMonths(4)->toDateString(),
                'daily_study_hours' => 7,
                'daily_mcq_target' => 120,
            ]
        );

        // 2. Full 19 Medical Subjects & Topic Hierarchy
        $curriculum = $this->getCurriculumData();

        $allTopicsMap = [];
        $allSubjectsMap = [];

        foreach ($curriculum as $sData) {
            $subject = Subject::updateOrCreate(
                ['slug' => $sData['slug']],
                [
                    'name' => $sData['name'],
                    'icon_key' => $sData['icon_key'],
                    'order_index' => $sData['order_index'],
                ]
            );

            $allSubjectsMap[$subject->slug] = $subject;

            foreach ($sData['topics'] as $tData) {
                $topic = Topic::updateOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'slug' => $tData['slug'],
                    ],
                    [
                        'name' => $tData['name'],
                        'high_yield_priority' => $tData['priority'],
                    ]
                );

                $allTopicsMap[$sData['slug']][$tData['slug']] = $topic;

                foreach ($tData['subtopics'] as $stName) {
                    Subtopic::firstOrCreate([
                        'topic_id' => $topic->id,
                        'name' => $stName,
                    ]);
                }
            }
        }

        $this->command?->info('All 19 Medical Subjects, Topics, and Subtopics synced.');

        // 3. Clinical Questions Bank across all 19 subjects
        $questionsPool = $this->getCuratedDirectoryQuestions();
        $seededQuestionIds = [];

        $exams = ['INI_CET', 'NEET_PG', 'MECEE_PG', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'];

        foreach ($curriculum as $sData) {
            $subject = $allSubjectsMap[$sData['slug']];
            $topics = $allTopicsMap[$sData['slug']];
            $subjectCode = $this->getSubjectCode($sData['slug']);

            $curatedItems = $questionsPool[$sData['slug']] ?? [];
            $itemIndex = 1;

            // Seed hand-crafted clinical vignettes
            foreach ($curatedItems as $qData) {
                $topic = $topics[$qData['topic_slug']] ?? reset($topics);
                $code = sprintf('DIR-%s-%03d', $subjectCode, $itemIndex++);

                $qId = $this->seedQuestionRecord($subject, $topic, $code, $qData, $exams);
                $seededQuestionIds[$subject->id][] = $qId;
            }

            // Ensure every topic has at least 3-4 questions by adding domain vignettes
            foreach ($sData['topics'] as $tData) {
                $topic = $topics[$tData['slug']];
                $existingCount = Question::where('subject_id', $subject->id)->where('topic_id', $topic->id)->count();
                $targetForTopic = 3;

                for ($k = $existingCount; $k < $targetForTopic; $k++) {
                    $code = sprintf('DIR-%s-%03d', $subjectCode, $itemIndex++);
                    $generatedVignette = $this->generateClinicalVignette($subject->name, $topic->name, $k);
                    $this->seedQuestionRecord($subject, $topic, $code, $generatedVignette, $exams);
                }
            }

            // Collect all active question IDs for this subject
            $seededQuestionIds[$subject->id] = Question::where('subject_id', $subject->id)
                ->where('is_active', true)
                ->pluck('id')
                ->toArray();
        }

        $totalQuestionsSeeded = Question::where('is_active', true)->count();
        $this->command?->info("Verified Active Question Pool: {$totalQuestionsSeeded} questions.");

        // 4. Seed Realistic Candidate Attempts & Directory Progress
        // This gives Dr. Cortex realistic Coverage & Mastery metrics for every subject
        $this->seedCandidateAttempts($user, $seededQuestionIds);

        $this->command?->info('19-Subject Medical Directory successfully seeded!');
    }

    private function seedQuestionRecord(Subject $subject, Topic $topic, string $code, array $data, array $exams): string
    {
        $question = Question::updateOrCreate(
            ['code' => $code],
            [
                'subject_id' => $subject->id,
                'topic_id' => $topic->id,
                'subtopic_id' => null,
                'difficulty' => $data['difficulty'] ?? 'MEDIUM',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => $data['stem'],
                'image_url' => $data['image_url'] ?? null,
                'image_caption' => $data['image_caption'] ?? null,
                'correct_option' => $data['correct_option'],
                'learning_objective' => $data['learning_objective'],
                'foundation_explanation' => $data['foundation_explanation'],
                'integration_explanation' => $data['integration_explanation'],
                'application_explanation' => $data['application_explanation'],
                'memory_peg' => $data['memory_peg'] ?? null,
                'is_active' => true,
            ]
        );

        // Options
        foreach ($data['options'] as $opt) {
            QuestionOption::updateOrCreate(
                [
                    'question_id' => $question->id,
                    'option_key' => $opt['option_key'],
                ],
                [
                    'id' => (string) Str::uuid(),
                    'option_text' => $opt['option_text'],
                    'rationale' => $opt['rationale'],
                ]
            );
        }

        // Exam Relevance across all 6 national & international pathways
        foreach ($exams as $exam) {
            QuestionExamRelevance::firstOrCreate([
                'question_id' => $question->id,
                'exam' => $exam,
            ]);
        }

        return $question->id;
    }

    private function seedCandidateAttempts(User $user, array $seededQuestionIds): void
    {
        // Create baseline test session
        $session = TestSession::firstOrCreate(
            [
                'user_id' => $user->id,
                'title' => '19-Subject Medical Directory Diagnostic Baseline',
            ],
            [
                'session_type' => 'PRACTICE',
                'exam_pathway' => $user->active_pathway ?? 'INI_CET',
                'total_questions' => 120,
                'duration_seconds' => 5400,
                'time_spent_seconds' => 4820,
                'score_obtained' => 92.00,
                'is_completed' => true,
                'started_at' => Carbon::now()->subDays(2),
                'completed_at' => Carbon::now()->subDays(2)->addMinutes(80),
            ]
        );

        // Target subject coverage distributions (simulate realistic studying patterns)
        $targetCoveragePct = [
            1 => 0.75, // General Medicine 75%
            2 => 0.65, // Surgery 65%
            3 => 0.60, // OBGYN 60%
            4 => 0.55, // Pediatrics 55%
            5 => 0.80, // Pathology 80%
            6 => 0.70, // Pharmacology 70%
            7 => 0.50, // Microbiology 50%
            8 => 0.85, // Anatomy 85%
            9 => 0.65, // Physiology 65%
            10 => 0.60, // Biochemistry 60%
            11 => 0.45, // Forensic 45%
            12 => 0.50, // PSM 50%
            13 => 0.45, // ENT 45%
            14 => 0.55, // Ophthalmology 55%
            15 => 0.60, // Orthopedics 60%
            16 => 0.65, // Dermatology 65%
            17 => 0.50, // Psychiatry 50%
            18 => 0.40, // Radiology 40%
            19 => 0.45, // Anesthesiology 45%
        ];

        foreach ($seededQuestionIds as $subjectId => $qIds) {
            $totalInSubject = count($qIds);
            $fractionToAttempt = $targetCoveragePct[$subjectId] ?? 0.50;
            $attemptCount = (int) ceil($totalInSubject * $fractionToAttempt);

            for ($i = 0; $i < $attemptCount; $i++) {
                $qId = $qIds[$i];
                $question = Question::find($qId);
                if (! $question) continue;

                // 80% pass accuracy rate on attempted questions
                $isCorrect = ($i % 5 !== 0);
                $selectedOpt = $isCorrect ? $question->correct_option : ($question->correct_option === 'A' ? 'B' : 'A');

                QuestionAttempt::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'question_id' => $qId,
                    ],
                    [
                        'session_id' => $session->id,
                        'selected_option' => $selectedOpt,
                        'is_correct' => $isCorrect,
                        'confidence' => $isCorrect ? 'HIGH' : 'MEDIUM',
                        'time_taken_seconds' => rand(30, 85),
                        'was_switched' => false,
                        'initial_option' => $selectedOpt,
                        'created_at' => Carbon::now()->subHours(rand(2, 48)),
                    ]
                );

                // Add Spaced Repetition queue review card
                SpacedRepetitionQueue::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'question_id' => $qId,
                    ],
                    [
                        'repetition_stage' => $isCorrect ? rand(2, 4) : 1,
                        'ease_factor' => 2.50,
                        'interval_days' => $isCorrect ? rand(3, 14) : 1,
                        'consecutive_correct' => $isCorrect ? rand(2, 5) : 0,
                        'next_review_due' => $isCorrect ? Carbon::now()->addDays(rand(1, 10)) : Carbon::now(),
                    ]
                );

                // Add selective bookmarks with clinical notes on select questions
                if ($i === 0 || $i === 3) {
                    UserNoteBookmark::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'question_id' => $qId,
                        ],
                        [
                            'is_bookmarked' => true,
                            'note_content' => "High-Yield {$question->subject?->name} pearl: Review diagnostic landmarks and distractor rationales before grand mock.",
                        ]
                    );
                }
            }
        }
    }

    private function getSubjectCode(string $slug): string
    {
        return match ($slug) {
            'general-medicine' => 'MED',
            'general-surgery' => 'SURG',
            'obstetrics-gynecology' => 'OBGY',
            'pediatrics' => 'PED',
            'pathology' => 'PATH',
            'pharmacology' => 'PHARM',
            'microbiology' => 'MICR',
            'anatomy' => 'ANAT',
            'physiology' => 'PHYS',
            'biochemistry' => 'BIOC',
            'forensic-medicine' => 'FMT',
            'community-medicine' => 'PSM',
            'ent' => 'ENT',
            'ophthalmology' => 'OPHT',
            'orthopedics' => 'ORTH',
            'dermatology' => 'DERM',
            'psychiatry' => 'PSYC',
            'radiology' => 'RAD',
            'anesthesiology' => 'ANES',
            default => strtoupper(substr(str_replace('-', '', $slug), 0, 4)),
        };
    }

    private function generateClinicalVignette(string $subjectName, string $topicName, int $index): array
    {
        $correct = ['A', 'B', 'C', 'D'][$index % 4];

        $stems = [
            "A 52-year-old patient presents to the medical center with signs and laboratory markers indicative of an active {$topicName} process in {$subjectName}. Based on current evidence-based clinical guidelines, which of the following is the most appropriate next step in management or definitive diagnosis?",
            "During a grand rounds case review on {$subjectName}, a candidate presents a patient with characteristic features of {$topicName}. Physical examination reveals cardinal diagnostic findings. Which of the following pathophysiological mechanisms or clinical choices is most accurate?",
            "A 38-year-old individual is evaluated for refractory symptoms related to {$topicName}. Initial conservative stabilization has been performed. Which of the following investigations or pharmacologic choices is the gold-standard recommendation?",
        ];

        $stem = $stems[$index % count($stems)];

        return [
            'difficulty' => ['EASY', 'MEDIUM', 'HARD'][$index % 3],
            'stem' => $stem,
            'correct_option' => $correct,
            'learning_objective' => "Master high-yield clinical decision making and diagnostic rationales for {$topicName} in {$subjectName}.",
            'foundation_explanation' => "The core anatomical and physiological basis of {$topicName} dictates targeted therapeutic intervention to halt disease progression.",
            'integration_explanation' => "Differential diagnosis requires careful exclusion of mimics while confirming characteristic clinical, radiographic, and biomarker criteria.",
            'application_explanation' => "Option {$correct} represents the definitive gold-standard guideline recommendation recognized across international postgraduate medical examinations.",
            'memory_peg' => "High-Yield {$subjectName}: Remember key diagnostic criteria and first-line protocol for {$topicName}.",
            'options' => [
                [
                    'option_key' => 'A',
                    'option_text' => $correct === 'A' ? "First-line guideline-recommended protocol for {$topicName}" : "Observation without targeted medical intervention",
                    'rationale' => $correct === 'A' ? "Correct! This is the definitive first-line recommendation." : "Distractor. Inappropriate management that risks clinical deterioration.",
                ],
                [
                    'option_key' => 'B',
                    'option_text' => $correct === 'B' ? "Targeted diagnostic evaluation and therapeutic administration for {$topicName}" : "Empiric broad-spectrum therapy without diagnostic confirmation",
                    'rationale' => $correct === 'B' ? "Correct! Diagnostic confirmation accompanied by targeted protocol is indicated." : "Distractor. Unfocused therapy can obscure true etiology.",
                ],
                [
                    'option_key' => 'C',
                    'option_text' => $correct === 'C' ? "Definitive curative procedural or pharmacologic management for {$topicName}" : "Immediate invasive surgical exploration prior to stabilization",
                    'rationale' => $correct === 'C' ? "Correct! Standard guideline-endorsed curative approach." : "Distractor. Premature surgical intervention increases perioperative risk.",
                ],
                [
                    'option_key' => 'D',
                    'option_text' => $correct === 'D' ? "Evidence-based multi-agent regimen according to postgraduate consensus" : "Discontinuation of all standard therapies and 6-month follow-up",
                    'rationale' => $correct === 'D' ? "Correct! Multi-agent consensus approach yields optimal long-term outcomes." : "Distractor. Contraindicated in progressive symptomatic illness.",
                ],
            ],
        ];
    }

    private function getCurriculumData(): array
    {
        return [
            [
                'name' => 'General Medicine',
                'slug' => 'general-medicine',
                'icon_key' => 'Stethoscope',
                'order_index' => 1,
                'topics' => [
                    ['name' => 'Cardiology & Acute Coronary Syndromes', 'slug' => 'cardiology-acs', 'priority' => 3, 'subtopics' => ['STEMI vs NSTEMI Guidelines', 'Arrhythmias & ECG Interpretation', 'Heart Failure (AHA/ACC)', 'Infective Endocarditis Duke']],
                    ['name' => 'Pulmonology & Critical Care', 'slug' => 'pulmonology-critical-care', 'priority' => 3, 'subtopics' => ['ARDS Berlin Criteria', 'COPD & Asthma Step Therapy', 'Pulmonary Embolism CTPA', 'Community-Acquired Pneumonia']],
                    ['name' => 'Nephrology & Acid-Base', 'slug' => 'nephrology-acid-base', 'priority' => 2, 'subtopics' => ['Anion Gap Metabolic Acidosis', 'Glomerulonephritis Spectrum', 'AKI RIFLE & KDIGO', 'Electrolyte Emergencies']],
                    ['name' => 'Endocrinology & Metabolism', 'slug' => 'endocrinology-metabolism', 'priority' => 3, 'subtopics' => ['Diabetic Ketoacidosis & HHS', 'Thyroid Storm & Myxedema', 'Adrenal Insufficiency', 'Pituitary Adenomas']],
                    ['name' => 'Gastroenterology & Hepatology', 'slug' => 'gastroenterology-hepatology', 'priority' => 2, 'subtopics' => ['Cirrhosis & Portal Hypertension', 'IBD Extraintestinal Signs', 'Upper GI Bleeding Protocol', 'Acute Pancreatitis']],
                    ['name' => 'Neurology & Acute Stroke', 'slug' => 'neurology-stroke', 'priority' => 3, 'subtopics' => ['Thrombolysis Window', 'Secondary Stroke Prevention', 'Parkinsonism & Movement Disorders', 'Epilepsy & Status Epilepticus']],
                ],
            ],
            [
                'name' => 'General Surgery',
                'slug' => 'general-surgery',
                'icon_key' => 'Scissors',
                'order_index' => 2,
                'topics' => [
                    ['name' => 'Acute Abdomen & Trauma ATLS', 'slug' => 'acute-abdomen-trauma', 'priority' => 3, 'subtopics' => ['FAST Exam in Hemoperitoneum', 'Bowel Obstruction & Perforation', 'Splenic & Liver Injury Grading', 'Damage Control Surgery']],
                    ['name' => 'Surgical Oncology & Breast Cancers', 'slug' => 'surgical-oncology-breast', 'priority' => 2, 'subtopics' => ['Triple Negative Breast Carcinoma', 'Colorectal Adenocarcinoma', 'Thyroid Nodules Bethesda', 'Sentinel Node Biopsy']],
                    ['name' => 'Hepatobiliary & Pancreatic Surgery', 'slug' => 'hepatobiliary-pancreas', 'priority' => 3, 'subtopics' => ['Calot Triangle Boundaries', 'Acute Pancreatitis Ranson', 'Biliary Atresia & Choledochal Cysts', 'Hydatid Cyst Liver']],
                    ['name' => 'Vascular Surgery & Aortic Aneurysms', 'slug' => 'vascular-surgery', 'priority' => 2, 'subtopics' => ['Abdominal Aortic Aneurysm', 'Acute Limb Ischemia (6 Ps)', 'Carotid Artery Stenosis', 'Varicose Veins & DVT']],
                    ['name' => 'Hernias & Abdominal Wall Defects', 'slug' => 'hernias', 'priority' => 3, 'subtopics' => ['Direct vs Indirect Inguinal', 'Femoral Incarceration Risk', 'Laparoscopic Mesh Repair', 'Strangulation Signs']],
                ],
            ],
            [
                'name' => 'Obstetrics & Gynecology',
                'slug' => 'obstetrics-gynecology',
                'icon_key' => 'Baby',
                'order_index' => 3,
                'topics' => [
                    ['name' => 'High-Risk Obstetrics & Preeclampsia', 'slug' => 'high-risk-obstetrics', 'priority' => 3, 'subtopics' => ['Preeclampsia & Magnesium Sulfate', 'HELLP Syndrome', 'Gestational Diabetes Mellitus', 'Rh Isoimmunization']],
                    ['name' => 'Obstetric Hemorrhage (APH & PPH)', 'slug' => 'obstetric-hemorrhage', 'priority' => 3, 'subtopics' => ['Placenta Previa vs Abruptio', 'Uterine Atony (4 Ts)', 'Bakri Balloon & B-Lynch Suture', 'Disseminated Intravascular Coagulation']],
                    ['name' => 'Labor Mechanics & Partogram', 'slug' => 'labor-mechanics', 'priority' => 3, 'subtopics' => ['Breech & Malpresentations', 'Partogram Alert & Action Lines', 'Instrumental Delivery', 'Shoulder Dystocia HELPERR']],
                    ['name' => 'Gynecologic Oncology', 'slug' => 'gynecologic-oncology', 'priority' => 3, 'subtopics' => ['Cervical Cancer Screening (FIGO)', 'Ovarian Epithelial Tumors', 'Endometrial Hyperplasia', 'Gestational Trophoblastic Disease']],
                    ['name' => 'Reproductive Endocrinology & Infertility', 'slug' => 'reproductive-endocrinology', 'priority' => 2, 'subtopics' => ['PCOS Rotterdam Criteria', 'Primary Amenorrhea Workup', 'Endometriosis Management', 'Assisted Reproductive Technology']],
                ],
            ],
            [
                'name' => 'Pediatrics',
                'slug' => 'pediatrics',
                'icon_key' => 'Smile',
                'order_index' => 4,
                'topics' => [
                    ['name' => 'Neonatology & Perinatal Emergencies', 'slug' => 'neonatology-perinatal', 'priority' => 3, 'subtopics' => ['Neonatal Resuscitation Protocol (NRP)', 'Respiratory Distress Syndrome (Surfactant)', 'Neonatal Jaundice & Kernicterus', 'Necrotizing Enterocolitis']],
                    ['name' => 'Congenital Heart Diseases', 'slug' => 'congenital-heart-diseases', 'priority' => 3, 'subtopics' => ['Tetralogy of Fallot Spells', 'Transposition of Great Arteries', 'Ventricular Septal Defect Eisenmenger', 'Coarctation of Aorta']],
                    ['name' => 'Pediatric Infectious Diseases & Exanthems', 'slug' => 'pediatric-infections', 'priority' => 3, 'subtopics' => ['Kawasaki Disease Criteria', 'Measles Koplik Spots & Vitamin A', 'Croup vs Acute Epiglottitis', 'Febrile Seizures']],
                    ['name' => 'Growth, Milestones & Severe Malnutrition', 'slug' => 'growth-milestones-nutrition', 'priority' => 2, 'subtopics' => ['Developmental Milestones Red Flags', 'Severe Acute Malnutrition (SAM) F-75/100', 'Rickets & Vitamin Deficiencies', 'Failure to Thrive']],
                ],
            ],
            [
                'name' => 'Pathology',
                'slug' => 'pathology',
                'icon_key' => 'Microscope',
                'order_index' => 5,
                'topics' => [
                    ['name' => 'Cellular Injury & Inflammation', 'slug' => 'cell-injury-inflammation', 'priority' => 3, 'subtopics' => ['Coagulative vs Liquefactive Necrosis', 'Apoptosis Extrinsic & Intrinsic Pathways', 'Granulomatous Inflammation', 'Complement & Leukocyte Extravasation']],
                    ['name' => 'Neoplasia & Tumor Genetics', 'slug' => 'neoplasia-genetics', 'priority' => 3, 'subtopics' => ['p53 & Rb Checkpoints', 'Proto-oncogenes vs Suppressors', 'Paraneoplastic Syndromes', 'Tumor Grading & TNM Staging']],
                    ['name' => 'Hematopathology & Lymphomas', 'slug' => 'hematopathology-lymphomas', 'priority' => 3, 'subtopics' => ['Acute Leukemias (AML vs ALL)', 'Hodgkin Reed-Sternberg vs NHL', 'Multiple Myeloma & Monoclonal Gammopathy', 'Hemolytic Anemias Peripheral Smear']],
                    ['name' => 'Systemic Renal & Cardiovascular Pathology', 'slug' => 'renal-cardio-pathology', 'priority' => 3, 'subtopics' => ['Nephrotic vs Nephritic Syndromes', 'Atherosclerosis Vulnerable Plaque', 'Myocardial Infarction Histologic Timeline', 'Glomerulonephritis Crescentic']],
                ],
            ],
            [
                'name' => 'Pharmacology',
                'slug' => 'pharmacology',
                'icon_key' => 'Pill',
                'order_index' => 6,
                'topics' => [
                    ['name' => 'Autonomic & Cardiovascular Drugs', 'slug' => 'cardiovascular-drugs', 'priority' => 3, 'subtopics' => ['Antiarrhythmics (Vaughan Williams)', 'Antihypertensives in CKD & Diabetes', 'Beta-Blocker & Digoxin Toxicity', 'Heart Failure Neurohormonal Blockade']],
                    ['name' => 'Antimicrobial Chemotherapy', 'slug' => 'antimicrobial-chemotherapy', 'priority' => 3, 'subtopics' => ['Beta-lactams, MRSA & Vancomycin', 'Aminoglycoside Nephro/Ototoxicity', 'Antitubercular Drug Toxicities & Regimens', 'Antifungals Mechanism']],
                    ['name' => 'Neuropharmacology & Psychotropics', 'slug' => 'neuropharmacology', 'priority' => 3, 'subtopics' => ['Antiepileptics Spectrum & Teratogenicity', 'Atypical Antipsychotics Metabolic Risk', 'Lithium & SSRI Serotonin Syndrome', 'Opioid Reversal & Naloxone']],
                    ['name' => 'Toxicology & Antidote Protocols', 'slug' => 'toxicology-antidotes', 'priority' => 3, 'subtopics' => ['Organophosphates & Atropine/Pralidoxime', 'Paracetamol & N-Acetylcysteine', 'Methanol & Fomepizole', 'Carbon Monoxide Oxygenation']],
                ],
            ],
            [
                'name' => 'Microbiology',
                'slug' => 'microbiology',
                'icon_key' => 'Bug',
                'order_index' => 7,
                'topics' => [
                    ['name' => 'Systemic Bacteriology & Resistance', 'slug' => 'bacteriology-resistance', 'priority' => 3, 'subtopics' => ['Staph Aureus Toxins & MRSA', 'Strep Pneumoniae Bile Solubility', 'Clostridioides Difficile Pseudomembranous', 'Gram-Negative Enterics & ESBL']],
                    ['name' => 'Clinical Virology & Hepatitis', 'slug' => 'clinical-virology', 'priority' => 3, 'subtopics' => ['Hepatitis B Serology Panel Interpretation', 'HIV Antigens & Window Period', 'Herpesviridae Spectrum & Encephalitis', 'Influenza Antigenic Shift vs Drift']],
                    ['name' => 'Medical Parasitology & Mycology', 'slug' => 'parasitology-mycology', 'priority' => 2, 'subtopics' => ['Malaria Falciparum Smear & Cerebral Malaria', 'Amebic Liver Abscess Anchovy Sauce', 'Cryptococcus India Ink & Amphotericin', 'Aspergillus vs Mucor Rhinocerebral']],
                ],
            ],
            [
                'name' => 'Anatomy',
                'slug' => 'anatomy',
                'icon_key' => 'Bone',
                'order_index' => 8,
                'topics' => [
                    ['name' => 'Neuroanatomy & Cranial Nerves', 'slug' => 'neuroanatomy-cranial-nerves', 'priority' => 3, 'subtopics' => ['Brainstem Syndromes (Wallenberg, Weber)', 'Cavernous Sinus Anatomy', 'Cranial Nerve Foramina & Base of Skull', 'Circle of Willis & Aneurysm Sites']],
                    ['name' => 'Upper & Lower Limb Compartments', 'slug' => 'limb-anatomy', 'priority' => 3, 'subtopics' => ['Brachial Plexus Lesions (Erb vs Klumpke)', 'Carpal Tunnel Flexor Retinaculum', 'Femoral Triangle NAVEL Contents', 'Common Fibular Nerve Foot Drop']],
                    ['name' => 'Thorax, Abdomen & Pelvis Relations', 'slug' => 'trunk-anatomy', 'priority' => 3, 'subtopics' => ['Coronary Artery Dominance', 'Hesselbach Triangle Boundaries', 'Morison Pouch Dependent Space', 'Pudendal Nerve Block Landmark']],
                ],
            ],
            [
                'name' => 'Physiology',
                'slug' => 'physiology',
                'icon_key' => 'Activity',
                'order_index' => 9,
                'topics' => [
                    ['name' => 'Cardiovascular Dynamics & Pressures', 'slug' => 'cardiovascular-dynamics', 'priority' => 3, 'subtopics' => ['Wiggers Diagram & Murmurs', 'Pressure-Volume Loops & Contractility', 'Frank-Starling Law', 'Arterial Baroreceptor Reflex']],
                    ['name' => 'Respiratory Mechanics & Gas Exchange', 'slug' => 'respiratory-mechanics', 'priority' => 3, 'subtopics' => ['V/Q Mismatch vs Anatomical Shunt', 'Oxygen-Hemoglobin Dissociation Curve', 'Lung Compliance & Surfactant', 'Control of Breathing Chemoreceptors']],
                    ['name' => 'Renal Physiology & Fluid Balance', 'slug' => 'renal-physiology', 'priority' => 3, 'subtopics' => ['GFR Autoregulation & Tubuloglomerular', 'Countercurrent Multiplier Loop of Henle', 'RAAS Activation & Aldosterone', 'Acid-Base Renal Compensation']],
                ],
            ],
            [
                'name' => 'Biochemistry',
                'slug' => 'biochemistry',
                'icon_key' => 'Dna',
                'order_index' => 10,
                'topics' => [
                    ['name' => 'Carbohydrate & Lipid Metabolism', 'slug' => 'carbohydrate-lipid-metabolism', 'priority' => 3, 'subtopics' => ['Glycolysis Regulatory Enzymes', 'Glycogen Storage Diseases (Von Gierke, Pompe)', 'Lipoprotein Lipase & Familial Hyperlipidemia', 'Diabetic Ketoacidosis Ketogenesis']],
                    ['name' => 'Amino Acid Metabolism & Inborn Errors', 'slug' => 'amino-acid-inborn-errors', 'priority' => 3, 'subtopics' => ['Phenylketonuria (PKU)', 'Maple Syrup Urine Disease', 'Homocystinuria & Marfanoid Features', 'Urea Cycle Defects & Hyperammonemia']],
                    ['name' => 'Molecular Biology, DNA Repair & Genetics', 'slug' => 'molecular-biology-genetics', 'priority' => 3, 'subtopics' => ['DNA Repair Defects (Xeroderma Pigmentosum)', 'Polymerase Chain Reaction (PCR)', 'Blotting Techniques (Southern, Northern, Western)', 'Epigenetics & Genomic Imprinting']],
                ],
            ],
            [
                'name' => 'Forensic Medicine',
                'slug' => 'forensic-medicine',
                'icon_key' => 'Scale',
                'order_index' => 11,
                'topics' => [
                    ['name' => 'Thanatology & Forensic Traumatology', 'slug' => 'thanatology-traumatology', 'priority' => 3, 'subtopics' => ['Rigor, Algor & Livor Mortis Postmortem Interval', 'Firearm Entry vs Exit Wound Characteristics', 'Hanging vs Ligature Strangulation', 'Defense Wounds & Hesitation Cuts']],
                    ['name' => 'Clinical Toxicology & Corrosive Poisoning', 'slug' => 'forensic-toxicology', 'priority' => 3, 'subtopics' => ['Organophosphates Garlic Odor', 'Heavy Metal Poisoning (Lead, Arsenic Mees Lines)', 'Snake Envenomation Syndromes', 'Strychnine Convulsions']],
                    ['name' => 'Medical Jurisprudence, Consent & Ethics', 'slug' => 'medical-jurisprudence-ethics', 'priority' => 2, 'subtopics' => ['Bolam Test Medical Negligence', 'Res Ipsa Loquitur', 'Informed Consent Exceptions', 'Dying Declaration Procedures']],
                ],
            ],
            [
                'name' => 'Community Medicine (PSM)',
                'slug' => 'community-medicine',
                'icon_key' => 'Users',
                'order_index' => 12,
                'topics' => [
                    ['name' => 'Epidemiological Study Designs', 'slug' => 'epidemiology-study-designs', 'priority' => 3, 'subtopics' => ['Randomized Controlled Trials (RCT)', 'Cohort vs Case-Control Studies', 'Odds Ratio vs Relative Risk', 'Confounding & Bias Mitigation']],
                    ['name' => 'Biostatistics & Diagnostic Screening', 'slug' => 'biostatistics-screening', 'priority' => 3, 'subtopics' => ['Sensitivity & Specificity Calculations', 'Positive & Negative Predictive Values', 'Type I (Alpha) & Type II (Beta) Errors', 'Normal Distribution & Standard Deviation']],
                    ['name' => 'Public Health Programs & Disease Surveillance', 'slug' => 'public-health-programs', 'priority' => 2, 'subtopics' => ['National Tuberculosis Elimination Program (NTEP)', 'Universal Immunization Schedule (UIP)', 'Maternal & Infant Mortality Rates (MMR/IMR)', 'Biomedical Waste Color Coding']],
                ],
            ],
            [
                'name' => 'ENT (Otorhinolaryngology)',
                'slug' => 'ent',
                'icon_key' => 'Ear',
                'order_index' => 13,
                'topics' => [
                    ['name' => 'Otology, CSOM & Cholesteatoma', 'slug' => 'otology-csom', 'priority' => 3, 'subtopics' => ['Safe vs Unsafe CSOM Perforation', 'Cholesteatoma Attic Retraction Pocket', 'Mastoiditis & Bezold Abscess', 'Otosclerosis & Carhart Notch']],
                    ['name' => 'Audiology, Hearing Loss & Vertigo', 'slug' => 'audiology-vertigo', 'priority' => 3, 'subtopics' => ['Rinne & Weber Tuning Fork Tests', 'Pure Tone Audiometry (PTA)', 'Ménière Disease Triad', 'Benign Paroxysmal Positional Vertigo (BPPV)']],
                    ['name' => 'Rhinology, Laryngology & Head-Neck', 'slug' => 'rhino-laryngology', 'priority' => 2, 'subtopics' => ['Little Area Kiesselbach Epistaxis', 'Peritonsillar Abscess (Quinsy)', 'Recurrent Laryngeal Nerve Palsy', 'Juvenile Nasopharyngeal Angiofibroma']],
                ],
            ],
            [
                'name' => 'Ophthalmology',
                'slug' => 'ophthalmology',
                'icon_key' => 'Eye',
                'order_index' => 14,
                'topics' => [
                    ['name' => 'Retina & Vascular Retinopathies', 'slug' => 'retina-vascular', 'priority' => 3, 'subtopics' => ['Diabetic Retinopathy (NPDR vs PDR)', 'Hypertensive Retinopathy Keith-Wagener', 'Central Retinal Artery Occlusion (Cherry Red Spot)', 'Rhegmatogenous Retinal Detachment']],
                    ['name' => 'Glaucoma & Optic Neuropathies', 'slug' => 'glaucoma-optic-neuropathies', 'priority' => 3, 'subtopics' => ['Acute Angle-Closure Glaucoma Triad', 'Primary Open-Angle Glaucoma Cupping', 'Optic Neuritis & MS RAPD Marcus Gunn', 'Papilledema vs Papillitis']],
                    ['name' => 'Cornea, Cataract & Refraction', 'slug' => 'cornea-cataract', 'priority' => 2, 'subtopics' => ['Dendritic Corneal Ulcer (HSV)', 'Cataract Types & Phacoemulsification', 'IOL Power SRK Formula', 'Keratoconus Munson Sign']],
                ],
            ],
            [
                'name' => 'Orthopedics',
                'slug' => 'orthopedics',
                'icon_key' => 'Accessibility',
                'order_index' => 15,
                'topics' => [
                    ['name' => 'Trauma, Fractures & Compartment Syndrome', 'slug' => 'trauma-fractures-compartment', 'priority' => 3, 'subtopics' => ['Compartment Syndrome 6 Ps & Fasciotomy', 'Femoral Neck Fracture Garden Classification', 'Supracondylar Fracture Volkmann Ischemia', 'Colles vs Smith Fracture']],
                    ['name' => 'Bone Tumors & Radiology', 'slug' => 'bone-tumors-radiology', 'priority' => 3, 'subtopics' => ['Osteosarcoma Codman Triangle & Sunburst', 'Ewing Sarcoma Onion Skin Pattern', 'Giant Cell Tumor Soap Bubble', 'Osteoid Osteoma Night Pain']],
                    ['name' => 'Pediatric Orthopedics & Joint Infections', 'slug' => 'pediatric-orthopedics-infections', 'priority' => 2, 'subtopics' => ['CTEV Clubfoot Ponseti Casting', 'Developmental Dysplasia Hip Barlow/Ortolani', 'Acute Osteomyelitis Sequestrum vs Involucrum', 'Septic Arthritis Kocher Criteria']],
                ],
            ],
            [
                'name' => 'Dermatology',
                'slug' => 'dermatology',
                'icon_key' => 'Sparkles',
                'order_index' => 16,
                'topics' => [
                    ['name' => 'Papulosquamous & Autoimmune Bullous', 'slug' => 'papulosquamous-bullous-diseases', 'priority' => 3, 'subtopics' => ['Pemphigus Vulgaris (Desmoglein 3) Nikolsky', 'Bullous Pemphigoid Subepidermal Tense', 'Psoriasis Auspitz Sign & Koebner', 'Lichen Planus Wickham Striae']],
                    ['name' => 'Dermatologic Emergencies & Drug Reactions', 'slug' => 'derm-emergencies-reactions', 'priority' => 3, 'subtopics' => ['Stevens-Johnson Syndrome / Toxic Epidermal Necrolysis', 'DRESS Syndrome Eosinophilia', 'Melanoma ABCDE Criteria & Breslow Depth', 'Erythema Multiforme Target Lesions']],
                    ['name' => 'Infectious Dermatology & Hansen Disease', 'slug' => 'infectious-derm-hansen', 'priority' => 2, 'subtopics' => ['Leprosy Ridley-Jopling Classification', 'Type 1 vs Type 2 Lepra Reactions', 'Tinea Corporis Active Advancing Border', 'Scabies Burrows & Permethrin 5%']],
                ],
            ],
            [
                'name' => 'Psychiatry',
                'slug' => 'psychiatry',
                'icon_key' => 'Brain',
                'order_index' => 17,
                'topics' => [
                    ['name' => 'Psychotic & Mood Disorders', 'slug' => 'psychotic-mood-disorders', 'priority' => 3, 'subtopics' => ['Schizophrenia Schneider First-Rank Symptoms', 'Bipolar I vs Bipolar II & Mania DIGFAST', 'Major Depressive Disorder SIGECAPS', 'Lithium Toxicity Range & Tremors']],
                    ['name' => 'Anxiety, OCD & Stress Disorders', 'slug' => 'anxiety-ocd-stress', 'priority' => 2, 'subtopics' => ['Panic Attack Hyperventilation & SSRI', 'Obsessive-Compulsive Disorder ERP', 'Post-Traumatic Stress Disorder (PTSD)', 'Generalized Anxiety Disorder (GAD)']],
                    ['name' => 'Substance Use & Withdrawal Emergencies', 'slug' => 'substance-withdrawal-emergencies', 'priority' => 3, 'subtopics' => ['Delirium Tremens CIWA Protocol', 'Wernicke Encephalopathy Triad & Thiamine', 'Opioid Overdose Pinpoint Pupils Naloxone', 'Neuroleptic Malignant Syndrome vs Serotonin']],
                ],
            ],
            [
                'name' => 'Radiology',
                'slug' => 'radiology',
                'icon_key' => 'Scan',
                'order_index' => 18,
                'topics' => [
                    ['name' => 'Emergency Chest & Vascular Imaging', 'slug' => 'emergency-chest-vascular-imaging', 'priority' => 3, 'subtopics' => ['CTPA Pulmonary Embolism Filling Defect', 'Aortic Dissection Intimal Flap', 'Pneumoperitoneum Subdiaphragmatic Air', 'Pneumothorax Deep Sulcus Sign']],
                    ['name' => 'Emergency Neuroimaging (Stroke & Trauma)', 'slug' => 'emergency-neuroimaging', 'priority' => 3, 'subtopics' => ['Non-Contrast Head CT Acute Hemorrhage Hyperdense', 'DWI / ADC Mismatch Acute Ischemic Stroke', 'Epidural Biconvex vs Subdural Crescent Hematoma', 'Diffuse Axonal Injury Gray-White Interface']],
                    ['name' => 'Abdominal & Contrast Radiology', 'slug' => 'abdominal-contrast-radiology', 'priority' => 2, 'subtopics' => ['Small Bowel Obstruction Step-Ladder Loops', 'Target Sign / Pseudokidney in Intussusception', 'Barium Swallow Bird-Beak Achalasia', 'Radiation Safety ALARA & Lead Shielding']],
                ],
            ],
            [
                'name' => 'Anesthesiology',
                'slug' => 'anesthesiology',
                'icon_key' => 'Syringe',
                'order_index' => 19,
                'topics' => [
                    ['name' => 'Airway Assessment & Critical Resuscitation', 'slug' => 'airway-assessment-resuscitation', 'priority' => 3, 'subtopics' => ['Difficult Airway Algorithm & Mallampati Classes', 'Rapid Sequence Induction (RSI) Suxamethonium', 'Capnography ETCO2 Waveform Loss', 'ACLS Shockable vs Non-Shockable Rhythms']],
                    ['name' => 'General & Regional Neuraxial Anesthesia', 'slug' => 'general-regional-anesthesia', 'priority' => 3, 'subtopics' => ['Local Anesthetic Systemic Toxicity (LAST) Intralipid', 'Spinal vs Epidural Tuffier Line L4-L5', 'Post-Dural Puncture Headache Epidural Blood Patch', 'Malignant Hyperthermia Dantrolene Protocol']],
                    ['name' => 'Critical Care Monitoring & Anesthetic Agents', 'slug' => 'critical-care-anesthetic-agents', 'priority' => 2, 'subtopics' => ['Propofol Infusion Syndrome (PRIS)', 'Sevoflurane Minimum Alveolar Concentration (MAC)', 'Neuromuscular Blockade Sugammadex vs Neostigmine', 'Invasive Arterial Line & Central Venous Pressure']],
                ],
            ],
        ];
    }

    private function getCuratedDirectoryQuestions(): array
    {
        return [
            'anatomy' => [
                [
                    'topic_slug' => 'neuroanatomy-cranial-nerves',
                    'difficulty' => 'HARD',
                    'stem' => 'A 64-year-old male presents with sudden-onset vertigo, ataxia, dysphagia, and hoarseness. Neurological examination reveals ipsilateral loss of pain and temperature over the face, contralateral loss of pain and temperature over the torso and limbs, ipsilateral Horner syndrome (ptosis, miosis, anhidrosis), and ataxia. Gag reflex is diminished on the left side. Occlusion of which artery is most likely responsible for this constellation of findings?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Identify Lateral Medullary Syndrome (Wallenberg syndrome) resulting from Posterior Inferior Cerebellar Artery (PICA) or vertebral artery thrombosis.',
                    'foundation_explanation' => 'The lateral medulla is supplied by the Posterior Inferior Cerebellar Artery (PICA), a major branch of the vertebral artery.',
                    'integration_explanation' => 'Ischemia of the nucleus ambiguus produces dysphagia and hoarseness (CN IX, X). Ischemia of spinal trigeminal nucleus causes ipsilateral facial sensory loss; spinothalamic tract ischemia causes contralateral body sensory loss; descending sympathetic tract ischemia causes Horner syndrome.',
                    'application_explanation' => 'PICA occlusion produces the classic classic triad of Wallenberg syndrome. CT/MRI brainstem diffusion confirms the lateral medullary infarction.',
                    'memory_peg' => 'Wallenberg = PICA: Don’t pick a (PICA) horse (hoarseness) that can’t eat (dysphagia)!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Anterior Inferior Cerebellar Artery (AICA)', 'rationale' => 'Distractor. AICA occlusion causes lateral pontine syndrome with ipsilateral facial paralysis and deafness.'],
                        ['option_key' => 'B', 'option_text' => 'Anterior Spinal Artery (ASA)', 'rationale' => 'Distractor. ASA occlusion causes medial medullary syndrome with contralateral hemiparesis and tongue deviation.'],
                        ['option_key' => 'C', 'option_text' => 'Posterior Inferior Cerebellar Artery (PICA)', 'rationale' => 'Correct! PICA supplies the dorsolateral medulla; occlusion causes classic Wallenberg syndrome.'],
                        ['option_key' => 'D', 'option_text' => 'Basilar Artery tip', 'rationale' => 'Distractor. Basilar tip occlusion produces visual defects, altered consciousness, and locked-in state.'],
                    ],
                ],
                [
                    'topic_slug' => 'limb-anatomy',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 24-year-old motorcyclist sustains a mid-shaft fracture of the right humerus in a road accident. Physical examination reveals an inability to extend the right wrist (wrist drop) and loss of sensation over the dorsal aspect of the first web space between the thumb and index finger. Which nerve passes directly in the spiral (radial) groove of the humerus and is damaged?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Correlate mid-shaft humeral fractures with radial nerve injury producing wrist drop and dorsal web space anesthesia.',
                    'foundation_explanation' => 'The radial nerve courses in the spiral groove (radial sulcus) along the posterior aspect of the humeral shaft alongside the profunda brachii artery.',
                    'integration_explanation' => 'Fracture of the mid-shaft humerus mechanically compresses or severs the radial nerve, paralyzing the wrist and finger extensors.',
                    'application_explanation' => 'Conservative management with splinting and close electrodiagnostic monitoring is initial standard for closed neuropraxia injuries.',
                    'memory_peg' => 'Mid-shaft Humerus = Radial Nerve (Wrist Drop). Surgical Neck = Axillary. Medial Epicondyle = Ulnar.',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Radial Nerve', 'rationale' => 'Correct! Midshaft humerus fractures directly endanger the radial nerve in the spiral groove.'],
                        ['option_key' => 'B', 'option_text' => 'Median Nerve', 'rationale' => 'Distractor. Median nerve is injured in supracondylar humerus fractures and carpal tunnel syndrome.'],
                        ['option_key' => 'C', 'option_text' => 'Axillary Nerve', 'rationale' => 'Distractor. Axillary nerve curves around the surgical neck of humerus and is injured in anterior shoulder dislocations.'],
                        ['option_key' => 'D', 'option_text' => 'Musculocutaneous Nerve', 'rationale' => 'Distractor. Musculocutaneous pierces coracobrachialis and innervates anterior arm flexors.'],
                    ],
                ],
            ],
            'physiology' => [
                [
                    'topic_slug' => 'cardiovascular-dynamics',
                    'difficulty' => 'HARD',
                    'stem' => 'In a healthy 28-year-old male volunteer undergoing cardiac catheterization, which event on the cardiac pressure-volume loop corresponds precisely to the closure of the aortic valve?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Identify cardiac cycle phases on the Left Ventricular Pressure-Volume loop and correlate the dicrotic notch / S2 with aortic valve closure.',
                    'foundation_explanation' => 'On the LV PV loop, isovolumetric relaxation begins immediately upon aortic valve closure at the end of systolic ejection.',
                    'integration_explanation' => 'The top-left corner of the PV loop represents the end-systolic point (End-Systolic Volume and Pressure); closure of the aortic semilunar valve generates the second heart sound (S2).',
                    'application_explanation' => 'Understanding the end-systolic pressure-volume relationship (ESPVR) is critical for assessing myocardial contractility independent of loading conditions.',
                    'memory_peg' => 'Bottom-Right = Mitral Closes (S1). Top-Left = Aortic Closes (S2). Bottom-Left = Mitral Opens.',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'The bottom-right corner of the loop (End-Diastolic Volume)', 'rationale' => 'Distractor. Bottom-right marks mitral valve closure (end of ventricular filling and generation of S1).'],
                        ['option_key' => 'B', 'option_text' => 'The bottom-left corner of the loop', 'rationale' => 'Distractor. Bottom-left marks mitral valve opening and onset of rapid diastolic ventricular filling.'],
                        ['option_key' => 'C', 'option_text' => 'The top-left corner of the loop (End-Systolic Volume)', 'rationale' => 'Correct! Aortic valve closes at the top-left corner, ending ejection and starting isovolumetric relaxation.'],
                        ['option_key' => 'D', 'option_text' => 'The peak ventricular systolic pressure', 'rationale' => 'Distractor. Peak systolic pressure occurs during rapid ejection while the aortic valve is still wide open.'],
                    ],
                ],
                [
                    'topic_slug' => 'respiratory-mechanics',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 45-year-old female presents with progressive dyspnea. Pulmonary function testing demonstrates a normal FEV1/FVC ratio (82%), but both Total Lung Capacity (TLC) and Residual Volume (RV) are decreased to 65% of predicted. Diffusing capacity for carbon monoxide (DLCO) is reduced. Which of the following is the most consistent diagnosis?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Differentiate restrictive lung disease (normal/high FEV1/FVC, reduced TLC and DLCO) from obstructive airway patterns.',
                    'foundation_explanation' => 'Restrictive lung diseases impair lung expansion, leading to proportional reductions in both FEV1 and FVC, preserving or elevating the FEV1/FVC ratio.',
                    'integration_explanation' => 'Intrinsic parenchymal restrictive diseases like idiopathic pulmonary fibrosis cause alveolar septal thickening and collagen deposition, markedly reducing gas diffusion (DLCO).',
                    'application_explanation' => 'Idiopathic pulmonary fibrosis and connective tissue ILDs require high-resolution CT (HRCT) confirming a usual interstitial pneumonia (UIP) pattern with honeycombing.',
                    'memory_peg' => 'Restrictive: Ratio is Preserved (>70%), TLC is Restricted (<80%), DLCO drops in parenchymal disease.',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Severe Bronchial Asthma', 'rationale' => 'Distractor. Asthma produces obstructive defect with FEV1/FVC < 70% and elevated residual volume.'],
                        ['option_key' => 'B', 'option_text' => 'Idiopathic Pulmonary Fibrosis (Interstitial Lung Disease)', 'rationale' => 'Correct! Classic intrinsic restrictive pattern with reduced TLC and impaired DLCO.'],
                        ['option_key' => 'C', 'option_text' => 'Centrilobular Emphysema', 'rationale' => 'Distractor. Emphysema is obstructive with hyperinflated TLC and elevated RV/TLC ratio.'],
                        ['option_key' => 'D', 'option_text' => 'Myasthenia Gravis diaphragmatic weakness', 'rationale' => 'Distractor. Extrinsic chest wall/neuromuscular restriction maintains normal DLCO.'],
                    ],
                ],
            ],
            'pathology' => [
                [
                    'topic_slug' => 'hematopathology-lymphomas',
                    'difficulty' => 'HARD',
                    'stem' => 'A 26-year-old male presents with painless enlargement of left supracervical lymph nodes and low-grade Pel-Ebstein fevers with drenching night sweats. Lymph node excisional biopsy reveals large binucleated giant cells with prominent eosinophilic inclusion-like nucleoli resembling "owl eyes", surrounded by an inflammatory background of lymphocytes, histiocytes, and eosinophils. Immunohistochemistry shows the malignant cells are CD15+ and CD30+, but CD45-. What is the definitive diagnosis?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Identify Hodgkin Lymphoma by identifying pathognomonic Reed-Sternberg cells and diagnostic CD15+ / CD30+ immunophenotype.',
                    'foundation_explanation' => 'Reed-Sternberg (RS) cells are neoplastic giant cells of germinal center B-cell origin characteristic of Classical Hodgkin Lymphoma.',
                    'integration_explanation' => 'The binucleated owl-eyed cells secrete cytokines that recruit reactive non-neoplastic inflammatory cells (eosinophils, lymphocytes, plasma cells).',
                    'application_explanation' => 'Staging requires whole-body PET-CT. Initial chemotherapy regimen is ABVD (Adriamycin, Bleomycin, Vinblastine, Dacarbazine).',
                    'memory_peg' => 'Reed-Sternberg = CD15 + CD30 (Owl Eyes Hodgkin: 15 x 2 = 30!).',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Classical Hodgkin Lymphoma (Nodular Sclerosing)', 'rationale' => 'Correct! Reed-Sternberg cells with CD15+ and CD30+ immunophenotype define Classical Hodgkin Lymphoma.'],
                        ['option_key' => 'B', 'option_text' => 'Burkitt Lymphoma with c-MYC translocation', 'rationale' => 'Distractor. Burkitt lymphoma exhibits "starry sky" appearance, t(8;14), and CD20+/CD10+ markers.'],
                        ['option_key' => 'C', 'option_text' => 'Multiple Myeloma', 'rationale' => 'Distractor. Myeloma features malignant plasma cells with clock-face chromatin, CD138+, and lytic lesions.'],
                        ['option_key' => 'D', 'option_text' => 'Follicular Lymphoma with t(14;18) BCL2', 'rationale' => 'Distractor. Follicular lymphoma shows crowded cleave-cell follicles without binucleated RS giant cells.'],
                    ],
                ],
            ],
            'pharmacology' => [
                [
                    'topic_slug' => 'toxicology-antidotes',
                    'difficulty' => 'HARD',
                    'stem' => 'A 32-year-old farmer is brought to the resuscitation bay unconscious following pesticide exposure. Examination reveals pinpoint pupils (miosis), excessive salivation, lacrimation, diffuse wheezing with bronchorrhea, bradycardia (44 bpm), urinary incontinence, and skeletal muscle fasciculations. Intravenous Atropine is initiated. Which critical co-therapy must be administered promptly to reactivate phosphorylated acetylcholinesterase at the neuromuscular junction?',
                    'correct_option' => 'D',
                    'learning_objective' => 'Recognize Organophosphate Poisoning and understand that Pralidoxime (2-PAM) reactivates acetylcholinesterase before chemical aging occurs.',
                    'foundation_explanation' => 'Organophosphates irreversibly inhibit acetylcholinesterase by phosphorylating the esteratic active site, leading to massive acetylcholine accumulation.',
                    'integration_explanation' => 'Atropine competitively blocks muscarinic receptors (clearing bronchorrhea and bradycardia), but does NOT treat nicotinic neuromuscular junction receptor overstimulation (fasciculations, muscle paralysis).',
                    'application_explanation' => 'Pralidoxime (2-PAM) is an oxime that breaks the phosphate-enzyme bond, regenerating active enzyme if administered before covalent aging occurs.',
                    'memory_peg' => 'Atropine = Muscarinic symptoms (DUMBBELSS). Pralidoxime = Nicotinic / Skeletal muscle power!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Physostigmine', 'rationale' => 'Lethal error. Physostigmine is an acetylcholinesterase inhibitor that would worsen toxic crisis.'],
                        ['option_key' => 'B', 'option_text' => 'N-Acetylcysteine', 'rationale' => 'Distractor. N-Acetylcysteine is the antidote for acetaminophen hepatotoxicity, not organophosphates.'],
                        ['option_key' => 'C', 'option_text' => 'Flumazenil', 'rationale' => 'Distractor. Flumazenil is a competitive antagonist for benzodiazepines.'],
                        ['option_key' => 'D', 'option_text' => 'Pralidoxime (2-PAM)', 'rationale' => 'Correct! 2-PAM removes the organophosphate group and regenerates active acetylcholinesterase.'],
                    ],
                ],
            ],
            'microbiology' => [
                [
                    'topic_slug' => 'clinical-virology',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 34-year-old healthcare worker is tested after an accidental needlestick injury. Serologic evaluation reveals: HBsAg negative, Anti-HBs positive (240 mIU/mL), Anti-HBc (total) negative, Anti-HCV negative. Which of the following is the correct clinical interpretation of these viral markers?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Interpret Hepatitis B serologic profiles to distinguish vaccination immunity from resolved natural infection.',
                    'foundation_explanation' => 'Recombinant Hepatitis B vaccine consists solely of purified Hepatitis B Surface Antigen (HBsAg).',
                    'integration_explanation' => 'Vaccination stimulates anti-HBs antibodies without exposure to core components; hence, Anti-HBc antibodies remain strictly negative.',
                    'application_explanation' => 'Anti-HBs titer > 10 mIU/mL provides protective clinical immunity. No post-exposure immunoglobulin or booster is required.',
                    'memory_peg' => 'Isolated Anti-HBs (+) = Successful Vaccination. Anti-HBs (+) WITH Anti-HBc (+) = Natural Infection Resolved.',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Acute Hepatitis B infection in the window period', 'rationale' => 'Distractor. Window period features negative HBsAg and negative Anti-HBs, but positive Anti-HBc IgM.'],
                        ['option_key' => 'B', 'option_text' => 'Chronic Hepatitis B with low viral replication', 'rationale' => 'Distractor. Chronic Hepatitis B requires persistent HBsAg positivity (> 6 months).'],
                        ['option_key' => 'C', 'option_text' => 'Immunity due to Hepatitis B vaccination', 'rationale' => 'Correct! Isolated anti-HBs positivity with negative anti-HBc confirms vaccine-induced immunity.'],
                        ['option_key' => 'D', 'option_text' => 'Immunity following natural Hepatitis B infection', 'rationale' => 'Distractor. Natural resolved infection leaves lifelong positive anti-HBc IgG alongside anti-HBs.'],
                    ],
                ],
            ],
        ];
    }
}
