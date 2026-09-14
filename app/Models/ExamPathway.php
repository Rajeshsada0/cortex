<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamPathway extends Model
{
    use HasFactory;

    protected $table = 'exam_pathways';

    protected $fillable = [
        'code',
        'name',
        'full_name',
        'region',
        'total_questions',
        'duration_minutes',
        'correct_marks',
        'negative_marks',
        'scoring_type',
        'penalty_label',
        'badge_color',
        'blueprint_weights',
        'is_active',
        'is_system',
        'order_index',
    ];

    protected $casts = [
        'total_questions' => 'integer',
        'duration_minutes' => 'integer',
        'correct_marks' => 'float',
        'negative_marks' => 'float',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
        'order_index' => 'integer',
        'blueprint_weights' => 'array',
    ];

    public function questionRelevances(): HasMany
    {
        return $this->hasMany(QuestionExamRelevance::class, 'exam', 'code');
    }

    public function getAvailableQuestionsCount(): int
    {
        if ($this->code === 'COMBINED') {
            return Question::count();
        }

        return QuestionExamRelevance::whereIn('exam', [$this->code, 'COMBINED'])
            ->distinct('question_id')
            ->count('question_id');
    }
}
