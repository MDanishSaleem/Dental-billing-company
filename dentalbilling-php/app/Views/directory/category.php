<?php /** @var array $category @var array $companies */ ?>
<section class="page-head">
    <div class="container">
        <nav class="crumbs"><a href="<?= url('/search') ?>">Services</a> / <span><?= e($category['name']) ?></span></nav>
        <h1><?= e($category['icon']) ?> <?= e($category['name']) ?></h1>
        <?php if (!empty($category['description'])): ?>
            <p class="muted"><?= e($category['description']) ?></p>
        <?php endif; ?>
        <p class="muted"><?= count($companies) ?> compan<?= count($companies) === 1 ? 'y' : 'ies' ?> offering this service.</p>
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
                <p>No companies offer this service yet.</p>
                <a href="<?= url('/search') ?>" class="btn btn--primary">Browse all companies</a>
            </div>
        <?php endif; ?>
    </div>
</section>
