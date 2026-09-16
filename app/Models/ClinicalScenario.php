<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClinicalScenario extends Model
{
    use HasFactory;

    protected $table = 'clinical_scenarios';

    protected $fillable = [
        'pathway_code',
        'discipline',
        'title',
        'stem',
        'vitals',
        'order_index',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order_index' => 'integer',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(ClinicalScenarioQuestion::class, 'clinical_scenario_id')
            ->orderBy('question_number')
            ->orderBy('order_index');
    }

    /**
     * Scope for a specific exam pathway or global
     */
    public function scopeForPathway(Builder $query, ?string $pathwayCode = null): Builder
    {
        if (empty($pathwayCode)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($pathwayCode) {
            $q->where('pathway_code', $pathwayCode)
                ->orWhereNull('pathway_code')
                ->orWhere('pathway_code', 'GLOBAL');
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
