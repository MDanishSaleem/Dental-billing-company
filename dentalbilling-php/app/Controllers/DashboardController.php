<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\Company;
use App\Models\Lead;
use App\Models\Review;
use App\Models\ServiceCategory;
use App\Models\State;
use App\Models\City;

final class DashboardController extends Controller
{
    public function __construct()
    {
        Auth::requireLogin();
    }

    public function index(): void
    {
        $company = Company::forOwner((int) Auth::id());
        $leads = $company ? Lead::forCompany((int) $company['id']) : [];
        $reviews = $company ? Review::forCompanyOwner((int) $company['id']) : [];

        $this->view('dashboard/index', [
            'title'   => 'Dashboard',
            'company' => $company,
            'leadCount'   => count($leads),
            'reviewCount' => count($reviews),
            'active'  => 'home',
        ], 'dashboard');
    }

    public function profile(): void
    {
        $company = Company::forOwner((int) Auth::id());
        $this->view('dashboard/profile', [
            'title'      => 'Company profile',
            'company'    => $company,
            'categories' => ServiceCategory::all(),
            'serviceIds' => $company ? Company::serviceIds((int) $company['id']) : [],
            'states'     => State::all(),
            'cities'     => City::all(),
            'active'     => 'profile',
        ], 'dashboard');
    }

    public function saveProfile(): void
    {
        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Session expired.'); $this->redirect('/dashboard/profile');
        }
        $company = Company::forOwner((int) Auth::id());
        if (!$company) { flash('error', 'No company linked to your account yet.'); $this->redirect('/dashboard'); }

        Company::update((int) $company['id'], [
            'name'              => trim((string) $this->input('name')) ?: $company['name'],
            'slug'              => $company['slug'],
            'status'            => $company['status'],
            'tier'              => $company['tier'],
            'short_description' => trim((string) $this->input('short_description')),
            'description'       => trim((string) $this->input('description')),
            'website'           => trim((string) $this->input('website')),
            'phone'             => trim((string) $this->input('phone')),
            'email'             => trim((string) $this->input('email')),
            'address'           => trim((string) $this->input('address')),
            'founded_year'      => (int) $this->input('founded_year'),
            'team_size'         => trim((string) $this->input('team_size')),
            'city_id'           => (int) $this->input('city_id') ?: (int) $company['city_id'],
            'state_id'          => (int) $this->input('state_id') ?: (int) $company['state_id'],
        ]);
        Company::syncServices((int) $company['id'], (array) ($_POST['services'] ?? []));

        flash('success', 'Profile updated.');
        $this->redirect('/dashboard/profile');
    }

    public function leads(): void
    {
        $company = Company::forOwner((int) Auth::id());
        $this->view('dashboard/leads', [
            'title'   => 'Leads',
            'company' => $company,
            'leads'   => $company ? Lead::forCompany((int) $company['id']) : [],
            'active'  => 'leads',
        ], 'dashboard');
    }

    public function reviews(): void
    {
        $company = Company::forOwner((int) Auth::id());
        $this->view('dashboard/reviews', [
            'title'   => 'Reviews',
            'company' => $company,
            'reviews' => $company ? Review::forCompanyOwner((int) $company['id']) : [],
            'active'  => 'reviews',
        ], 'dashboard');
    }

    public function subscription(): void
    {
        $company = Company::forOwner((int) Auth::id());
        $this->view('dashboard/subscription', [
            'title'   => 'Subscription',
            'company' => $company,
            'active'  => 'subscription',
        ], 'dashboard');
    }

    /** Show the "list your company" form (owners with no company yet). */
    public function createCompany(): void
    {
        if (Company::forOwner((int) Auth::id())) {
            $this->redirect('/dashboard/profile');
        }
        $this->view('dashboard/company-new', [
            'title'      => 'List your company',
            'categories' => ServiceCategory::all(),
            'states'     => State::all(),
            'cities'     => City::all(),
            'active'     => 'home',
        ], 'dashboard');
    }

    /** Create a company owned by the current user (pending admin approval). */
    public function storeCompany(): void
    {
        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Session expired.'); $this->redirect('/dashboard/company/new');
        }
        if (Company::forOwner((int) Auth::id())) {
            $this->redirect('/dashboard/profile');
        }

        $name     = trim((string) $this->input('name'));
        $stateId  = (int) $this->input('state_id');
        $cityId   = (int) $this->input('city_id');
        if ($name === '' || !$stateId || !$cityId) {
            flash('error', 'Company name, state and city are required.');
            $this->redirect('/dashboard/company/new');
        }

        // Build a unique slug
        $slug = slugify($name);
        if (Company::findBySlug($slug)) {
            $slug .= '-' . substr(bin2hex(random_bytes(3)), 0, 5);
        }

        $id = Company::create([
            'owner_id'          => Auth::id(),
            'name'              => $name,
            'slug'              => $slug,
            'status'            => 'PENDING',
            'tier'              => 'FREE',
            'short_description' => trim((string) $this->input('short_description')),
            'description'       => trim((string) $this->input('description')),
            'website'           => trim((string) $this->input('website')),
            'phone'             => trim((string) $this->input('phone')),
            'email'             => trim((string) $this->input('email')),
            'address'           => trim((string) $this->input('address')),
            'founded_year'      => (int) $this->input('founded_year'),
            'team_size'         => trim((string) $this->input('team_size')),
            'city_id'           => $cityId,
            'state_id'          => $stateId,
        ]);
        Company::syncServices($id, (array) ($_POST['services'] ?? []));

        flash('success', 'Your listing was submitted! It will go live once an admin approves it.');
        $this->redirect('/dashboard');
    }
}
