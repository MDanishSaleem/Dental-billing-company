<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Models\ServiceCategory;

final class CategoryController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/categories', [
            'title'      => 'Service categories',
            'active'     => 'categories',
            'categories' => ServiceCategory::all(),
        ]);
    }

    public function store(): void
    {
        $this->guard('/admin/categories');
        $name = trim((string) $this->input('name'));
        if ($name !== '') {
            Database::execute(
                "INSERT INTO service_categories (name,slug,description,icon,sort_order) VALUES (?,?,?,?,?)",
                [$name, slugify($name), trim((string) $this->input('description')),
                 trim((string) $this->input('icon')) ?: '🦷', (int) $this->input('sort_order')]
            );
            flash('success', 'Category added.');
        }
        $this->redirect('/admin/categories');
    }

    public function delete(array $args): void
    {
        $this->guard('/admin/categories');
        Database::execute("DELETE FROM service_categories WHERE id=?", [(int) $args['id']]);
        flash('success', 'Category deleted.');
        $this->redirect('/admin/categories');
    }
}
