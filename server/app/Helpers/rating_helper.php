<?php

/**
 * @param int $number
 * @return int
 */
function transformRating(int $number): int {
    return match ($number) {
        1 => -2,
        2 => -1,
        4 => 1,
        5 => 2,
        default => 0,
    };
}