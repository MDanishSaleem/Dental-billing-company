<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

final class SitemapController extends Controller
{
    public function index(): void
    {
        header('Content-Type: application/xml; charset=utf-8');
        $urls = ['/', '/search', '/directory', '/pricing', '/blog', '/compare'];

        foreach (Database::all("SELECT slug FROM states WHERE active=1") as $r) {
            $urls[] = '/companies/' . $r['slug'];
        }
        foreach (Database::all("SELECT slug FROM service_categories") as $r) {
            $urls[] = '/companies/' . $r['slug'];
        }
        foreach (Database::all(
            "SELECT ci.slug AS city, s.slug AS state FROM cities ci
             JOIN states s ON s.id = ci.state_id WHERE ci.active=1 AND s.active=1") as $r) {
            $urls[] = '/companies/' . $r['state'] . '/' . $r['city'];
        }
        foreach (Database::all("SELECT slug FROM companies WHERE status='ACTIVE'") as $r) {
            $urls[] = '/companies/' . $r['slug'];
        }
        foreach (Database::all("SELECT slug FROM blog_posts WHERE status='PUBLISHED'") as $r) {
            $urls[] = '/blog/' . $r['slug'];
        }
        foreach (Database::all("SELECT slug FROM pages WHERE status='PUBLISHED'") as $r) {
            $urls[] = '/' . $r['slug'];
        }

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $u) {
            echo '  <url><loc>' . e(url($u)) . '</loc></url>' . "\n";
        }
        echo '</urlset>';
    }

    public function robots(): void
    {
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\n";
        echo "Allow: /\n";
        echo "Sitemap: " . url('/sitemap.xml') . "\n";
    }
}
