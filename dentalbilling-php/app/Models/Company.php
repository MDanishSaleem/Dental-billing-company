<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Company
{
    /** Featured/active companies for the homepage. */
    public static function featured(int $limit = 6): array
    {
        return Database::all(
            "SELECT c.*, ci.name AS city_name, ci.slug AS city_slug,
                    s.name AS state_name, s.slug AS state_slug, s.abbreviation
             FROM companies c
             JOIN cities ci ON ci.id = c.city_id
             JOIN states s  ON s.id = c.state_id
             WHERE c.status = 'ACTIVE'
             ORDER BY (c.tier = 'FEATURED') DESC, c.rating DESC, c.review_count DESC
             LIMIT {$limit}"
        );
    }

    public static function findBySlug(string $slug): ?array
    {
        return Database::first(
            "SELECT c.*, ci.name AS city_name, ci.slug AS city_slug,
                    s.name AS state_name, s.slug AS state_slug, s.abbreviation
             FROM companies c
             JOIN cities ci ON ci.id = c.city_id
             JOIN states s  ON s.id = c.state_id
             WHERE c.slug = ? LIMIT 1",
            [$slug]
        );
    }

    public static function countActive(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM companies WHERE status = 'ACTIVE'");
    }
}
