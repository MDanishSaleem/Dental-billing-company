<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\City;
use App\Models\Company;
use App\Models\State;

final class DirectoryController extends Controller
{
    /** /directory — all states. */
    public function index(): void
    {
        $this->view('directory/index', [
            'title'  => 'Browse Dental Billing Companies by State',
            'states' => State::allActive(),
        ]);
    }

    /** /directory/{state} — cities in a state. */
    public function state(array $args): void
    {
        $state = State::findBySlug($args['state'] ?? '');
        if (!$state) { $this->notFound(); return; }

        $this->view('directory/state', [
            'title'  => 'Dental Billing Companies in ' . $state['name'],
            'state'  => $state,
            'cities' => City::forState((int) $state['id']),
            'companies' => Company::inState((int) $state['id']),
        ]);
    }

    /** /companies/{city}/{state} — companies in a city. */
    public function city(array $args): void
    {
        $city = City::bySlugInState($args['city'] ?? '', $args['state'] ?? '');
        if (!$city) { $this->notFound(); return; }

        $this->view('directory/city', [
            'title'     => 'Dental Billing Companies in ' . $city['name'] . ', ' . $city['abbreviation'],
            'city'      => $city,
            'companies' => Company::inCity((int) $city['id']),
        ]);
    }
}
