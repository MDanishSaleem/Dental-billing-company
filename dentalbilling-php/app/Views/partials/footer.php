<footer class="footer">
    <div class="container footer__grid">
        <div>
            <a href="<?= url('/') ?>" class="nav__brand nav__brand--light">
                <span class="nav__logo">D</span>
                <span><?= e(setting('site_name', 'DentalBilling.us')) ?></span>
            </a>
            <p class="footer__tag">The trusted directory of dental billing companies across the United States.</p>
        </div>
        <div>
            <h4>Explore</h4>
            <a href="<?= url('/search') ?>">Find Companies</a>
            <a href="<?= url('/directory') ?>">Browse by State</a>
            <a href="<?= url('/compare') ?>">Compare</a>
            <a href="<?= url('/pricing') ?>">Pricing</a>
        </div>
        <div>
            <h4>Company</h4>
            <a href="<?= url('/about') ?>">About</a>
            <a href="<?= url('/contact') ?>">Contact</a>
            <a href="<?= url('/blog') ?>">Blog</a>
        </div>
        <div>
            <h4>Legal</h4>
            <a href="<?= url('/privacy-policy') ?>">Privacy Policy</a>
            <a href="<?= url('/terms') ?>">Terms of Service</a>
        </div>
    </div>
    <div class="container footer__bottom">
        &copy; <?= date('Y') ?> <?= e(setting('site_name', 'DentalBilling.us')) ?>. All rights reserved.
    </div>
</footer>
