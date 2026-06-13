<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class State
{
    private const WITH_COUNT =
        "SELECT s.*,
                (SELECT COUNT(*) FROM companies c WHERE c.state_id=s.id AND c.status='ACTIVE') AS company_count
         FROM states s";

    public static function allActive(): array
    {
        return Database::all(self::WITH_COUNT . " WHERE s.active=1 ORDER BY s.name");
    }

    public static function popular(int $limit = 12): array
    {
        return Database::all(
            self::WITH_COUNT . " WHERE s.active=1 ORDER BY company_count DESC, s.name LIMIT " . (int) $limit
        );
    }

    public static function findBySlug(string $slug): ?array
    {
        return Database::first(self::WITH_COUNT . " WHERE s.slug=? LIMIT 1", [$slug]);
    }

    /** Resolve a state from a CSV value: full name, 2-letter abbreviation, or slug. */
    public static function findByNameOrAbbr(string $q): ?array
    {
        $q = trim($q);
        if ($q === '') {
            return null;
        }
        return Database::first(
            "SELECT * FROM states WHERE name=? OR abbreviation=? OR slug=? LIMIT 1",
            [$q, strtoupper($q), slugify($q)]
        );
    }

    public static function all(): array
    {
        return Database::all("SELECT * FROM states ORDER BY name");
    }

    public static function count(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM states WHERE active=1");
    }

    public static function setActive(int $id, int $active): void
    {
        Database::execute("UPDATE states SET active=? WHERE id=?", [$active, $id]);
    }
}
