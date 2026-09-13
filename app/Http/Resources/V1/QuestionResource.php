<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        // Anti-scraping dynamic watermark payload
        $watermark = [
            'user_id' => $user?->id ?? 'anonymous',
            'user_email' => $user?->email ?? 'guest@cortex.med',
            'timestamp' => now()->toIso8601String(),
            'ip' => $request->ip(),
            'token' => substr(hash('sha256', ($user?->id ?? '0').$request->ip().now()->format('Y-m-d H')), 0, 12),
        ];

        return [
            'id' => $this->id,
            'code' => $this->code,
            'subject' => [
                'id' => $this->subject_id,
                'name' => $this->subject?->name,
                'slug' => $this->subject?->slug,
            ],
            'topic' => [
                'id' => $this->topic_id,
                'name' => $this->topic?->name,
                'slug' => $this->topic?->slug,
            ],
            'subtopic' => $this->subtopic ? [
                'id' => $this->subtopic_id,
                'name' => $this->subtopic->name,
            ] : null,
            'difficulty' => $this->difficulty,
            'question_type' => $this->question_type,
            'stem' => $this->stem,
            'image_url' => $this->image_url,
            'image_caption' => $this->image_caption,
            'correct_option' => $this->correct_option,
            'learning_objective' => $this->learning_objective,
            'foundation_explanation' => $this->foundation_explanation,
            'integration_explanation' => $this->integration_explanation,
            'application_explanation' => $this->application_explanation,
            'memory_peg' => $this->memory_peg,
            'options' => $this->options->sortBy('option_key')->values()->map(fn ($opt) => [
                'id' => $opt->id,
                'option_key' => $opt->option_key,
                'option_text' => $opt->option_text,
                'rationale' => $opt->rationale,
            ]),
            'exams' => $this->relevantExams->pluck('exam'),
            'watermark' => $watermark,
        ];
    }
}
