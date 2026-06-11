<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Models\Company;
use App\Models\Lead;
use App\Models\Review;
use App\Models\User;

final class DashboardController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/dashboard', [
            'title'  => 'Admin dashboard',
            'active' => 'dashboard',
            'stats'  => [
                'companies'      => (int) Database::scalar("SELECT COUNT(*) FROM companies"),
                'active'         => Company::countActive(),
                'pendingCompanies' => (int) Database::scalar("SELECT COUNT(*) FROM companies WHERE status='PENDING'"),
                'users'          => User::count(),
                'newLeads'       => Lead::countNew(),
                'pendingReviews' => Review::countPending(),
            ],
            'recentLeads' => array_slice(Lead::all(), 0, 6),
        ]);
    }
}
