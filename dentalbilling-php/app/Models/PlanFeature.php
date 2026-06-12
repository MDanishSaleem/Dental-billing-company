<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class PlanFeature
{
    /** True if the plan_features table exists (migration 001 applied). */
    public static function tableExists(): bool
    {
        static $exists = null;
        if ($exists === null) {
            $exists = (bool) Database::scalar(
                "SELECT COUNT(*) FROM information_schema.tables
                 WHERE table_schema = DATABASE() AND table_name = 'plan_features'"
            );
        }
        return $exists;
    }

    /** All features for a plan (admin view — includes disabled). */
    public static function forPlan(int $planId): array
    {
        if (!self::tableExists()) {
            return [];
        }
        return Database::all(
            "SELECT * FROM plan_features WHERE plan_id=? ORDER BY sort_order, id", [$planId]
        );
    }

    /** Enabled feature labels only (public pricing view). */
    public static function enabledLabels(int $planId): array
    {
        if (!self::tableExists()) {
            return [];
        }
        $rows = Database::all(
            "SELECT label FROM plan_features WHERE plan_id=? AND enabled=1 ORDER BY sort_order, id", [$planId]
        );
        return array_map(static fn($r) => $r['label'], $rows);
    }

    public static function add(int $planId, string $label): void
    {
        $next = (int) Database::scalar(
            "SELECT COALESCE(MAX(sort_order),0)+1 FROM plan_features WHERE plan_id=?", [$planId]
        );
        Database::execute(
            "INSERT INTO plan_features (plan_id,label,enabled,sort_order) VALUES (?,?,1,?)",
            [$planId, $label, $next]
        );
    }

    public static function toggle(int $id): void
    {
        Database::execute("UPDATE plan_features SET enabled = 1 - enabled WHERE id=?", [$id]);
    }

    public static function remove(int $id): void
    {
        Database::execute("DELETE FROM plan_features WHERE id=?", [$id]);
    }

    public static function find(int $id): ?array
    {
        return Database::first("SELECT * FROM plan_features WHERE id=?", [$id]);
    }
}
