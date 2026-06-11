<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class User
{
    public static function findByEmail(string $email): ?array
    {
        return Database::first("SELECT * FROM users WHERE email=? LIMIT 1", [strtolower(trim($email))]);
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM users WHERE id=?", [$id]);
    }

    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
            [
                $d['name'], strtolower(trim($d['email'])),
                password_hash($d['password'], PASSWORD_BCRYPT),
                $d['role'] ?? 'USER',
            ]
        );
    }

    public static function emailExists(string $email): bool
    {
        return (bool) Database::scalar("SELECT 1 FROM users WHERE email=? LIMIT 1", [strtolower(trim($email))]);
    }

    public static function all(): array
    {
        return Database::all("SELECT id,name,email,role,banned,created_at FROM users ORDER BY created_at DESC");
    }

    public static function setRole(int $id, string $role): void
    {
        Database::execute("UPDATE users SET role=? WHERE id=?", [$role, $id]);
    }

    public static function setBanned(int $id, int $banned): void
    {
        Database::execute("UPDATE users SET banned=? WHERE id=?", [$banned, $id]);
    }

    public static function updatePassword(int $id, string $password): void
    {
        Database::execute("UPDATE users SET password=? WHERE id=?", [password_hash($password, PASSWORD_BCRYPT), $id]);
    }

    public static function count(): int
    {
        return (int) Database::scalar("SELECT COUNT(*) FROM users");
    }
}
