<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Models\BlogPost;
use App\Models\BlogCategory;

final class BlogController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/blog/index', [
            'title'  => 'Blog posts',
            'active' => 'blog',
            'posts'  => BlogPost::adminAll(),
        ]);
    }

    public function create(): void
    {
        $this->admin('admin/blog/form', [
            'title'      => 'New post',
            'active'     => 'blog',
            'post'       => null,
            'categories' => BlogCategory::all(),
        ]);
    }

    public function store(): void
    {
        $this->guard('/admin/blog/new');
        $data = $this->collect();
        if ($data['title'] === '') { flash('error', 'Title required.'); $this->redirect('/admin/blog/new'); }
        $data['slug'] = slugify($data['title']);
        $data['author_id'] = Auth::id();
        BlogPost::create($data);
        flash('success', 'Post created.');
        $this->redirect('/admin/blog');
    }

    public function edit(array $args): void
    {
        $post = BlogPost::find((int) $args['id']);
        if (!$post) { $this->notFound(); return; }
        $this->admin('admin/blog/form', [
            'title'      => 'Edit post',
            'active'     => 'blog',
            'post'       => $post,
            'categories' => BlogCategory::all(),
        ]);
    }

    public function update(array $args): void
    {
        $this->guard('/admin/blog/' . (int) $args['id']);
        $post = BlogPost::find((int) $args['id']);
        if (!$post) { $this->notFound(); return; }
        $data = $this->collect();
        $data['slug'] = $post['slug'];
        BlogPost::update((int) $post['id'], $data);
        flash('success', 'Post updated.');
        $this->redirect('/admin/blog/' . (int) $post['id']);
    }

    public function delete(array $args): void
    {
        $this->guard('/admin/blog');
        BlogPost::delete((int) $args['id']);
        flash('success', 'Post deleted.');
        $this->redirect('/admin/blog');
    }

    private function collect(): array
    {
        return [
            'category_id' => (int) $this->input('category_id'),
            'title'       => trim((string) $this->input('title')),
            'excerpt'     => trim((string) $this->input('excerpt')),
            'body'        => (string) $this->input('body'),
            'image'       => trim((string) $this->input('image')),
            'status'      => $this->input('status', 'DRAFT'),
        ];
    }
}
