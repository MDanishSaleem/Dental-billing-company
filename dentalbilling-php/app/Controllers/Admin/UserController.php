<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Models\User;

final class UserController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/users', [
            'title'  => 'Users',
            'active' => 'users',
            'users'  => User::all(),
        ]);
    }

    public function role(array $args): void
    {
        $this->guard('/admin/users');
        $role = strtoupper((string) $this->input('role'));
        if (in_array($role, ['ADMIN', 'COMPANY_OWNER', 'USER'], true)) {
            User::setRole((int) $args['id'], $role);
            flash('success', 'Role updated.');
        }
        $this->redirect('/admin/users');
    }

    public function ban(array $args): void
    {
        $this->guard('/admin/users');
        $id = (int) $args['id'];
        if ($id === (int) Auth::id()) {
            flash('error', 'You cannot ban your own account.');
            $this->redirect('/admin/users');
        }
        $user = User::find($id);
        if ($user) {
            User::setBanned($id, (int) $user['banned'] === 1 ? 0 : 1);
            flash('success', 'User updated.');
        }
        $this->redirect('/admin/users');
    }
}
