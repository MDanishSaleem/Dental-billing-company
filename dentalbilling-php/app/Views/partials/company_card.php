<?php /** @var array $c */ ?>
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
    <p class="company-card__desc"><?= e(excerpt($c['short_description'] ?: $c['description'], 110)) ?></p>
</a>
