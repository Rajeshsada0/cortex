<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionExamRelevance extends Model
{
    public $timestamps = false;

    protected $table = 'question_exam_relevance';

    protected $fillable = [
        'question_id',
        'exam',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
