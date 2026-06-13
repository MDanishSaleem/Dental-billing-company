<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Company
{
    private const SELECT =
        "c.*, ci.name AS city_name, ci.slug AS city_slug,
         s.name AS state_name, s.slug AS state_slug, s.abbreviation";

    private const JOINS =
        "FROM companies c
         JOIN cities ci ON ci.id = c.city_id
         JOIN states s  ON s.id = c.state_id";

    public static function featured(int $limit = 6): array
    {
        return Database::all(
            "SELECT " . self::SELECT . " " . self::JOINS . "
             WHERE c.status='ACTIVE'
             ORDER BY (c.tier='FEATURED') DESC, c.rating DESC, c.review_count DESC
             LIMIT " . (int) $limit
        );
    }

    public static function findBySlug(string $slug): ?array
    {
        return Database::first(
            "SELECT " . self::SELECT . " " . self::JOINS . " WHERE c.slug = ? LIMIT 1",
            [$slug]
        );
    }

    public static function findById(int $id): ?array
    {
        return Database::first(
            "SELECT " . self::SELECT . " " . self::JOINS . " WHERE c.id = ? LIMIT 1",
            [$id]
        );
    }

    public static function countActive(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM companies WHERE status='ACTIVE'");
    }

    /** Category ids attached to a company. */
    public static function serviceIds(int $companyId): array
    {
        $rows = Database::all("SELECT category_id FROM company_services WHERE company_id=?", [$companyId]);
        return array_map(static fn($r) => (int) $r['category_id'], $rows);
    }

    /** Categories (full rows) for a company. */
    public static function services(int $companyId): array
    {
        return Database::all(
            "SELECT sc.* FROM service_categories sc
             JOIN company_services cs ON cs.category_id = sc.id
             WHERE cs.company_id = ? ORDER BY sc.sort_order", [$companyId]
        );
    }

    public static function inCity(int $cityId): array
    {
        return Database::all(
            "SELECT " . self::SELECT . " " . self::JOINS . "
             WHERE c.city_id=? AND c.status='ACTIVE'
             ORDER BY (c.tier='FEATURED') DESC, c.rating DESC", [$cityId]
        );
    }

    public static function inState(int $stateId): array
    {
        return Database::all(
            "SELECT " . self::SELECT . " " . self::JOINS . "
             WHERE c.state_id=? AND c.status='ACTIVE'
             ORDER BY (c.tier='FEATURED') DESC, c.rating DESC", [$stateId]
        );
    }

    public static function byCategory(string $categorySlug): array
    {
        return Database::all(
            "SELECT " . self::SELECT . " " . self::JOINS . "
             JOIN company_services cs ON cs.company_id = c.id
             JOIN service_categories sc ON sc.id = cs.category_id AND sc.slug = ?
             WHERE c.status='ACTIVE'
             GROUP BY c.id
             ORDER BY (c.tier='FEATURED') DESC, c.rating DESC", [$categorySlug]
        );
    }

    /** Faceted search. Filters: q, location, category(slug), state(slug). */
    public static function search(array $f): array
    {
        $where = ["c.status='ACTIVE'"];
        $params = [];
        if (!empty($f['q'])) {
            $where[] = "(c.name LIKE ? OR c.description LIKE ?)";
            $params[] = '%' . $f['q'] . '%';
            $params[] = '%' . $f['q'] . '%';
        }
        if (!empty($f['location'])) {
            $where[] = "(ci.name LIKE ? OR s.name LIKE ? OR s.abbreviation = ?)";
            $params[] = '%' . $f['location'] . '%';
            $params[] = '%' . $f['location'] . '%';
            $params[] = strtoupper(trim($f['location']));
        }
        if (!empty($f['state'])) {
            $where[] = "s.slug = ?";
            $params[] = $f['state'];
        }
        $join = self::JOINS;
        if (!empty($f['category'])) {
            $join .= " JOIN company_services cs ON cs.company_id=c.id
                       JOIN service_categories sc ON sc.id=cs.category_id AND sc.slug=?";
            array_unshift($params, $f['category']);
        }
        $sql = "SELECT " . self::SELECT . " " . $join .
               " WHERE " . implode(' AND ', $where) .
               " GROUP BY c.id ORDER BY (c.tier='FEATURED') DESC, c.rating DESC, c.review_count DESC LIMIT 100";
        return Database::all($sql, $params);
    }

    /** For /admin listing (all statuses). */
    public static function adminAll(): array
    {
        return Database::all(
            "SELECT " . self::SELECT . " " . self::JOINS . " ORDER BY c.created_at DESC"
        );
    }

    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO companies
             (owner_id,name,slug,status,tier,short_description,description,website,phone,email,address,
              founded_year,team_size,city_id,state_id)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                $d['owner_id'] ?? null, $d['name'], $d['slug'], $d['status'] ?? 'PENDING',
                $d['tier'] ?? 'FREE', $d['short_description'] ?? null, $d['description'] ?? null,
                $d['website'] ?? null, $d['phone'] ?? null, $d['email'] ?? null, $d['address'] ?? null,
                $d['founded_year'] ?: null, $d['team_size'] ?? null, $d['city_id'], $d['state_id'],
            ]
        );
    }

    public static function update(int $id, array $d): void
    {
        Database::execute(
            "UPDATE companies SET name=?,slug=?,status=?,tier=?,short_description=?,description=?,
             website=?,phone=?,email=?,address=?,founded_year=?,team_size=?,city_id=?,state_id=? WHERE id=?",
            [
                $d['name'], $d['slug'], $d['status'], $d['tier'], $d['short_description'] ?? null,
                $d['description'] ?? null, $d['website'] ?? null, $d['phone'] ?? null, $d['email'] ?? null,
                $d['address'] ?? null, $d['founded_year'] ?: null, $d['team_size'] ?? null,
                $d['city_id'], $d['state_id'], $id,
            ]
        );
    }

    public static function delete(int $id): void
    {
        Database::execute("DELETE FROM companies WHERE id=?", [$id]);
    }

    public static function setStatus(int $id, string $status): void
    {
        Database::execute("UPDATE companies SET status=? WHERE id=?", [$status, $id]);
    }

    /** @param int[] $ids */
    private static function intIds(array $ids): array
    {
        return array_values(array_filter(array_map('intval', $ids)));
    }

    public static function deleteMany(array $ids): int
    {
        $ids = self::intIds($ids);
        if (!$ids) { return 0; }
        $in = implode(',', array_fill(0, count($ids), '?'));
        return Database::execute("DELETE FROM companies WHERE id IN ($in)", $ids);
    }

    public static function setStatusMany(array $ids, string $status): int
    {
        $ids = self::intIds($ids);
        if (!$ids) { return 0; }
        $in = implode(',', array_fill(0, count($ids), '?'));
        return Database::execute("UPDATE companies SET status=? WHERE id IN ($in)", array_merge([$status], $ids));
    }

    public static function setTierMany(array $ids, string $tier): int
    {
        $ids = self::intIds($ids);
        if (!$ids) { return 0; }
        $in = implode(',', array_fill(0, count($ids), '?'));
        return Database::execute("UPDATE companies SET tier=? WHERE id IN ($in)", array_merge([$tier], $ids));
    }

    public static function setTier(int $id, string $tier): void
    {
        Database::execute("UPDATE companies SET tier=? WHERE id=?", [$tier, $id]);
    }

    public static function syncServices(int $companyId, array $categoryIds): void
    {
        Database::execute("DELETE FROM company_services WHERE company_id=?", [$companyId]);
        foreach (array_unique($categoryIds) as $cid) {
            Database::execute(
                "INSERT IGNORE INTO company_services (company_id,category_id) VALUES (?,?)",
                [$companyId, (int) $cid]
            );
        }
    }

    public static function recalcRating(int $companyId): void
    {
        $row = Database::first(
            "SELECT COUNT(*) n, COALESCE(AVG(rating),0) avg FROM reviews
             WHERE company_id=? AND status='APPROVED'", [$companyId]
        );
        Database::execute(
            "UPDATE companies SET rating=?, review_count=? WHERE id=?",
            [round((float) $row['avg'], 1), (int) $row['n'], $companyId]
        );
    }

    public static function forOwner(int $ownerId): ?array
    {
        return Database::first(
            "SELECT " . self::SELECT . " " . self::JOINS . " WHERE c.owner_id=? LIMIT 1", [$ownerId]
        );
    }

    public static function updateLogo(int $id, string $path): void
    {
        Database::execute("UPDATE companies SET logo=? WHERE id=?", [$path, $id]);
    }

    /** True if the website_nofollow column exists (migration 002 applied). */
    public static function nofollowSupported(): bool
    {
        static $ok = null;
        if ($ok === null) {
            $ok = (bool) Database::scalar(
                "SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'companies'
                 AND column_name = 'website_nofollow'"
            );
        }
        return $ok;
    }

    public static function setWebsiteNofollow(int $id, int $nofollow): void
    {
        if (self::nofollowSupported()) {
            Database::execute("UPDATE companies SET website_nofollow=? WHERE id=?", [$nofollow ? 1 : 0, $id]);
        }
    }
}
