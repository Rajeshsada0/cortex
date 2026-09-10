<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionAttempt extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'session_id',
        'user_id',
        'question_id',
        'selected_option',
        'is_correct',
        'confidence',
        'time_taken_seconds',
        'was_switched',
        'initial_option',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'was_switched' => 'boolean',
        'time_taken_seconds' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(TestSession::class, 'session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
