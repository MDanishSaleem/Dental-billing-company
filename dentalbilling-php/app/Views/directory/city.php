<?php /** @var array $city @var array $companies */ ?>
<section class="page-head">
    <div class="container">
        <nav class="crumbs">
            <a href="<?= url('/directory') ?>">Directory</a> /
            <a href="<?= url('/companies/' . e($city['state_slug'])) ?>"><?= e($city['state_name']) ?></a> /
            <span><?= e($city['name']) ?></span>
        </nav>
        <h1>Dental billing companies in <?= e($city['name']) ?>, <?= e($city['abbreviation']) ?></h1>
        <p class="muted"><?= count($companies) ?> compan<?= count($companies) === 1 ? 'y' : 'ies' ?> serving <?= e($city['name']) ?>.</p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="grid grid--cards">
            <?php foreach ($companies as $c): ?>
                <?= partial('partials/company_card', ['c' => $c]) ?>
            <?php endforeach; ?>
        </div>
        <?php if (empty($companies)): ?>
            <div class="empty">
                <p>No companies in <?= e($city['name']) ?> yet.</p>
                <a href="<?= url('/companies/' . e($city['state_slug'])) ?>" class="btn btn--ghost">See all of <?= e($city['state_name']) ?></a>
            </div>
        <?php endif; ?>
    </div>
</section>
