<?php

namespace App\Domain\Scoring;

enum DifficultyLevel: string
{
    case EASY = 'EASY';
    case MEDIUM = 'MEDIUM';
    case HARD = 'HARD';
}
