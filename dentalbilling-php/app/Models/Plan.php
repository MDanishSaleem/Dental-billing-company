<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Plan
{
    public static function active(): array
    {
        return Database::all(
            "SELECT * FROM plans WHERE active = 1 ORDER BY price ASC"
        );
    }
}
