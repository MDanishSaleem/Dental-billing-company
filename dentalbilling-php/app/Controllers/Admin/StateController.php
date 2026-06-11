<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Models\State;

final class StateController extends AdminController
{
    public function index(): void
    {
        // states with active flag + active company count
        $states = Database::all(
            "SELECT s.*,
                    (SELECT COUNT(*) FROM cities ci WHERE ci.state_id=s.id) AS city_count,
                    (SELECT COUNT(*) FROM companies c WHERE c.state_id=s.id AND c.status='ACTIVE') AS company_count
             FROM states s ORDER BY s.name"
        );
        $this->admin('admin/states', [
            'title'  => 'States & cities',
            'active' => 'states',
            'states' => $states,
        ]);
    }

    public function toggle(array $args): void
    {
        $this->guard('/admin/states');
        $id = (int) $args['id'];
        $current = Database::first("SELECT active FROM states WHERE id=?", [$id]);
        State::setActive($id, $current && (int) $current['active'] === 1 ? 0 : 1);
        flash('success', 'State updated.');
        $this->redirect('/admin/states');
    }
}
