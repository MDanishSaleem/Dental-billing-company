<?php /** @var ?array $company @var int $leadCount @var int $reviewCount */ ?>
<h1>Welcome back, <?= e(auth()['name']) ?></h1>
<?= partial('partials/flash', []) ?>

<?php if (!$company): ?>
    <div class="card">
        <h2>List your company</h2>
        <p class="muted">You don’t have a listing yet. Add your dental billing company to appear in the directory — it goes live once an admin approves it.</p>
        <a href="<?= url('/dashboard/company/new') ?>" class="btn btn--primary">+ List your company</a>
        <a href="<?= url('/search') ?>" class="btn btn--ghost">Browse listings</a>
    </div>
<?php else: ?>
    <?php if ($company['status'] === 'PENDING'): ?>
        <div class="alert alert--success" style="background:#fffbeb;color:#b45309;border-color:#fde68a">
            Your listing <strong><?= e($company['name']) ?></strong> is awaiting admin approval. You can keep editing it in the meantime.
        </div>
    <?php endif; ?>
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
