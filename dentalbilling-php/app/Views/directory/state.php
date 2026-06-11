<?php /** @var array $state @var array $cities @var array $companies */ ?>
<section class="page-head">
    <div class="container">
        <nav class="crumbs"><a href="<?= url('/directory') ?>">Directory</a> / <span><?= e($state['name']) ?></span></nav>
        <h1>Dental billing companies in <?= e($state['name']) ?></h1>
        <p class="muted"><?= e($state['company_count']) ?> active compan<?= (int)$state['company_count'] === 1 ? 'y' : 'ies' ?> across <?= count($cities) ?> cities.</p>
    </div>
</section>

<section class="section">
    <div class="container">
        <?php if (!empty($cities)): ?>
            <h2 class="section__subtitle">Cities</h2>
            <div class="grid grid--states" style="margin-bottom:2.5rem">
                <?php foreach ($cities as $city): ?>
                    <a href="<?= url('/companies/' . e($city['slug']) . '/' . e($state['slug'])) ?>" class="state-pill">
                        <span><?= e($city['name']) ?></span>
                        <span class="state-pill__count"><?= e($city['company_count']) ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <h2 class="section__subtitle">All companies in <?= e($state['name']) ?></h2>
        <div class="grid grid--cards">
            <?php foreach ($companies as $c): ?>
                <?= partial('partials/company_card', ['c' => $c]) ?>
            <?php endforeach; ?>
        </div>
        <?php if (empty($companies)): ?>
            <p class="muted">No companies listed in <?= e($state['name']) ?> yet.</p>
        <?php endif; ?>
    </div>
</section>
