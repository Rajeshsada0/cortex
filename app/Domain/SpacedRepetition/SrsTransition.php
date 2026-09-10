<?php

namespace App\Domain\SpacedRepetition;

use Carbon\CarbonInterface;

final class SrsTransition
{
    public function __construct(
        public readonly int $nextStage,
        public readonly CarbonInterface $nextReviewDue,
        public readonly int $intervalDays,
    ) {}
}
