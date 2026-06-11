<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Page
{
    public static function findBySlug(string $slug): ?array
    {
        return Database::first(
            "SELECT * FROM pages WHERE slug=? AND status='PUBLISHED' LIMIT 1", [$slug]
        );
    }

    public static function all(): array
    {
        return Database::all("SELECT * FROM pages ORDER BY title");
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM pages WHERE id=?", [$id]);
    }

    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO pages (title,slug,body,status) VALUES (?,?,?,?)",
            [$d['title'], $d['slug'], $d['body'] ?? null, $d['status'] ?? 'PUBLISHED']
        );
    }

    public static function update(int $id, array $d): void
    {
        Database::execute(
            "UPDATE pages SET title=?,slug=?,body=?,status=? WHERE id=?",
            [$d['title'], $d['slug'], $d['body'] ?? null, $d['status'], $id]
        );
    }

    public static function delete(int $id): void
    {
        Database::execute("DELETE FROM pages WHERE id=?", [$id]);
    }
}
