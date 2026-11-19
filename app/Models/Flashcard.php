<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Flashcard extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'deck_id',
        'user_id',
        'question_id',
        'subject_id',
        'topic_id',
        'front',
        'back',
        'pearl',
        'difficulty',
        'is_high_yield',
        'is_past_year',
        'past_year',
    ];

    protected $casts = [
        'is_high_yield' => 'boolean',
        'is_past_year' => 'boolean',
    ];

    public function deck(): BelongsTo
    {
        return $this->belongsTo(FlashcardDeck::class, 'deck_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function scopeHighYield(Builder $query): Builder
    {
        return $query->where('is_high_yield', true);
    }

    public function scopePastYear(Builder $query): Builder
    {
        return $query->where('is_past_year', true);
    }
}
