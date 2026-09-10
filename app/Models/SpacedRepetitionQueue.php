<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpacedRepetitionQueue extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'spaced_repetition_queue';

    protected $fillable = [
        'user_id',
        'question_id',
        'repetition_stage',
        'next_review_due',
        'ease_factor',
        'interval_days',
        'consecutive_correct',
    ];

    protected $casts = [
        'next_review_due' => 'datetime',
        'repetition_stage' => 'integer',
        'interval_days' => 'integer',
        'consecutive_correct' => 'integer',
        'ease_factor' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
