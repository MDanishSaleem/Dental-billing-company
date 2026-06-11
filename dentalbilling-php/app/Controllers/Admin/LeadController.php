<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Lead;

final class LeadController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/leads', [
            'title'  => 'Leads',
            'active' => 'leads',
            'leads'  => Lead::all(),
        ]);
    }

    public function status(array $args): void
    {
        $this->guard('/admin/leads');
        $status = strtoupper((string) $this->input('status'));
        if (in_array($status, ['NEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED'], true)) {
            Lead::setStatus((int) $args['id'], $status);
            flash('success', 'Lead updated.');
        }
        $this->redirect('/admin/leads');
    }
}
