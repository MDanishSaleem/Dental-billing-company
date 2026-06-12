<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Plan;
use App\Models\PlanFeature;

final class PricingController extends Controller
{
    public function index(): void
    {
        $plans = Plan::active();
        $features = [];
        foreach ($plans as $p) {
            $id = (int) $p['id'];
            // Prefer the managed plan_features list; fall back to the pipe-separated text.
            $labels = PlanFeature::enabledLabels($id);
            if (!$labels) {
                $labels = array_values(array_filter(array_map('trim', explode('|', (string) $p['features']))));
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
