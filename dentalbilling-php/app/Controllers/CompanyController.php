<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Company;
use App\Models\CompanyGallery;
use App\Models\Lead;
use App\Models\Review;
use App\Core\Auth;

final class CompanyController extends Controller
{
    /** /companies/{slug} */
    public function show(array $args): void
    {
        $company = Company::findBySlug($args['slug'] ?? '');
        if (!$company || $company['status'] !== 'ACTIVE') { $this->notFound(); return; }

        $this->view('company/show', [
            'title'      => $company['name'] . ' — Dental Billing in ' . $company['city_name'],
            'company'    => $company,
            'services'   => Company::services((int) $company['id']),
            'reviews'    => Review::approvedForCompany((int) $company['id']),
            'gallery'    => cap($company, 'gallery') ? CompanyGallery::forCompany((int) $company['id']) : [],
            'metaDescription' => excerpt($company['description'], 155),
        ]);
    }

    /** POST /companies/{slug}/lead — contact form. */
    public function lead(array $args): void
    {
        $company = Company::findBySlug($args['slug'] ?? '');
        if (!$company) { $this->notFound(); return; }

        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Your session expired. Please try again.');
            $this->redirect('/companies/' . $company['slug']);
        }

        $name  = trim((string) $this->input('name'));
        $email = trim((string) $this->input('email'));
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            flash('error', 'Please enter your name and a valid email.');
            $this->redirect('/companies/' . $company['slug']);
        }

        Lead::create([
            'company_id' => (int) $company['id'],
            'name'       => $name,
            'email'      => $email,
            'phone'      => trim((string) $this->input('phone')),
            'message'    => trim((string) $this->input('message')),
        ]);

        flash('success', 'Thanks! Your message has been sent to ' . $company['name'] . '.');
        $this->redirect('/companies/' . $company['slug']);
    }

    /** POST /companies/{slug}/review */
    public function review(array $args): void
    {
        $company = Company::findBySlug($args['slug'] ?? '');
        if (!$company) { $this->notFound(); return; }

        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Your session expired. Please try again.');
            $this->redirect('/companies/' . $company['slug']);
        }

        $author = trim((string) $this->input('author_name'));
        $rating = (int) $this->input('rating');
        if ($author === '' || $rating < 1 || $rating > 5) {
            flash('error', 'Please add your name and a rating from 1 to 5.');
            $this->redirect('/companies/' . $company['slug']);
        }

        Review::create([
            'company_id'  => (int) $company['id'],
            'user_id'     => Auth::id(),
            'author_name' => $author,
            'rating'      => $rating,
            'title'       => trim((string) $this->input('title')),
            'body'        => trim((string) $this->input('body')),
            'status'      => 'PENDING',
        ]);

        flash('success', 'Thanks for your review! It will appear after approval.');
        $this->redirect('/companies/' . $company['slug']);
    }
}
