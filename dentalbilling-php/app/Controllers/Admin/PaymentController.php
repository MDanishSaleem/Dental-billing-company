<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\PaymentTransaction;
use App\Models\Company;
use App\Core\Database;

final class PaymentController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/payments', [
            'title'    => 'Payments',
            'active'   => 'payments',
            'payments' => PaymentTransaction::all(),
        ]);
    }

    public function status(array $args): void
    {
        $this->guard('/admin/payments');
        $id = (int) $args['id'];
        $status = strtoupper((string) $this->input('status'));
        if (!in_array($status, ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], true)) {
            $this->redirect('/admin/payments');
        }
        PaymentTransaction::setStatus($id, $status);

        // On completion, upgrade the company's tier to the plan's tier.
        if ($status === 'COMPLETED') {
            $tx = PaymentTransaction::find($id);
            if ($tx && $tx['company_id'] && $tx['plan_id']) {
                $plan = Database::first("SELECT tier FROM plans WHERE id=?", [(int) $tx['plan_id']]);
                if ($plan) {
                    Company::setTier((int) $tx['company_id'], $plan['tier']);
                }
            }
        }
        flash('success', 'Payment updated.');
        $this->redirect('/admin/payments');
    }
}
