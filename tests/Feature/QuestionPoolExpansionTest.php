<?php

namespace Tests\Feature;

use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\CortexLargeQuestionPoolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionPoolExpansionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_question_factory_creates_complete_question_with_options_and_exams(): void
    {
        $question = Question::factory()->create([
            'difficulty' => 'HARD',
        ]);

        $this->assertNotNull($question->id);
        $this->assertEquals('HARD', $question->difficulty);
        $this->assertEquals(4, $question->options()->count());

        $optionKeys = $question->options()->pluck('option_key')->sort()->values()->toArray();
        $this->assertEquals(['A', 'B', 'C', 'D'], $optionKeys);

        $this->assertDatabaseHas('question_exam_relevance', [
            'question_id' => $question->id,
            'exam' => 'INI_CET',
        ]);
        $this->assertDatabaseHas('question_exam_relevance', [
            'question_id' => $question->id,
            'exam' => 'MECEE_PG',
        ]);
    }

    public function test_question_factory_for_subject_state(): void
    {
        $anatomy = Subject::where('slug', 'anatomy')->first();
        $this->assertNotNull($anatomy);

        $question = Question::factory()->forSubject($anatomy)->create();
        $this->assertEquals($anatomy->id, $question->subject_id);
        $this->assertStringStartsWith('Q-ANAT-', $question->code);
    }

    public function test_large_question_pool_seeder_populates_all_19_subjects(): void
    {
        $this->seed(CortexLargeQuestionPoolSeeder::class);

        $subjectsCount = Subject::count();
        $this->assertEquals(19, $subjectsCount);

        // Every single subject must have at least 10 questions
        $subjectsWithQuestions = Subject::has('questions', '>=', 10)->count();
        $this->assertEquals(19, $subjectsWithQuestions);

        // Total questions pool >= 200
        $this->assertGreaterThanOrEqual(200, Question::count());

        // Verify a 20-question mock session distributes questions across multiple disciplines
        $candidate = User::factory()->create(['active_pathway' => 'INI_CET']);
        $service = app(TestSessionService::class);
        $result = $service->createBlueprintMockSession(
            user: $candidate,
            pathway: ExamPathway::INI_CET,
            targetQuestions: 20,
            durationMinutes: 45
        );

        $session = $result['session'];
        $this->assertEquals(20, $session->attempts()->count());

        $representedSubjects = Question::whereIn('id', $session->attempts->pluck('question_id'))
            ->pluck('subject_id')
            ->unique()
            ->count();

        $this->assertGreaterThanOrEqual(5, $representedSubjects);
    }
}
