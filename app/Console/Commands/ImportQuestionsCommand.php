<?php

namespace App\Console\Commands;

use App\Domain\QuestionBank\QuestionImportService;
use App\Models\Subject;
use Illuminate\Console\Command;

class ImportQuestionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'questions:import
                            {file : Path to the CSV or JSON file}
                            {--pathway=* : Default exam pathways (e.g. COMBINED, INI_CET, NEET_PG, MECEE_PG)}
                            {--mode=fallback : Pathway mode (fallback or override)}
                            {--subject= : Default subject name or ID fallback}
                            {--draft : Publish questions as draft review instead of active}
                            {--chunk=500 : Batch transaction chunk size (default: 500)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Bulk import clinical MCQ questions from CSV or JSON file (supports MedMCQA, AIIMS, and standard formats)';

    /**
     * Execute the console command.
     */
    public function handle(QuestionImportService $importService): int
    {
        $filePath = $this->argument('file');

        if (! file_exists($filePath)) {
            $this->error("File not found: {$filePath}");

            return self::FAILURE;
        }

        $fileSizeMb = round(filesize($filePath) / (1024 * 1024), 2);
        $this->info("Opening file: {$filePath} ({$fileSizeMb} MB)...");

        $publishAsActive = ! $this->option('draft');
        $pathways = (array) $this->option('pathway');
        if (empty($pathways)) {
            $pathways = ['COMBINED'];
        }
        $pathwayMode = $this->option('mode') ?: 'fallback';
        $chunkSize = (int) ($this->option('chunk') ?: 500);

        // Subject resolution
        $defaultSubjectId = null;
        $subjectInput = $this->option('subject');
        if ($subjectInput) {
            $sub = Subject::where('id', $subjectInput)
                ->orWhere('name', 'like', "%{$subjectInput}%")
                ->orWhere('slug', $subjectInput)
                ->first();
            if ($sub) {
                $defaultSubjectId = $sub->id;
                $this->line("Default fallback subject: {$sub->name} (ID: {$sub->id})");
            }
        }

        $this->line("Starting high-speed batch import (chunk size: {$chunkSize})...");
        $startTime = microtime(true);

        $lastLogged = 0;
        $progressCallback = function (int $imported, int $failed) use (&$lastLogged) {
            if ($imported - $lastLogged >= 2000 || $imported < 2000) {
                $this->line(" → Processed {$imported} questions successfully (" . ($failed > 0 ? "{$failed} failed" : "0 failed") . ")...");
                $lastLogged = $imported;
            }
        };

        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        if ($ext === 'json') {
            $content = file_get_contents($filePath);
            $results = $importService->importFromJson(
                jsonContent: $content,
                publishAsActive: $publishAsActive,
                defaultSubjectId: $defaultSubjectId,
                defaultPathways: $pathways,
                pathwayMode: $pathwayMode,
                chunkSize: $chunkSize,
                progressCallback: $progressCallback
            );
        } else {
            $results = $importService->importFromCsvFile(
                filePath: $filePath,
                publishAsActive: $publishAsActive,
                defaultSubjectId: $defaultSubjectId,
                defaultPathways: $pathways,
                pathwayMode: $pathwayMode,
                chunkSize: $chunkSize,
                progressCallback: $progressCallback
            );
        }

        $duration = round(microtime(true) - $startTime, 2);

        $this->newLine();
        $this->info("========================================");
        $this->info("         IMPORT COMPLETED!              ");
        $this->info("========================================");
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Processed', $results['total']],
                ['Imported Successfully', $results['imported']],
                ['Failed Rows', $results['failed']],
                ['Elapsed Time', "{$duration} seconds"],
                ['Import Speed', ($duration > 0 ? round($results['imported'] / $duration, 1) : 0) . ' questions/sec'],
            ]
        );

        if (! empty($results['pathways_summary'])) {
            $this->newLine();
            $this->comment("Pathway Distribution:");
            $pathwayRows = [];
            foreach ($results['pathways_summary'] as $exam => $count) {
                $pathwayRows[] = [$exam, $count];
            }
            $this->table(['Pathway', 'Count'], $pathwayRows);
        }

        if (! empty($results['errors'])) {
            $this->newLine();
            $this->warn("First " . min(10, count($results['errors'])) . " Errors Preview:");
            foreach (array_slice($results['errors'], 0, 10) as $err) {
                $this->line(" - [Row {$err['row']}] {$err['identifier']}: " . implode('; ', $err['messages']));
            }
        }

        return self::SUCCESS;
    }
}
