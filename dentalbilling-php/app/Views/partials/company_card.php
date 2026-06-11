<?php /** @var array $c */ ?>
<a href="<?= url('/companies/' . e($c['slug'])) ?>" class="company-card">
    <div class="company-card__top">
        <div class="company-card__logo"><?= e(strtoupper(substr($c['name'], 0, 1))) ?></div>
        <?php if (($c['tier'] ?? '') === 'FEATURED'): ?><span class="badge badge--gold">Featured</span>
        <?php elseif (($c['tier'] ?? '') === 'PREMIUM'): ?><span class="badge badge--emerald">Premium</span><?php endif; ?>
    </div>
    <h3 class="company-card__name"><?= e($c['name']) ?></h3>
    <div class="company-card__loc"><?= e($c['city_name']) ?>, <?= e($c['abbreviation']) ?></div>
    <div class="company-card__rating">
        <?= stars_html((float) $c['rating']) ?>
        <span><?= e(number_format((float) $c['rating'], 1)) ?> (<?= e($c['review_count']) ?>)</span>
    </div>
    <p class="company-card__desc"><?= e(excerpt($c['short_description'] ?: $c['description'], 110)) ?></p>
</a>
