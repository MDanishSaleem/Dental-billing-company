<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Page;

final class PageController extends Controller
{
    /** /{slug} — CMS page (about, contact, privacy-policy, terms, …). */
    public function show(array $args): void
    {
        $page = Page::findBySlug($args['slug'] ?? '');
        if (!$page) { $this->notFound(); return; }

        $this->view('page', [
            'title' => $page['title'],
            'page'  => $page,
        ]);
    }
}
