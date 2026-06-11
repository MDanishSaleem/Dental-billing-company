<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Company;

final class CompareController extends Controller
{
    public function index(): void
    {
        $slugs = array_filter(array_map('trim', explode(',', (string) ($_GET['ids'] ?? ''))));
        $companies = [];
        foreach (array_slice($slugs, 0, 3) as $slug) {
            $c = Company::findBySlug($slug);
            if ($c) {
                $c['service_list'] = Company::services((int) $c['id']);
                $companies[] = $c;
            }
        }

        $this->view('compare', [
            'title'     => 'Compare Dental Billing Companies',
            'companies' => $companies,
        ]);
    }
}
