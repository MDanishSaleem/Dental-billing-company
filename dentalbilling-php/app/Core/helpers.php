<?php
declare(strict_types=1);

use App\Core\Auth;

/** Escape HTML output. */
function e($value): string
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES, 'UTF-8');
}

/** Build an absolute URL from a path. */
function url(string $path = '/'): string
{
    $base = rtrim($GLOBALS['config']['site']['url'] ?? '', '/');
    return $base . '/' . ltrim($path, '/');
}

/** Build a URL to an asset in /assets. */
function asset(string $path): string
{
    return url('assets/' . ltrim($path, '/'));
}

/** Site setting helper (reads the settings table, cached per request). */
function setting(string $key, $default = null)
{
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        foreach (App\Core\Database::all('SELECT `key`, `value` FROM settings') as $row) {
            $cache[$row['key']] = $row['value'];
        }
    }
    return $cache[$key] ?? $default;
}

/** Current logged-in user (or null). */
function auth(): ?array
{
    return Auth::user();
}

/** Render a CSRF hidden input. */
function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(Auth::csrfToken()) . '">';
}

/** Old input value (for re-populating forms after validation errors). */
function old(string $key, $default = '')
{
    return $_SESSION['_old'][$key] ?? $default;
}

/** Flash a message for the next request. */
function flash(string $key, ?string $message = null)
{
    if ($message !== null) {
        $_SESSION['_flash'][$key] = $message;
        return null;
    }
    $val = $_SESSION['_flash'][$key] ?? null;
    unset($_SESSION['_flash'][$key]);
    return $val;
}

/** Format a number compactly (1200 -> 1.2k). */
function compact_number($n): string
{
    $n = (int) $n;
    if ($n >= 1000000) return round($n / 1000000, 1) . 'M';
    if ($n >= 1000)    return round($n / 1000, 1) . 'k';
    return (string) $n;
}

/** Does a company's plan grant a capability? (entitlement gate for views) */
function cap(?array $company, string $key): bool
{
    if (!$company) {
        return false;
    }
    return App\Models\Capability::can($company['tier'] ?? 'FREE', $key);
}

/** Render a view fragment (no layout) and return its HTML. */
function partial(string $view, array $data = []): string
{
    return App\Core\View::renderToString($view, $data, '');
}

/** Convert a string to a URL-safe slug. */
function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim((string) $text, '-') ?: 'item';
}

/** Current request path (no query string). */
function current_path(): string
{
    return parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
}

/** Truncate text to a length with an ellipsis. Works with or without mbstring. */
function excerpt(?string $text, int $length = 120): string
{
    $text = trim(strip_tags((string) $text));
    if (function_exists('mb_strlen')) {
        if (mb_strlen($text) <= $length) return $text;
        return rtrim(mb_substr($text, 0, $length)) . '…';
    }
    if (strlen($text) <= $length) return $text;
    return rtrim(substr($text, 0, $length)) . '…';
}

/** Star-rating HTML (0–5, supports halves visually as filled count). */
function stars_html(float $rating): string
{
    $full = (int) round($rating);
    $html = '<span class="stars" aria-label="' . e((string) $rating) . ' out of 5">';
    for ($i = 1; $i <= 5; $i++) {
        $html .= '<span class="star' . ($i <= $full ? ' star--on' : '') . '">★</span>';
    }
    return $html . '</span>';
}
