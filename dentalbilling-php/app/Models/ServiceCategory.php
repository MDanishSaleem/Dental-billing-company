<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class ServiceCategory
{
    public static function all(): array
    {
        return Database::all(
            "SELECT sc.*,
                    (SELECT COUNT(DISTINCT cs.company_id)
                       FROM company_services cs WHERE cs.category_id = sc.id) AS company_count
             FROM service_categories sc
             ORDER BY sc.sort_order ASC, sc.name ASC"
        );
    }

    public static function findBySlug(string $slug): ?array
    {
        return Database::first("SELECT * FROM service_categories WHERE slug = ? LIMIT 1", [$slug]);
    }
}
