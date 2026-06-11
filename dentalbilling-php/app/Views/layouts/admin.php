<?php /** @var string $content @var string $title @var string $active */ ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($title ?? 'Admin') ?> — Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= asset('css/app.css') ?>">
</head>
<body>
    <?php require APP_PATH . '/Views/partials/navbar.php'; ?>
    <div class="shell">
        <aside class="shell__side">
            <h4>Overview</h4>
            <a href="<?= url('/admin') ?>" class="<?= ($active ?? '')==='dashboard'?'is-active':'' ?>">Dashboard</a>
            <h4>Catalog</h4>
            <a href="<?= url('/admin/companies') ?>" class="<?= ($active ?? '')==='companies'?'is-active':'' ?>">Companies</a>
            <a href="<?= url('/admin/categories') ?>" class="<?= ($active ?? '')==='categories'?'is-active':'' ?>">Categories</a>
            <a href="<?= url('/admin/states') ?>" class="<?= ($active ?? '')==='states'?'is-active':'' ?>">States & cities</a>
            <a href="<?= url('/admin/plans') ?>" class="<?= ($active ?? '')==='plans'?'is-active':'' ?>">Plans</a>
            <h4>Engagement</h4>
            <a href="<?= url('/admin/reviews') ?>" class="<?= ($active ?? '')==='reviews'?'is-active':'' ?>">Reviews</a>
            <a href="<?= url('/admin/leads') ?>" class="<?= ($active ?? '')==='leads'?'is-active':'' ?>">Leads</a>
            <a href="<?= url('/admin/payments') ?>" class="<?= ($active ?? '')==='payments'?'is-active':'' ?>">Payments</a>
            <h4>Content</h4>
            <a href="<?= url('/admin/blog') ?>" class="<?= ($active ?? '')==='blog'?'is-active':'' ?>">Blog</a>
            <a href="<?= url('/admin/pages') ?>" class="<?= ($active ?? '')==='pages'?'is-active':'' ?>">Pages</a>
            <h4>System</h4>
            <a href="<?= url('/admin/users') ?>" class="<?= ($active ?? '')==='users'?'is-active':'' ?>">Users</a>
            <a href="<?= url('/admin/settings') ?>" class="<?= ($active ?? '')==='settings'?'is-active':'' ?>">Settings</a>
            <a href="<?= url('/auth/logout') ?>">Log out</a>
        </aside>
        <main class="shell__main">
            <?= partial('partials/flash', []) ?>
            <?= $content ?>
        </main>
    </div>
</body>
</html>
