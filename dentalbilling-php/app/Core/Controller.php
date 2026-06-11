<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Base controller with view/redirect/json helpers.
 */
abstract class Controller
{
    protected function view(string $view, array $data = [], string $layout = 'public'): void
    {
        View::render($view, $data, $layout);
    }

    protected function redirect(string $path): void
    {
        header('Location: ' . url($path));
        exit;
    }

    protected function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    protected function notFound(): void
    {
        http_response_code(404);
        View::render('errors/404', [], 'public');
        exit;
    }

    /** Read a POST field with optional default. */
    protected function input(string $key, $default = null)
    {
        return $_POST[$key] ?? $default;
    }
}
