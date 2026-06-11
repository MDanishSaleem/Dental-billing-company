<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\BlogPost;

final class BlogController extends Controller
{
    public function index(): void
    {
        $this->view('blog/index', [
            'title' => 'Blog — Dental Billing Insights',
            'posts' => BlogPost::published(30),
        ]);
    }

    public function show(array $args): void
    {
        $post = BlogPost::findBySlug($args['slug'] ?? '');
        if (!$post) { $this->notFound(); return; }

        $this->view('blog/show', [
            'title'           => $post['title'],
            'post'            => $post,
            'metaDescription' => excerpt($post['excerpt'] ?: $post['body'], 155),
        ]);
    }
}
