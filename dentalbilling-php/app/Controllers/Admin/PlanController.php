<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;

final class PlanController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/plans', [
            'title'  => 'Plans',
            'active' => 'plans',
            'plans'  => Database::all("SELECT * FROM plans ORDER BY price"),
        ]);
    }

    public function update(array $args): void
    {
        $this->guard('/admin/plans');
        Database::execute(
            "UPDATE plans SET name=?, price=?, features=?, active=? WHERE id=?",
            [
                trim((string) $this->input('name')),
                (float) $this->input('price'),
                trim((string) $this->input('features')),
                $this->input('active') ? 1 : 0,
                (int) $args['id'],
            ]
        );
        flash('success', 'Plan updated.');
        $this->redirect('/admin/plans');
    }
}
