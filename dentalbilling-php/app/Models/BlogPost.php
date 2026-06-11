<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class BlogPost
{
    public static function published(int $limit = 30): array
    {
        return Database::all(
            "SELECT p.*, bc.name AS category_name, bc.slug AS category_slug
             FROM blog_posts p LEFT JOIN blog_categories bc ON bc.id=p.category_id
             WHERE p.status='PUBLISHED' ORDER BY p.published_at DESC LIMIT " . (int) $limit
        );
    }

    public static function findBySlug(string $slug): ?array
    {
        return Database::first(
            "SELECT p.*, bc.name AS category_name, bc.slug AS category_slug, u.name AS author_name
             FROM blog_posts p
             LEFT JOIN blog_categories bc ON bc.id=p.category_id
             LEFT JOIN users u ON u.id=p.author_id
             WHERE p.slug=? AND p.status='PUBLISHED' LIMIT 1", [$slug]
        );
    }

    public static function adminAll(): array
    {
        return Database::all(
            "SELECT p.*, bc.name AS category_name FROM blog_posts p
             LEFT JOIN blog_categories bc ON bc.id=p.category_id ORDER BY p.created_at DESC"
        );
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM blog_posts WHERE id=?", [$id]);
    }

    public static function create(array $d): int
    {
        return Database::insert(
            "INSERT INTO blog_posts (category_id,author_id,title,slug,excerpt,body,image,status,published_at)
             VALUES (?,?,?,?,?,?,?,?,?)",
            [
                $d['category_id'] ?: null, $d['author_id'] ?? null, $d['title'], $d['slug'],
                $d['excerpt'] ?? null, $d['body'] ?? null, $d['image'] ?? null,
                $d['status'] ?? 'DRAFT',
                ($d['status'] ?? 'DRAFT') === 'PUBLISHED' ? date('Y-m-d H:i:s') : null,
            ]
        );
    }

    public static function update(int $id, array $d): void
    {
        Database::execute(
            "UPDATE blog_posts SET category_id=?,title=?,slug=?,excerpt=?,body=?,image=?,status=?,
             published_at=COALESCE(published_at, ?) WHERE id=?",
            [
                $d['category_id'] ?: null, $d['title'], $d['slug'], $d['excerpt'] ?? null,
                $d['body'] ?? null, $d['image'] ?? null, $d['status'],
                $d['status'] === 'PUBLISHED' ? date('Y-m-d H:i:s') : null, $id,
            ]
        );
    }

    public static function delete(int $id): void
    {
        Database::execute("DELETE FROM blog_posts WHERE id=?", [$id]);
    }
}
