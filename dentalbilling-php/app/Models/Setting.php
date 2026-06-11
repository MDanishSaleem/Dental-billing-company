<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Setting
{
    public static function all(): array
    {
        $out = [];
        foreach (Database::all("SELECT `key`,`value` FROM settings") as $r) {
            $out[$r['key']] = $r['value'];
        }
        return $out;
    }

    public static function set(string $key, $value): void
    {
        Database::execute(
            "INSERT INTO settings (`key`,`value`) VALUES (?,?)
             ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)",
            [$key, (string) $value]
        );
    }
}
