<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\City;
use App\Models\Company;
use App\Models\ServiceCategory;
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

    /**
     * /companies/{slug} — one segment can be a STATE, a SERVICE category, or a
     * COMPANY. Resolve in that order.
     */
    public function resolve(array $args): void
    {
        $slug = $args['slug'] ?? '';

        if ($state = State::findBySlug($slug)) {
            $this->renderState($state);
            return;
        }
        if ($category = ServiceCategory::findBySlug($slug)) {
            $this->renderCategory($category);
            return;
        }
        $company = Company::findBySlug($slug);
        if ($company && $company['status'] === 'ACTIVE') {
            (new CompanyController())->show(['slug' => $slug]);
            return;
        }
        $this->notFound();
    }

    /** /directory/{state} — kept as an alias of /companies/{state}. */
    public function state(array $args): void
    {
        $state = State::findBySlug($args['state'] ?? '');
        if (!$state) { $this->notFound(); return; }
        $this->renderState($state);
    }

    /** /companies/{state}/{city} — companies in a city. */
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

    private function renderState(array $state): void
    {
        $this->view('directory/state', [
            'title'     => 'Dental Billing Companies in ' . $state['name'],
            'state'     => $state,
            'cities'    => City::forState((int) $state['id']),
            'companies' => Company::inState((int) $state['id']),
        ]);
    }

    private function renderCategory(array $category): void
    {
        $this->view('directory/category', [
            'title'     => $category['name'] . ' — Dental Billing Companies',
            'category'  => $category,
            'companies' => Company::byCategory($category['slug']),
        ]);
    }
}
