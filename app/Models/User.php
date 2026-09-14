<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $active_pathway
 * @property Carbon|null $target_exam_date
 * @property int $daily_study_hours
 * @property int $daily_mcq_target
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'email',
    'is_admin',
    'password',
    'active_pathway',
    'target_exam_date',
    'daily_study_hours',
    'daily_mcq_target',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'target_exam_date' => 'date',
            'daily_study_hours' => 'integer',
            'daily_mcq_target' => 'integer',
        ];
    }

    protected $appends = [
        'pathway_label',
    ];

    public function getPathwayLabelAttribute(): string
    {
        $pathwayEnum = \App\Domain\Scoring\ExamPathway::tryFrom($this->active_pathway ?? 'INI_CET') ?? \App\Domain\Scoring\ExamPathway::INI_CET;
        return $pathwayEnum->label();
    }

    public function testSessions(): HasMany
    {
        return $this->hasMany(TestSession::class);
    }

    public function questionAttempts(): HasMany
    {
        return $this->hasMany(QuestionAttempt::class);
    }

    public function spacedRepetitionQueue(): HasMany
    {
        return $this->hasMany(SpacedRepetitionQueue::class);
    }

    public function bookmarksAndNotes(): HasMany
    {
        return $this->hasMany(UserNoteBookmark::class);
    }

    public function libraryFolders(): HasMany
    {
        return $this->hasMany(LibraryFolder::class);
    }
}
