<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Renders plain-PHP view templates inside a layout.
 * Views live in app/Views, layouts in app/Views/layouts.
 */
final class View
{
    public static function renderToString(string $view, array $data = [], string $layout = 'public'): string
    {
        $viewFile = APP_PATH . '/Views/' . $view . '.php';
        if (!is_file($viewFile)) {
            return 'View not found: ' . htmlspecialchars($view);
        }

        // Render the inner view
        extract($data, EXTR_SKIP);
        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        if ($layout === '' || $layout === null) {
            return $content;
        }

        // Wrap in layout
        $layoutFile = APP_PATH . '/Views/layouts/' . $layout . '.php';
        if (!is_file($layoutFile)) {
            return $content;
        }
        ob_start();
        require $layoutFile;
        return ob_get_clean();
    }

    public static function render(string $view, array $data = [], string $layout = 'public'): void
    {
        echo self::renderToString($view, $data, $layout);
    }
}
