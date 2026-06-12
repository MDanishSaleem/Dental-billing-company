<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Plan;
use App\Models\Capability;

final class PricingController extends Controller
{
    public function index(): void
    {
        $plans = Plan::active();
        $features = [];
        foreach ($plans as $p) {
            $id = (int) $p['id'];
            // Show the labels of the plan's enabled capabilities; fall back to
            // the legacy pipe-separated text before the migration is applied.
            $labels = Capability::labelsForPlan($id);
            if (!$labels) {
                $labels = array_values(array_filter(array_map('trim', explode('|', (string) ($p['features'] ?? '')))));
            }
            $features[$id] = $labels;
        }

        $this->view('pricing', [
            'title'    => 'Pricing — List Your Dental Billing Company',
            'plans'    => $plans,
            'features' => $features,
        ]);
    }
}
