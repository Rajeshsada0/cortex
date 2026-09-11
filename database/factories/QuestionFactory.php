<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\QuestionExamRelevance;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subject = Subject::inRandomOrder()->first();
        $topic = $subject ? Topic::where('subject_id', $subject->id)->inRandomOrder()->first() : null;

        $subjectCode = self::subjectCode($subject?->slug);
        $correctOption = fake()->randomElement(['A', 'B', 'C', 'D']);

        return [
            'id' => (string) Str::uuid(),
            'code' => 'Q-'.$subjectCode.'-'.fake()->unique()->numerify('####'),
            'subject_id' => $subject?->id ?? 1,
            'topic_id' => $topic?->id ?? 1,
            'subtopic_id' => null,
            'difficulty' => fake()->randomElement(['EASY', 'MEDIUM', 'HARD']),
            'question_type' => 'SINGLE_BEST_ANSWER',
            'stem' => fake()->paragraph(3).' Which of the following is the most likely diagnosis or appropriate next step in management?',
            'image_url' => null,
            'image_caption' => null,
            'correct_option' => $correctOption,
            'learning_objective' => 'Differentiate key clinical presentations and select evidence-based first-line management.',
            'foundation_explanation' => 'Anatomical and pathophysiological basis of the presentation.',
            'integration_explanation' => 'Cross-organ interplay and diagnostic lab or radiological findings.',
            'application_explanation' => 'Therapeutic protocol adhering to international clinical guidelines.',
            'memory_peg' => 'Clinical Mnemonic: Remember triad / pathognomonic sign.',
            'is_active' => true,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Question $question) {
            // Attach 4 options A, B, C, D if none exist
            if ($question->options()->count() === 0) {
                $options = ['A', 'B', 'C', 'D'];
                foreach ($options as $key) {
                    $isCorrect = ($key === $question->correct_option);
                    QuestionOption::create([
                        'id' => (string) Str::uuid(),
                        'question_id' => $question->id,
                        'option_key' => $key,
                        'option_text' => 'Option '.$key.': '.fake()->sentence(5),
                        'rationale' => $isCorrect
                            ? 'Correct. This aligns directly with current postgraduate clinical consensus.'
                            : 'Incorrect. This choice represents a common distractor in clinical practice.',
                    ]);
                }
            }

            // Attach exam relevance
            if (QuestionExamRelevance::where('question_id', $question->id)->count() === 0) {
                $exams = ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'];
                foreach ($exams as $exam) {
                    QuestionExamRelevance::create([
                        'question_id' => $question->id,
                        'exam' => $exam,
                    ]);
                }
            }
        });
    }

    /**
     * Indicate that question belongs to a specific subject.
     */
    public function forSubject(Subject|string $subject): static
    {
        return $this->state(function (array $attributes) use ($subject) {
            $subj = is_string($subject)
                ? (Subject::where('slug', $subject)->first() ?? Subject::where('name', $subject)->first())
                : $subject;

            $topic = $subj ? Topic::where('subject_id', $subj->id)->first() : null;
            $subjectCode = self::subjectCode($subj?->slug);

            return [
                'subject_id' => $subj?->id ?? $attributes['subject_id'],
                'topic_id' => $topic?->id ?? $attributes['topic_id'],
                'code' => 'Q-'.$subjectCode.'-'.fake()->unique()->numerify('####'),
            ];
        });
    }

    /**
     * Set specific difficulty level.
     */
    public function difficulty(string $level): static
    {
        return $this->state(fn () => ['difficulty' => $level]);
    }

    /**
     * Standard medical discipline abbreviation mapping.
     */
    public static function subjectCode(?string $slug): string
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
            default => 'GEN',
        };
    }
}
