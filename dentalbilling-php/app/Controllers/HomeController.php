<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Company;
use App\Models\State;
use App\Models\ServiceCategory;

final class HomeController extends Controller
{
    public function index(): void
    {
        $this->view('home', [
            'title'      => 'Find Trusted Dental Billing Companies in the US',
            'featured'   => Company::featured(6),
            'categories' => ServiceCategory::all(),
            'states'     => State::popular(12),
            'stats'      => [
                'companies' => Company::countActive(),
                'states'    => State::count(),
            ],
        ]);
    }
}
