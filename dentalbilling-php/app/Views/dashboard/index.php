<?php /** @var ?array $company @var int $leadCount @var int $reviewCount */ ?>
<h1>Welcome back, <?= e(auth()['name']) ?></h1>
<?= partial('partials/flash', []) ?>

<?php if (!$company): ?>
    <div class="card">
        <h2>No company linked yet</h2>
        <p class="muted">Your account isn’t linked to a listing yet. An admin can assign one, or you can claim an existing listing from its profile page.</p>
        <a href="<?= url('/search') ?>" class="btn btn--primary">Browse listings</a>
    </div>
<?php else: ?>
    <div class="stat-cards">
        <div class="stat-card"><strong><?= e($leadCount) ?></strong><span>Total leads</span></div>
        <div class="stat-card"><strong><?= e($reviewCount) ?></strong><span>Reviews</span></div>
        <div class="stat-card"><strong><?= e(number_format((float)$company['rating'],1)) ?></strong><span>Rating</span></div>
        <div class="stat-card"><strong><?= e(ucfirst(strtolower($company['tier']))) ?></strong><span>Current plan</span></div>
    </div>
    <div class="card">
        <div class="toolbar">
            <h2 style="margin:0"><?= e($company['name']) ?></h2>
            <div>
                <a href="<?= url('/companies/' . e($company['slug'])) ?>" class="btn btn--ghost btn--sm">View public page</a>
                <a href="<?= url('/dashboard/profile') ?>" class="btn btn--primary btn--sm">Edit profile</a>
            </div>
        </div>
        <p class="muted"><?= e($company['city_name']) ?>, <?= e($company['state_name']) ?> ·
            Status: <span class="pill pill--green"><?= e($company['status']) ?></span></p>
    </div>
<?php endif; ?>
