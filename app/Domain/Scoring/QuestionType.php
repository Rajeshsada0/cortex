<?php

namespace App\Domain\Scoring;

enum QuestionType: string
{
    case SINGLE_BEST_ANSWER = 'SINGLE_BEST_ANSWER';
    case MULTIPLE_RESPONSE = 'MULTIPLE_RESPONSE';
    case EXTENDED_MATCHING = 'EXTENDED_MATCHING';
}
