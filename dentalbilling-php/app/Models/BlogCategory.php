<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class BlogCategory
{
    public static function all(): array
    {
        return Database::all("SELECT * FROM blog_categories ORDER BY name");
    }
}
