<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Plan;

final class PricingController extends Controller
{
    public function index(): void
    {
        $this->view('pricing', [
            'title' => 'Pricing — List Your Dental Billing Company',
            'plans' => Plan::active(),
        ]);
    }
}
