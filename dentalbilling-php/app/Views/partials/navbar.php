<header class="nav">
    <div class="container nav__inner">
        <a href="<?= url('/') ?>" class="nav__brand">
            <span class="nav__logo">D</span>
            <span><?= e(setting('site_name', 'DentalBilling.us')) ?></span>
        </a>

        <nav class="nav__links">
            <a href="<?= url('/search') ?>">Find Companies</a>
            <a href="<?= url('/directory') ?>">Directory</a>
            <a href="<?= url('/pricing') ?>">Pricing</a>
            <a href="<?= url('/blog') ?>">Blog</a>
        </nav>

        <div class="nav__actions">
            <?php if (auth()): ?>
                <?php if (auth()['role'] === 'ADMIN'): ?>
                    <a href="<?= url('/admin') ?>" class="btn btn--ghost">Admin</a>
                <?php else: ?>
                    <a href="<?= url('/dashboard') ?>" class="btn btn--ghost">Dashboard</a>
                <?php endif; ?>
                <a href="<?= url('/auth/logout') ?>" class="btn btn--ghost">Log out</a>
            <?php else: ?>
                <a href="<?= url('/auth/login') ?>" class="btn btn--ghost">Log in</a>
                <a href="<?= url('/pricing') ?>" class="btn btn--primary">List your company</a>
            <?php endif; ?>
        </div>
    </div>
</header>
