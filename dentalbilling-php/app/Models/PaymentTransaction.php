<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class PaymentTransaction
{
    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO payment_transactions (user_id,company_id,plan_id,provider,status,amount,reference)
             VALUES (?,?,?,?,?,?,?)",
            [
                $d['user_id'] ?? null, $d['company_id'] ?? null, $d['plan_id'] ?? null,
                $d['provider'] ?? 'MANUAL', $d['status'] ?? 'PENDING',
                $d['amount'] ?? 0, $d['reference'] ?? null,
            ]
        );
    }

    public static function all(): array
    {
        return Database::all(
            "SELECT pt.*, u.email AS user_email, c.name AS company_name, p.name AS plan_name
             FROM payment_transactions pt
             LEFT JOIN users u ON u.id=pt.user_id
             LEFT JOIN companies c ON c.id=pt.company_id
             LEFT JOIN plans p ON p.id=pt.plan_id
             ORDER BY pt.created_at DESC"
        );
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM payment_transactions WHERE id=?", [$id]);
    }

    public static function setStatus(int $id, string $status): void
    {
        Database::execute("UPDATE payment_transactions SET status=? WHERE id=?", [$status, $id]);
    }
}
