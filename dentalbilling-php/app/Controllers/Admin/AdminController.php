<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Auth;

/**
 * Base for all admin controllers — enforces ADMIN role and renders with the
 * admin layout.
 */
abstract class AdminController extends Controller
{
    public function __construct()
    {
        Auth::requireLogin('ADMIN');
    }

    protected function admin(string $view, array $data = []): void
    {
        $this->view($view, $data, 'admin');
    }

    /** Verify CSRF for POST actions; flash + redirect on failure. */
    protected function guard(string $redirect): void
    {
        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Session expired, please try again.');
            $this->redirect($redirect);
        }
    }
}
