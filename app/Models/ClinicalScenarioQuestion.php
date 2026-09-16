<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicalScenarioQuestion extends Model
{
    use HasFactory;

    protected $table = 'clinical_scenario_questions';

    protected $fillable = [
        'clinical_scenario_id',
        'question_number',
        'stem',
        'options',
        'correct_option',
        'explanation',
        'order_index',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_option' => 'integer',
        'question_number' => 'integer',
        'order_index' => 'integer',
    ];

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(ClinicalScenario::class, 'clinical_scenario_id');
    }
}
