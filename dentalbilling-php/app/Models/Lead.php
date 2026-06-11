<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Lead
{
    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO leads (company_id,name,email,phone,message,status) VALUES (?,?,?,?,?, 'NEW')",
            [$d['company_id'], $d['name'], $d['email'], $d['phone'] ?? null, $d['message'] ?? null]
        );
    }

    public static function forCompany(int $companyId): array
    {
        return Database::all(
            "SELECT * FROM leads WHERE company_id=? ORDER BY created_at DESC", [$companyId]
        );
    }

    public static function all(): array
    {
        return Database::all(
            "SELECT l.*, c.name AS company_name FROM leads l JOIN companies c ON c.id=l.company_id
             ORDER BY l.created_at DESC"
        );
    }

    public static function setStatus(int $id, string $status): void
    {
        Database::execute("UPDATE leads SET status=? WHERE id=?", [$status, $id]);
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM leads WHERE id=?", [$id]);
    }

    public static function countNew(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM leads WHERE status='NEW'");
    }
}
