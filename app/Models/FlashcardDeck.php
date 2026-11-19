<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlashcardDeck extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'subject_id',
        'category',
        'cards_count',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'cards_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Flashcard::class, 'deck_id');
    }
}
