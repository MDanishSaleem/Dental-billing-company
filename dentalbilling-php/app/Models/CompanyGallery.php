<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class CompanyGallery
{
    public static function forCompany(int $companyId): array
    {
        return Database::all(
            "SELECT * FROM company_gallery WHERE company_id=? ORDER BY sort_order, id", [$companyId]
        );
    }

    public static function add(int $companyId, string $image): int
    {
        $next = (int) Database::scalar(
            "SELECT COALESCE(MAX(sort_order),0)+1 FROM company_gallery WHERE company_id=?", [$companyId]
        );
        return Database::insert(
            "INSERT INTO company_gallery (company_id, image, sort_order) VALUES (?,?,?)",
            [$companyId, $image, $next]
        );
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM company_gallery WHERE id=?", [$id]);
    }

    public static function delete(int $id): void
    {
        Database::execute("DELETE FROM company_gallery WHERE id=?", [$id]);
    }
}
