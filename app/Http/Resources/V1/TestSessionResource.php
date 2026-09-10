<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'session_type' => $this->session_type,
            'exam_pathway' => $this->exam_pathway,
            'total_questions' => $this->total_questions,
            'duration_seconds' => $this->duration_seconds,
            'time_spent_seconds' => $this->time_spent_seconds,
            'score_obtained' => (float) $this->score_obtained,
            'is_completed' => (bool) $this->is_completed,
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'attempts_count' => $this->attempts()->count(),
            'attempts' => $this->whenLoaded('attempts', fn () => $this->attempts->map(fn ($att) => [
                'id' => $att->id,
                'question_id' => $att->question_id,
                'selected_option' => $att->selected_option,
                'is_correct' => $att->is_correct,
                'confidence' => $att->confidence,
                'time_taken_seconds' => $att->time_taken_seconds,
                'was_switched' => $att->was_switched,
            ])),
        ];
    }
}
