<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Models\Capability;

final class PlanController extends AdminController
{
    public function index(): void
    {
        $plans = Database::all("SELECT * FROM plans ORDER BY price");
        $caps = [];
        foreach ($plans as $p) {
            $caps[(int) $p['id']] = Capability::keysForPlan((int) $p['id']);
        }
        $this->admin('admin/plans', [
            'title'        => 'Plans & features',
            'active'       => 'plans',
            'plans'        => $plans,
            'catalog'      => Capability::CATALOG,
            'planCaps'     => $caps,
            'capsEnabled'  => Capability::tableExists(),
        ]);
    }

    public function update(array $args): void
    {
        $this->guard('/admin/plans');
        Database::execute(
            "UPDATE plans SET name=?, price=?, active=? WHERE id=?",
            [
                trim((string) $this->input('name')),
                (float) $this->input('price'),
                $this->input('active') ? 1 : 0,
                (int) $args['id'],
            ]
        );
        flash('success', 'Plan updated.');
        $this->redirect('/admin/plans');
    }

    /** Toggle one capability for one plan. */
    public function toggleCapability(array $args): void
    {
        $this->guard('/admin/plans');
        $key = (string) $this->input('cap');
        Capability::toggle((int) $args['id'], $key);
        flash('success', 'Feature updated.');
        $this->redirect('/admin/plans');
    }
}
