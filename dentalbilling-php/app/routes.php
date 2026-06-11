<?php
/**
 * Route definitions. $router is provided by index.php.
 * Handlers are "Controller@method" (resolved under App\Controllers).
 *
 * More routes (search, directory, companies, auth, dashboard, admin) are
 * added in later phases.
 *
 * @var App\Core\Router $router
 */

$router->get('/', 'HomeController@index');

// Health check (handy after deploy)
$router->get('/health', function () {
    header('Content-Type: text/plain');
    echo 'ok';
});
