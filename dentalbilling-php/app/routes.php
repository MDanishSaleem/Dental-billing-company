<?php
/**
 * Route definitions. $router is provided by index.php.
 * Handlers are "Controller@method" (resolved under App\Controllers, or a
 * sub-namespace like "Admin\CompanyController@index").
 *
 * IMPORTANT: the catch-all CMS page route ("/{slug}") must stay LAST.
 *
 * @var App\Core\Router $router
 */

// ---- Public ----
$router->get('/', 'HomeController@index');
$router->get('/search', 'SearchController@index');
$router->get('/directory', 'DirectoryController@index');
$router->get('/directory/{state}', 'DirectoryController@state'); // alias
$router->post('/companies/{slug}/lead', 'CompanyController@lead');
$router->post('/companies/{slug}/review', 'CompanyController@review');
$router->get('/companies/{state}/{city}', 'DirectoryController@city');
// One segment after /companies resolves to a state, a service, or a company:
$router->get('/companies/{slug}', 'DirectoryController@resolve');
$router->get('/compare', 'CompareController@index');
$router->get('/pricing', 'PricingController@index');
$router->get('/blog', 'BlogController@index');
$router->get('/blog/{slug}', 'BlogController@show');

// ---- Auth ----
$router->get('/auth/login', 'AuthController@showLogin');
$router->post('/auth/login', 'AuthController@login');
$router->get('/auth/register', 'AuthController@showRegister');
$router->post('/auth/register', 'AuthController@register');
$router->get('/auth/logout', 'AuthController@logout');
$router->get('/auth/forgot-password', 'AuthController@showForgot');
$router->post('/auth/forgot-password', 'AuthController@forgot');

// ---- Company owner dashboard ----
$router->get('/dashboard', 'DashboardController@index');
$router->get('/dashboard/company/new', 'DashboardController@createCompany');
$router->post('/dashboard/company/new', 'DashboardController@storeCompany');
$router->get('/dashboard/profile', 'DashboardController@profile');
$router->post('/dashboard/profile', 'DashboardController@saveProfile');
$router->get('/dashboard/gallery', 'DashboardController@gallery');
$router->post('/dashboard/gallery', 'DashboardController@uploadGallery');
$router->post('/dashboard/gallery/{id}/delete', 'DashboardController@deleteGalleryImage');
$router->get('/dashboard/leads', 'DashboardController@leads');
$router->get('/dashboard/reviews', 'DashboardController@reviews');
$router->get('/dashboard/analytics', 'DashboardController@analytics');
$router->get('/dashboard/subscription', 'DashboardController@subscription');

// ---- Admin ----
$router->get('/admin', 'Admin\\DashboardController@index');
$router->get('/admin/companies', 'Admin\\CompanyController@index');
$router->get('/admin/companies/new', 'Admin\\CompanyController@create');
$router->post('/admin/companies', 'Admin\\CompanyController@store');
// CSV import — must come before the /{id} routes
$router->get('/admin/companies/import/sample', 'Admin\\CompanyController@sampleCsv');
$router->get('/admin/companies/import', 'Admin\\CompanyController@importForm');
$router->post('/admin/companies/import', 'Admin\\CompanyController@import');
$router->post('/admin/companies/import/fields', 'Admin\\CompanyController@saveRequiredFields');
$router->post('/admin/companies/bulk', 'Admin\\CompanyController@bulk');
$router->get('/admin/companies/{id}', 'Admin\\CompanyController@edit');
$router->post('/admin/companies/{id}', 'Admin\\CompanyController@update');
$router->post('/admin/companies/{id}/delete', 'Admin\\CompanyController@delete');
$router->post('/admin/companies/{id}/approve', 'Admin\\CompanyController@approve');
$router->post('/admin/companies/{id}/feature', 'Admin\\CompanyController@feature');
$router->get('/admin/categories', 'Admin\\CategoryController@index');
$router->post('/admin/categories', 'Admin\\CategoryController@store');
$router->post('/admin/categories/{id}/delete', 'Admin\\CategoryController@delete');
$router->get('/admin/states', 'Admin\\StateController@index');
$router->post('/admin/states/{id}/toggle', 'Admin\\StateController@toggle');
$router->get('/admin/reviews', 'Admin\\ReviewController@index');
$router->post('/admin/reviews/{id}/{action}', 'Admin\\ReviewController@moderate');
$router->get('/admin/leads', 'Admin\\LeadController@index');
$router->post('/admin/leads/{id}/status', 'Admin\\LeadController@status');
$router->get('/admin/plans', 'Admin\\PlanController@index');
$router->post('/admin/plans/{id}', 'Admin\\PlanController@update');
$router->post('/admin/plans/{id}/capability', 'Admin\\PlanController@toggleCapability');
$router->get('/admin/blog', 'Admin\\BlogController@index');
$router->get('/admin/blog/new', 'Admin\\BlogController@create');
$router->post('/admin/blog', 'Admin\\BlogController@store');
$router->get('/admin/blog/{id}', 'Admin\\BlogController@edit');
$router->post('/admin/blog/{id}', 'Admin\\BlogController@update');
$router->post('/admin/blog/{id}/delete', 'Admin\\BlogController@delete');
$router->get('/admin/pages', 'Admin\\PageController@index');
$router->get('/admin/pages/new', 'Admin\\PageController@create');
$router->post('/admin/pages', 'Admin\\PageController@store');
$router->get('/admin/pages/{id}', 'Admin\\PageController@edit');
$router->post('/admin/pages/{id}', 'Admin\\PageController@update');
$router->post('/admin/pages/{id}/delete', 'Admin\\PageController@delete');
$router->get('/admin/users', 'Admin\\UserController@index');
$router->post('/admin/users/{id}/role', 'Admin\\UserController@role');
$router->post('/admin/users/{id}/ban', 'Admin\\UserController@ban');
$router->get('/admin/payments', 'Admin\\PaymentController@index');
$router->post('/admin/payments/{id}/status', 'Admin\\PaymentController@status');
$router->get('/admin/settings', 'Admin\\SettingController@index');
$router->post('/admin/settings', 'Admin\\SettingController@save');

// ---- Payments ----
$router->post('/payments/manual', 'PaymentController@manual');

// ---- SEO ----
$router->get('/sitemap.xml', 'SitemapController@index');
$router->get('/robots.txt', 'SitemapController@robots');

// ---- Health check ----
$router->get('/health', function () {
    header('Content-Type: text/plain');
    echo 'ok';
});

// ---- CMS pages (KEEP LAST — matches /about, /contact, /privacy-policy, …) ----
$router->get('/{slug}', 'PageController@show');
