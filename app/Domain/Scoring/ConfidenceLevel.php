<?php

namespace App\Domain\Scoring;

enum ConfidenceLevel: string
{
    case LOW = 'LOW';
    case MEDIUM = 'MEDIUM';
    case HIGH = 'HIGH';
}
