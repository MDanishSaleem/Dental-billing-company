<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Claim
{
    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO company_owner_claims (company_id,user_id,message,status) VALUES (?,?,?, 'PENDING')",
            [$d['company_id'], $d['user_id'], $d['message'] ?? null]
        );
    }

    public static function pending(): array
    {
        return Database::all(
            "SELECT cl.*, c.name AS company_name, c.slug AS company_slug, u.name AS user_name, u.email AS user_email
             FROM company_owner_claims cl
             JOIN companies c ON c.id=cl.company_id
             JOIN users u ON u.id=cl.user_id
             WHERE cl.status='PENDING' ORDER BY cl.created_at DESC"
        );
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM company_owner_claims WHERE id=?", [$id]);
    }

    public static function setStatus(int $id, string $status): void
    {
        Database::execute("UPDATE company_owner_claims SET status=? WHERE id=?", [$status, $id]);
    }

    public static function countPending(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM company_owner_claims WHERE status='PENDING'");
    }
}
