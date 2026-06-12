<?php /** @var array $company @var array $leads @var array $reviews */
$approved = array_filter($reviews, static fn($r) => $r['status'] === 'APPROVED');
$converted = array_filter($leads, static fn($l) => $l['status'] === 'CONVERTED'); ?>
<h1>Analytics</h1>
<p class="muted">Performance overview for <strong><?= e($company['name']) ?></strong>.</p>

<div class="stat-cards">
    <div class="stat-card"><strong><?= count($leads) ?></strong><span>Total leads</span></div>
    <div class="stat-card"><strong><?= count($converted) ?></strong><span>Converted</span></div>
    <div class="stat-card"><strong><?= count($reviews) ?></strong><span>Reviews</span></div>
    <div class="stat-card"><strong><?= e(number_format((float) $company['rating'], 1)) ?></strong><span>Avg rating</span></div>
</div>

<div class="card">
    <h2>Leads by status</h2>
    <table class="table">
        <thead><tr><th>Status</th><th>Count</th></tr></thead>
        <tbody>
        <?php foreach (['NEW','CONTACTED','CONVERTED','ARCHIVED'] as $st): ?>
            <tr><td><?= $st ?></td><td><?= count(array_filter($leads, static fn($l) => $l['status'] === $st)) ?></td></tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
