<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Review
{
    public static function approvedForCompany(int $companyId): array
    {
        return Database::all(
            "SELECT * FROM reviews WHERE company_id=? AND status='APPROVED' ORDER BY created_at DESC",
            [$companyId]
        );
    }

    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO reviews (company_id,user_id,author_name,rating,title,body,status)
             VALUES (?,?,?,?,?,?,?)",
            [
                $d['company_id'], $d['user_id'] ?? null, $d['author_name'],
                (int) $d['rating'], $d['title'] ?? null, $d['body'] ?? null,
                $d['status'] ?? 'PENDING',
            ]
        );
    }

    public static function pending(): array
    {
        return Database::all(
            "SELECT r.*, c.name AS company_name, c.slug AS company_slug
             FROM reviews r JOIN companies c ON c.id=r.company_id
             WHERE r.status='PENDING' ORDER BY r.created_at DESC"
        );
    }

    public static function forCompanyOwner(int $companyId): array
    {
        return Database::all(
            "SELECT * FROM reviews WHERE company_id=? ORDER BY created_at DESC", [$companyId]
        );
    }

    public static function setStatus(int $id, string $status): void
    {
        Database::execute("UPDATE reviews SET status=? WHERE id=?", [$status, $id]);
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM reviews WHERE id=?", [$id]);
    }

    public static function countPending(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM reviews WHERE status='PENDING'");
    }
}
