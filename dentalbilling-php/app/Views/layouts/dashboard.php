<?php /** @var string $content @var string $title @var string $active */ ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($title ?? 'Dashboard') ?> — <?= e(setting('site_name', 'DentalBilling.us')) ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= asset('css/app.css') ?>">
</head>
<body>
    <?php require APP_PATH . '/Views/partials/navbar.php'; ?>
    <div class="shell">
        <aside class="shell__side">
            <h4>Company</h4>
            <a href="<?= url('/dashboard') ?>" class="<?= ($active ?? '')==='home' ? 'is-active':'' ?>">Overview</a>
            <a href="<?= url('/dashboard/profile') ?>" class="<?= ($active ?? '')==='profile' ? 'is-active':'' ?>">Profile</a>
            <a href="<?= url('/dashboard/leads') ?>" class="<?= ($active ?? '')==='leads' ? 'is-active':'' ?>">Leads</a>
            <a href="<?= url('/dashboard/reviews') ?>" class="<?= ($active ?? '')==='reviews' ? 'is-active':'' ?>">Reviews</a>
            <a href="<?= url('/dashboard/subscription') ?>" class="<?= ($active ?? '')==='subscription' ? 'is-active':'' ?>">Subscription</a>
            <h4>Account</h4>
            <a href="<?= url('/') ?>">View site</a>
            <a href="<?= url('/auth/logout') ?>">Log out</a>
        </aside>
        <main class="shell__main">
            <?= $content ?>
        </main>
    </div>
</body>
</html>
