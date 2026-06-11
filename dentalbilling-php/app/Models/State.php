<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class State
{
    public static function allActive(): array
    {
        return Database::all(
            "SELECT s.*,
                    (SELECT COUNT(*) FROM companies c WHERE c.state_id = s.id AND c.status='ACTIVE') AS company_count
             FROM states s
             WHERE s.active = 1
             ORDER BY s.name ASC"
        );
    }

    public static function popular(int $limit = 12): array
    {
        return Database::all(
            "SELECT s.*,
                    (SELECT COUNT(*) FROM companies c WHERE c.state_id = s.id AND c.status='ACTIVE') AS company_count
             FROM states s
             WHERE s.active = 1
             ORDER BY company_count DESC, s.name ASC
             LIMIT {$limit}"
        );
    }

    public static function count(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM states WHERE active = 1");
    }
}
