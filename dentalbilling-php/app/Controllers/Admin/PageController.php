<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Page;

final class PageController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/pages/index', [
            'title'  => 'Pages',
            'active' => 'pages',
            'pages'  => Page::all(),
        ]);
    }

    public function create(): void
    {
        $this->admin('admin/pages/form', [
            'title'  => 'New page',
            'active' => 'pages',
            'page'   => null,
        ]);
    }

    public function store(): void
    {
        $this->guard('/admin/pages/new');
        $title = trim((string) $this->input('title'));
        if ($title === '') { flash('error', 'Title required.'); $this->redirect('/admin/pages/new'); }
        Page::create([
            'title'  => $title,
            'slug'   => slugify((string) ($this->input('slug') ?: $title)),
            'body'   => (string) $this->input('body'),
            'status' => $this->input('status', 'PUBLISHED'),
        ]);
        flash('success', 'Page created.');
        $this->redirect('/admin/pages');
    }

    public function edit(array $args): void
    {
        $page = Page::find((int) $args['id']);
        if (!$page) { $this->notFound(); return; }
        $this->admin('admin/pages/form', [
            'title'  => 'Edit page',
            'active' => 'pages',
            'page'   => $page,
        ]);
    }

    public function update(array $args): void
    {
        $this->guard('/admin/pages/' . (int) $args['id']);
        $page = Page::find((int) $args['id']);
        if (!$page) { $this->notFound(); return; }
        Page::update((int) $page['id'], [
            'title'  => trim((string) $this->input('title')),
            'slug'   => slugify((string) ($this->input('slug') ?: $this->input('title'))),
            'body'   => (string) $this->input('body'),
            'status' => $this->input('status', 'PUBLISHED'),
        ]);
        flash('success', 'Page updated.');
        $this->redirect('/admin/pages/' . (int) $page['id']);
    }

    public function delete(array $args): void
    {
        $this->guard('/admin/pages');
        Page::delete((int) $args['id']);
        flash('success', 'Page deleted.');
        $this->redirect('/admin/pages');
    }
}
