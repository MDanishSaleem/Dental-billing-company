<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * Functional plan capabilities (entitlements). A capability is granted to a
 * plan when a row exists in plan_capabilities. These gate real features in the
 * dashboard and on the public profile.
 */
final class Capability
{
    /** The full catalog of toggleable capabilities. */
    public const CATALOG = [
        'logo_upload'        => ['label' => 'Company logo',       'desc' => 'Owner can upload a company logo'],
        'gallery'            => ['label' => 'Photo gallery',      'desc' => 'Owner can upload photos to the profile'],
        'website_link'       => ['label' => 'Website link',       'desc' => 'Show a clickable website link on the profile'],
        'lead_capture'       => ['label' => 'Lead capture form',  'desc' => 'Show the “request a quote” form on the profile'],
        'featured_badge'     => ['label' => 'Featured badge',     'desc' => 'Show a Featured badge on the listing'],
        'priority_placement' => ['label' => 'Priority placement', 'desc' => 'Rank above lower tiers in listings'],
        'analytics'          => ['label' => 'Analytics',          'desc' => 'Access the analytics page in the dashboard'],
    ];

    public static function tableExists(): bool
    {
        static $exists = null;
        if ($exists === null) {
            $exists = (bool) Database::scalar(
                "SELECT COUNT(*) FROM information_schema.tables
                 WHERE table_schema = DATABASE() AND table_name = 'plan_capabilities'"
            );
        }
        return $exists;
    }

    /** Enabled capability keys for a plan id. */
    public static function keysForPlan(int $planId): array
    {
        if (!self::tableExists()) {
            return [];
        }
        $rows = Database::all("SELECT cap_key FROM plan_capabilities WHERE plan_id=?", [$planId]);
        return array_map(static fn($r) => $r['cap_key'], $rows);
    }

    /** Enabled capability keys for a tier (FREE/BASIC/PREMIUM/FEATURED), cached. */
    public static function keysForTier(string $tier): array
    {
        static $cache = [];
        if (!self::tableExists()) {
            return [];
        }
        if (!array_key_exists($tier, $cache)) {
            $rows = Database::all(
                "SELECT pc.cap_key FROM plan_capabilities pc
                 JOIN plans p ON p.id = pc.plan_id
                 WHERE p.tier = ?", [$tier]
            );
            $cache[$tier] = array_map(static fn($r) => $r['cap_key'], $rows);
        }
        return $cache[$tier];
    }

    /** Does a tier grant a capability? Defaults to TRUE if the system isn't migrated yet. */
    public static function can(string $tier, string $key): bool
    {
        if (!self::tableExists()) {
            return true; // pre-migration: don't hide anything
        }
        return in_array($key, self::keysForTier($tier), true);
    }

    public static function enable(int $planId, string $key): void
    {
        if (!isset(self::CATALOG[$key])) {
            return;
        }
        Database::execute(
            "INSERT IGNORE INTO plan_capabilities (plan_id, cap_key) VALUES (?,?)",
            [$planId, $key]
        );
    }

    public static function disable(int $planId, string $key): void
    {
        Database::execute(
            "DELETE FROM plan_capabilities WHERE plan_id=? AND cap_key=?",
            [$planId, $key]
        );
    }

    public static function toggle(int $planId, string $key): void
    {
        if (in_array($key, self::keysForPlan($planId), true)) {
            self::disable($planId, $key);
        } else {
            self::enable($planId, $key);
        }
    }

    /** Human labels of a plan's enabled capabilities (for the pricing page). */
    public static function labelsForPlan(int $planId): array
    {
        $out = [];
        foreach (self::keysForPlan($planId) as $key) {
            if (isset(self::CATALOG[$key])) {
                $out[] = self::CATALOG[$key]['label'];
            }
        }
        return $out;
    }
}
