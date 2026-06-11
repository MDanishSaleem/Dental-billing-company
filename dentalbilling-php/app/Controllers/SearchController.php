<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Company;
use App\Models\ServiceCategory;
use App\Models\State;

final class SearchController extends Controller
{
    public function index(): void
    {
        $filters = [
            'q'        => trim((string) ($_GET['q'] ?? '')),
            'location' => trim((string) ($_GET['location'] ?? '')),
            'category' => trim((string) ($_GET['category'] ?? '')),
            'state'    => trim((string) ($_GET['state'] ?? '')),
        ];
        $results = Company::search($filters);

        $this->view('search', [
            'title'      => 'Search Dental Billing Companies',
            'filters'    => $filters,
            'results'    => $results,
            'categories' => ServiceCategory::all(),
            'states'     => State::allActive(),
        ]);
    }
}
