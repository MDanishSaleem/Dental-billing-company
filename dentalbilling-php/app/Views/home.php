<?php /** @var array $featured @var array $categories @var array $states @var array $stats */ ?>

<section class="hero">
    <div class="container">
        <p class="hero__eyebrow">Trusted by dental practices nationwide</p>
        <h1 class="hero__title">Find the right <span class="text-teal">dental billing</span> company for your practice</h1>
        <p class="hero__sub">Compare verified billing companies by location, services, and reviews — and connect directly. Free to search, always.</p>

        <form class="hero__search" action="<?= url('/search') ?>" method="get">
            <input type="text" name="q" placeholder="Search by company name or service…" aria-label="Search">
            <input type="text" name="location" placeholder="City or state" aria-label="Location">
            <button type="submit" class="btn btn--primary">Search</button>
        </form>

        <div class="hero__stats">
            <div><strong><?= e(compact_number($stats['companies'])) ?>+</strong><span>Billing companies</span></div>
            <div><strong><?= e($stats['states']) ?></strong><span>States covered</span></div>
            <div><strong>100%</strong><span>Free to search</span></div>
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="section__head">
            <h2>Browse by service</h2>
            <p>Specialized billing support for every part of your practice.</p>
        </div>
        <div class="grid grid--cats">
            <?php foreach ($categories as $cat): ?>
                <a href="<?= url('/companies/' . e($cat['slug'])) ?>" class="cat-card">
                    <span class="cat-card__icon"><?= e($cat['icon'] ?: '🦷') ?></span>
                    <span class="cat-card__name"><?= e($cat['name']) ?></span>
                    <span class="cat-card__count"><?= e($cat['company_count']) ?> companies</span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section section--alt">
    <div class="container">
        <div class="section__head">
            <h2>Featured companies</h2>
            <p>Top-rated dental billing partners ready to help.</p>
        </div>
        <div class="grid grid--cards">
            <?php foreach ($featured as $c): ?>
                <a href="<?= url('/companies/' . e($c['slug'])) ?>" class="company-card">
                    <div class="company-card__top">
                        <div class="company-card__logo">
                            <?php if (!empty($c['logo'])): ?>
                                <img src="<?= url($c['logo']) ?>" alt="<?= e($c['name']) ?>" style="width:100%;height:100%;object-fit:cover;border-radius:11px">
                            <?php else: ?><?= e(strtoupper(substr($c['name'], 0, 1))) ?><?php endif; ?>
                        </div>
                        <?php if (cap($c, 'featured_badge')): ?><span class="badge badge--gold">Featured</span><?php endif; ?>
                    </div>
                    <h3 class="company-card__name"><?= e($c['name']) ?></h3>
                    <div class="company-card__loc"><?= e($c['city_name']) ?>, <?= e($c['abbreviation']) ?></div>
                    <div class="company-card__rating">
                        <?= stars_html((float) $c['rating']) ?>
                        <span><?= e(number_format((float) $c['rating'], 1)) ?> (<?= e($c['review_count']) ?>)</span>
                    </div>
                    <p class="company-card__desc"><?= e(excerpt($c['description'], 110)) ?></p>
                </a>
            <?php endforeach; ?>
        </div>
        <?php if (empty($featured)): ?>
            <p class="muted center">No companies yet — import the seed data to see listings.</p>
        <?php endif; ?>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="section__head">
            <h2>Browse by state</h2>
            <p>Find dental billing companies near your practice.</p>
        </div>
        <div class="grid grid--states">
            <?php foreach ($states as $s): ?>
                <a href="<?= url('/companies/' . e($s['slug'])) ?>" class="state-pill">
                    <span><?= e($s['name']) ?></span>
                    <span class="state-pill__count"><?= e($s['company_count']) ?></span>
                </a>
            <?php endforeach; ?>
        </div>
        <div class="center" style="margin-top:1.5rem">
            <a href="<?= url('/directory') ?>" class="btn btn--ghost">View all states →</a>
        </div>
    </div>
</section>

<section class="cta">
    <div class="container cta__inner">
        <div>
            <h2>Own a dental billing company?</h2>
            <p>List your business and reach practices actively looking for billing partners.</p>
        </div>
        <a href="<?= url('/pricing') ?>" class="btn btn--gold">Get listed →</a>
    </div>
</section>
