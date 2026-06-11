<?php
/**
 * Front controller — single entry point for every request.
 */
declare(strict_types=1);

define('BASE_PATH', __DIR__);
define('APP_PATH', BASE_PATH . '/app');

$config = require BASE_PATH . '/config.php';
$GLOBALS['config'] = $config;

// Error reporting based on environment
if (($config['site']['env'] ?? 'production') === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
    ini_set('display_errors', '0');
}

// Simple PSR-4-ish autoloader for the App\ namespace
spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $file = APP_PATH . '/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

require APP_PATH . '/Core/helpers.php';

// Sessions
session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure'   => !empty($_SERVER['HTTPS']),
]);
session_start();

// Boot the database connection (lazy — only connects when first used)
App\Core\Database::init($config['db']);

// Routing
$router = new App\Core\Router();
require APP_PATH . '/routes.php';

try {
    $router->dispatch(
        $_SERVER['REQUEST_METHOD'] ?? 'GET',
        parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/'
    );
} catch (Throwable $e) {
    http_response_code(500);
    if (($config['site']['env'] ?? 'production') === 'development') {
        echo '<pre style="padding:2rem;font:14px monospace">';
        echo htmlspecialchars($e->getMessage()) . "\n\n" . htmlspecialchars($e->getTraceAsString());
        echo '</pre>';
    } else {
        echo App\Core\View::renderToString('errors/500', [], 'public');
    }
}
