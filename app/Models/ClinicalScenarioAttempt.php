<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicalScenarioAttempt extends Model
{
    use HasFactory;

    protected $table = 'clinical_scenario_attempts';

    protected $fillable = [
        'user_id',
        'pathway_code',
        'total_stations',
        'total_questions',
        'total_score',
        'percentage',
        'is_passed',
        'time_spent_seconds',
        'station_results',
    ];

    protected $casts = [
        'station_results' => 'array',
        'is_passed' => 'boolean',
        'total_stations' => 'integer',
        'total_questions' => 'integer',
        'total_score' => 'integer',
        'percentage' => 'float',
        'time_spent_seconds' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
