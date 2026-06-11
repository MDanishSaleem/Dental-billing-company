<?php /** @var array $filters @var array $results @var array $categories @var array $states */ ?>
<section class="page-head">
    <div class="container">
        <h1>Find a dental billing company</h1>
        <form class="search-bar" action="<?= url('/search') ?>" method="get">
            <input type="text" name="q" value="<?= e($filters['q']) ?>" placeholder="Company or service…">
            <input type="text" name="location" value="<?= e($filters['location']) ?>" placeholder="City or state">
            <select name="category">
                <option value="">All services</option>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?= e($cat['slug']) ?>" <?= $filters['category'] === $cat['slug'] ? 'selected' : '' ?>>
                        <?= e($cat['name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <button class="btn btn--primary" type="submit">Search</button>
        </form>
    </div>
</section>

<section class="section">
    <div class="container">
        <p class="muted"><?= count($results) ?> compan<?= count($results) === 1 ? 'y' : 'ies' ?> found</p>
        <div class="grid grid--cards">
            <?php foreach ($results as $c): ?>
                <?= partial('partials/company_card', ['c' => $c]) ?>
            <?php endforeach; ?>
        </div>
        <?php if (empty($results)): ?>
            <div class="empty">
                <p>No companies matched your search.</p>
                <a href="<?= url('/directory') ?>" class="btn btn--ghost">Browse all states</a>
            </div>
        <?php endif; ?>
    </div>
</section>
