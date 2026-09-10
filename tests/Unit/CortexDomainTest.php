<?php

use App\Domain\Scoring\ConfidenceLevel;
use App\Domain\Scoring\ExamPathway;
use App\Domain\Scoring\MarkingEngine;
use App\Domain\SpacedRepetition\SpacedRepetitionService;

test('MarkingEngine computes pathway specific negative marks', function () {
    $engine = new MarkingEngine;

    // MECEE-PG: +1 / -0.25
    expect($engine->score(ExamPathway::MECEE_PG, 10, 4, 20))->toBe(9.0);

    // INI-CET: +1 / -0.33
    expect($engine->score(ExamPathway::INI_CET, 10, 3, 20))->toBe(9.01);

    // USMLE Step 1: % correct
    expect($engine->score(ExamPathway::USMLE_STEP1, 15, 5, 20))->toBe(75.0);

    // USMLE Step 2 CK: Scaled 3-digit score
    expect($engine->score(ExamPathway::USMLE_STEP2CK, 15, 5, 20))->toBeGreaterThan(200.0);
});

test('SpacedRepetitionService transitions correctly by accuracy and confidence', function () {
    $srs = new SpacedRepetitionService;

    // Incorrect resets to stage 0, 4 hours
    $t1 = $srs->transition(false, ConfidenceLevel::HIGH, 2);
    expect($t1->nextStage)->toBe(0);
    expect($t1->intervalDays)->toBe(0);

    // Correct + Low Confidence => Stage 1, 2 days
    $t2 = $srs->transition(true, ConfidenceLevel::LOW, 0);
    expect($t2->nextStage)->toBe(1);
    expect($t2->intervalDays)->toBe(2);

    // Correct + Medium Confidence => min(stage+1, 3)
    $t3 = $srs->transition(true, ConfidenceLevel::MEDIUM, 1);
    expect($t3->nextStage)->toBe(2);
    expect($t3->intervalDays)->toBe(7);

    // Correct + High Confidence => stage + 1, exponential interval
    $t4 = $srs->transition(true, ConfidenceLevel::HIGH, 2);
    expect($t4->nextStage)->toBe(3);
    expect($t4->intervalDays)->toBe(21);

    $t5 = $srs->transition(true, ConfidenceLevel::HIGH, 3);
    expect($t5->nextStage)->toBe(4);
    expect($t5->intervalDays)->toBe(45);
});
