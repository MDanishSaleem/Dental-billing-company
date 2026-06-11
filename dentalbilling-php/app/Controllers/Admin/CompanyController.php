<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Company;
use App\Models\ServiceCategory;
use App\Models\State;
use App\Models\City;

final class CompanyController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/companies/index', [
            'title'     => 'Companies',
            'active'    => 'companies',
            'companies' => Company::adminAll(),
        ]);
    }

    public function create(): void
    {
        $this->admin('admin/companies/form', [
            'title'      => 'New company',
            'active'     => 'companies',
            'company'    => null,
            'serviceIds' => [],
            'categories' => ServiceCategory::all(),
            'states'     => State::all(),
            'cities'     => City::all(),
        ]);
    }

    public function store(): void
    {
        $this->guard('/admin/companies/new');
        $data = $this->collect();
        if ($data['name'] === '') { flash('error', 'Name is required.'); $this->redirect('/admin/companies/new'); }
        $data['slug'] = slugify($data['name']);
        $id = Company::create($data);
        Company::syncServices($id, (array) ($_POST['services'] ?? []));
        flash('success', 'Company created.');
        $this->redirect('/admin/companies');
    }

    public function edit(array $args): void
    {
        $company = Company::findById((int) $args['id']);
        if (!$company) { $this->notFound(); return; }
        $this->admin('admin/companies/form', [
            'title'      => 'Edit ' . $company['name'],
            'active'     => 'companies',
            'company'    => $company,
            'serviceIds' => Company::serviceIds((int) $company['id']),
            'categories' => ServiceCategory::all(),
            'states'     => State::all(),
            'cities'     => City::all(),
        ]);
    }

    public function update(array $args): void
    {
        $id = (int) $args['id'];
        $this->guard('/admin/companies/' . $id);
        $data = $this->collect();
        $existing = Company::findById($id);
        if (!$existing) { $this->notFound(); return; }
        $data['slug'] = $existing['slug'];
        Company::update($id, $data);
        Company::syncServices($id, (array) ($_POST['services'] ?? []));
        flash('success', 'Company updated.');
        $this->redirect('/admin/companies/' . $id);
    }

    public function delete(array $args): void
    {
        $this->guard('/admin/companies');
        Company::delete((int) $args['id']);
        flash('success', 'Company deleted.');
        $this->redirect('/admin/companies');
    }

    public function approve(array $args): void
    {
        $this->guard('/admin/companies');
        Company::setStatus((int) $args['id'], 'ACTIVE');
        flash('success', 'Company approved.');
        $this->redirect('/admin/companies');
    }

    public function feature(array $args): void
    {
        $this->guard('/admin/companies');
        $company = Company::findById((int) $args['id']);
        if ($company) {
            Company::setTier((int) $args['id'], $company['tier'] === 'FEATURED' ? 'PREMIUM' : 'FEATURED');
        }
        flash('success', 'Featured status updated.');
        $this->redirect('/admin/companies');
    }

    private function collect(): array
    {
        return [
            'name'              => trim((string) $this->input('name')),
            'status'            => $this->input('status', 'PENDING'),
            'tier'              => $this->input('tier', 'FREE'),
            'short_description' => trim((string) $this->input('short_description')),
            'description'       => trim((string) $this->input('description')),
            'website'           => trim((string) $this->input('website')),
            'phone'             => trim((string) $this->input('phone')),
            'email'             => trim((string) $this->input('email')),
            'address'           => trim((string) $this->input('address')),
            'founded_year'      => (int) $this->input('founded_year'),
            'team_size'         => trim((string) $this->input('team_size')),
            'city_id'           => (int) $this->input('city_id'),
            'state_id'          => (int) $this->input('state_id'),
        ];
    }
}
