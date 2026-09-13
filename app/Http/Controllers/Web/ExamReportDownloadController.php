<?php

namespace App\Http\Controllers\Web;

use App\Domain\Scoring\ExamPathway;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\TestSession;
use Illuminate\Http\Request;

class ExamReportDownloadController extends Controller
{
    /**
     * Downloadable / Printable Official Medical Examination Report
     */
    public function download(Request $request, string $id)
    {
        $session = TestSession::with([
            'user',
            'attempts.question.subject',
            'attempts.question.topic',
            'attempts.question.options',
        ])->findOrFail($id);

        $attempts = $session->attempts;
        $correct = $attempts->where('is_correct', true)->count();
        $incorrect = $attempts->where('is_correct', false)->count();
        $unanswered = max(0, $session->total_questions - $attempts->count());

        $attemptedQuestionIds = $attempts->pluck('question_id')->filter();
        $questions = Question::whereIn('id', $attemptedQuestionIds)
            ->with(['subject', 'topic', 'options'])
            ->get();

        $pathway = ExamPathway::tryFrom($session->exam_pathway) ?? ExamPathway::INI_CET;
        $penaltyRate = $pathway->penaltyPerIncorrect();
        $pointsPerCorrect = $pathway->pointsPerCorrect();
        $maxPossibleScore = $pathway->maxScore($session->total_questions);

        // Subject Breakdown
        $subjectBreakdown = [];
        foreach ($questions->groupBy('subject_id') as $subjId => $qGroup) {
            $subjName = $qGroup->first()->subject?->name ?? 'Clinical Specialty';
            $subjQIds = $qGroup->pluck('id');
            $subjAttempts = $attempts->whereIn('question_id', $subjQIds)->whereNotNull('selected_option');

            $sCorrect = $subjAttempts->where('is_correct', true)->count();
            $sIncorrect = $subjAttempts->where('is_correct', false)->count();
            $sUnanswered = max(0, $qGroup->count() - $subjAttempts->count());
            $sPenalty = round($sIncorrect * $penaltyRate, 2);
            $sNetScore = round(($sCorrect * $pointsPerCorrect) - $sPenalty, 2);
            $sAccuracy = $subjAttempts->count() > 0 ? round(($sCorrect / $subjAttempts->count()) * 100, 1) : 0;

            $subjectBreakdown[] = [
                'name' => $subjName,
                'total' => $qGroup->count(),
                'correct' => $sCorrect,
                'incorrect' => $sIncorrect,
                'unanswered' => $sUnanswered,
                'penalty_lost' => $sPenalty,
                'net_score' => $sNetScore,
                'accuracy' => $sAccuracy,
            ];
        }

        $accuracy = $attempts->count() > 0 ? round(($correct / $attempts->count()) * 100, 1) : 0;
        $totalPenalty = round($incorrect * $penaltyRate, 2);

        // Attempts mapped by question_id
        $attemptsMap = $attempts->keyBy('question_id');

        return view('reports.exam_scorecard', [
            'session' => $session,
            'pathway' => $pathway,
            'stats' => [
                'score' => (float) $session->score_obtained,
                'maxMarks' => $maxPossibleScore,
                'total' => $session->total_questions,
                'correct' => $correct,
                'incorrect' => $incorrect,
                'unanswered' => $unanswered,
                'accuracy' => $accuracy,
                'penalty_lost' => $totalPenalty,
                'timeSpentMinutes' => round($session->time_spent_seconds / 60, 1),
            ],
            'subjectBreakdown' => $subjectBreakdown,
            'questions' => $questions,
            'attemptsMap' => $attemptsMap,
        ]);
    }
}
