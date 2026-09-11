<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'code',
        'subject_id',
        'topic_id',
        'subtopic_id',
        'difficulty',
        'question_type',
        'stem',
        'image_url',
        'image_caption',
        'correct_option',
        'learning_objective',
        'foundation_explanation',
        'integration_explanation',
        'application_explanation',
        'memory_peg',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function subtopic(): BelongsTo
    {
        return $this->belongsTo(Subtopic::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuestionAttempt::class);
    }

    public function relevantExams(): HasMany
    {
        return $this->hasMany(QuestionExamRelevance::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(UserNoteBookmark::class);
    }

    public function srsQueue(): HasMany
    {
        return $this->hasMany(SpacedRepetitionQueue::class);
    }

    /**
     * Scope: Filter by Exam Pathway
     */
    public function scopeForExam(Builder $query, ?string $exam): Builder
    {
        if (! $exam || $exam === 'COMBINED') {
            return $query;
        }

        return $query->whereHas('relevantExams', function ($q) use ($exam) {
            $q->where('exam', $exam)->orWhere('exam', 'COMBINED');
        });
    }

    /**
     * Scope: Filter by Subject
     */
    public function scopeInSubject(Builder $query, mixed $subjectId): Builder
    {
        if (! $subjectId) {
            return $query;
        }

        return $query->where('subject_id', $subjectId);
    }

    /**
     * Scope: Filter by Topic
     */
    public function scopeInTopic(Builder $query, mixed $topicId): Builder
    {
        if (! $topicId) {
            return $query;
        }

        return $query->where('topic_id', $topicId);
    }

    /**
     * Scope: Filter by Difficulty
     */
    public function scopeDifficulty(Builder $query, ?string $difficulty): Builder
    {
        if (! $difficulty) {
            return $query;
        }

        return $query->where('difficulty', strtoupper($difficulty));
    }

    /**
     * Scope: Filter by User Attempt Status (Unused / Incorrect / Bookmarked / All)
     */
    public function scopeStatus(Builder $query, ?User $user, ?string $status): Builder
    {
        if (! $user || ! $status || $status === 'ALL') {
            return $query;
        }

        $upperStatus = strtoupper($status);

        if ($upperStatus === 'UNUSED') {
            return $query->whereDoesntHave('attempts', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        if ($upperStatus === 'INCORRECT') {
            return $query->whereHas('attempts', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('is_correct', false);
            });
        }

        if ($upperStatus === 'BOOKMARKED') {
            return $query->whereHas('bookmarks', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('is_bookmarked', true);
            });
        }

        if ($upperStatus === 'HAZARDOUS') {
            return $query->whereHas('attempts', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('is_correct', false)
                    ->where('confidence', 'HIGH');
            });
        }

        if ($upperStatus === 'UNSTABLE' || $upperStatus === 'LUCKY_GUESS') {
            return $query->whereHas('attempts', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('is_correct', true)
                    ->where(function ($c) {
                        $c->where('confidence', '!=', 'HIGH')
                            ->orWhereNull('confidence');
                    });
            });
        }

        if ($upperStatus === 'GAP') {
            return $query->whereHas('attempts', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('is_correct', false)
                    ->where(function ($c) {
                        $c->where('confidence', '!=', 'HIGH')
                            ->orWhereNull('confidence');
                    });
            });
        }

        if ($upperStatus === 'MASTERED') {
            return $query->whereHas('attempts', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('is_correct', true)
                    ->where('confidence', 'HIGH');
            });
        }

        return $query;
    }
}
