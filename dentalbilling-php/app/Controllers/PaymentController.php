<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Database;
use App\Models\PaymentTransaction;

final class PaymentController extends Controller
{
    /** Manual / Payoneer / bank-transfer payment — creates a PENDING transaction. */
    public function manual(): void
    {
        Auth::requireLogin();
        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Session expired.'); $this->redirect('/dashboard/subscription');
        }

        $companyId = (int) $this->input('company_id');
        $tier = strtoupper((string) $this->input('plan_tier'));
        $plan = Database::first("SELECT * FROM plans WHERE tier=? LIMIT 1", [$tier]);

        PaymentTransaction::create([
            'user_id'    => Auth::id(),
            'company_id' => $companyId ?: null,
            'plan_id'    => $plan['id'] ?? null,
            'provider'   => 'MANUAL',
            'status'     => 'PENDING',
            'amount'     => $plan['price'] ?? 0,
            'reference'  => trim((string) $this->input('reference')),
        ]);

        flash('success', 'Payment submitted. An admin will confirm and activate your upgrade shortly.');
        $this->redirect('/dashboard/subscription');
    }
}
