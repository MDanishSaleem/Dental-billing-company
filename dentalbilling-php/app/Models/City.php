<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class City
{
    public static function bySlugInState(string $citySlug, string $stateSlug): ?array
    {
        return Database::first(
            "SELECT ci.*, s.name AS state_name, s.slug AS state_slug, s.abbreviation
             FROM cities ci JOIN states s ON s.id=ci.state_id
             WHERE ci.slug=? AND s.slug=? LIMIT 1",
            [$citySlug, $stateSlug]
        );
    }

    public static function forState(int $stateId): array
    {
        return Database::all(
            "SELECT ci.*,
                    (SELECT COUNT(*) FROM companies c WHERE c.city_id=ci.id AND c.status='ACTIVE') AS company_count
             FROM cities ci WHERE ci.state_id=? AND ci.active=1 ORDER BY ci.name", [$stateId]
        );
    }

    public static function all(): array
    {
        return Database::all(
            "SELECT ci.*, s.name AS state_name FROM cities ci JOIN states s ON s.id=ci.state_id
             ORDER BY s.name, ci.name"
        );
    }

    public static function setActive(int $id, int $active): void
    {
        Database::execute("UPDATE cities SET active=? WHERE id=?", [$active, $id]);
    }
}
