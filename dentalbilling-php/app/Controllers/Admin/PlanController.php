<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Models\PlanFeature;

final class PlanController extends AdminController
{
    public function index(): void
    {
        $plans = Database::all("SELECT * FROM plans ORDER BY price");
        $features = [];
        foreach ($plans as $p) {
            $features[(int) $p['id']] = PlanFeature::forPlan((int) $p['id']);
        }
        $this->admin('admin/plans', [
            'title'           => 'Plans',
            'active'          => 'plans',
            'plans'           => $plans,
            'features'        => $features,
            'featuresEnabled' => PlanFeature::tableExists(),
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

    public function addFeature(array $args): void
    {
        $this->guard('/admin/plans');
        $label = trim((string) $this->input('label'));
        if ($label !== '') {
            PlanFeature::add((int) $args['id'], $label);
            flash('success', 'Feature added.');
        }
        $this->redirect('/admin/plans');
    }

    public function toggleFeature(array $args): void
    {
        $this->guard('/admin/plans');
        PlanFeature::toggle((int) $args['id']);
        flash('success', 'Feature updated.');
        $this->redirect('/admin/plans');
    }

    public function removeFeature(array $args): void
    {
        $this->guard('/admin/plans');
        PlanFeature::remove((int) $args['id']);
        flash('success', 'Feature removed.');
        $this->redirect('/admin/plans');
    }
}
