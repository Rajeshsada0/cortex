<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $typoReplacements = [
            'veebra' => 'vertebra',
            'veebrae' => 'vertebrae',
            'veebral' => 'vertebral',
            'interveebral' => 'intervertebral',
            'cailage' => 'cartilage',
            'cailages' => 'cartilages',
            'cailaginous' => 'cartilaginous',
            'fibrocailage' => 'fibrocartilage',
            'aicular' => 'articular',
            'aiculary' => 'articulary',
            'aiculation' => 'articulation',
            'paially' => 'partially',
            'fouh' => 'fourth',
            'neveheless' => 'nevertheless',
            'is form' => 'is from',
            'discloates' => 'dislocates',
            'synol' => 'synovial',
            'Temporomadibular' => 'Temporomandibular',
        ];

        $columns = ['stem', 'foundation_explanation', 'integration_explanation', 'memory_peg', 'learning_objective'];

        foreach ($columns as $col) {
            foreach ($typoReplacements as $bad => $good) {
                DB::table('questions')
                    ->where($col, 'LIKE', "%{$bad}%")
                    ->update([
                        $col => DB::raw("REPLACE({$col}, '{$bad}', '{$good}')")
                    ]);
            }
        }

        $optCols = ['option_text', 'rationale'];
        foreach ($optCols as $col) {
            foreach ($typoReplacements as $bad => $good) {
                DB::table('question_options')
                    ->where($col, 'LIKE', "%{$bad}%")
                    ->update([
                        $col => DB::raw("REPLACE({$col}, '{$bad}', '{$good}')")
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down rollback necessary for text typo cleanup
    }
};
