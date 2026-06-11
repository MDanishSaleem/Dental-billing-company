<?php /** @var array $stats @var array $recentLeads */ ?>
<h1>Dashboard</h1>
<div class="stat-cards">
    <div class="stat-card"><strong><?= e($stats['companies']) ?></strong><span>Companies</span></div>
    <div class="stat-card"><strong><?= e($stats['active']) ?></strong><span>Active</span></div>
    <div class="stat-card"><strong><?= e($stats['pendingCompanies']) ?></strong><span>Pending approval</span></div>
    <div class="stat-card"><strong><?= e($stats['users']) ?></strong><span>Users</span></div>
    <div class="stat-card"><strong><?= e($stats['newLeads']) ?></strong><span>New leads</span></div>
    <div class="stat-card"><strong><?= e($stats['pendingReviews']) ?></strong><span>Reviews to moderate</span></div>
</div>

<div class="toolbar"><h2 style="margin:0">Recent leads</h2><a href="<?= url('/admin/leads') ?>" class="btn btn--ghost btn--sm">All leads</a></div>
<table class="table">
    <thead><tr><th>Date</th><th>Company</th><th>Name</th><th>Email</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($recentLeads as $l): ?>
        <tr>
            <td><?= date('M j', strtotime($l['created_at'])) ?></td>
            <td><?= e($l['company_name']) ?></td>
            <td><?= e($l['name']) ?></td>
            <td><?= e($l['email']) ?></td>
            <td><span class="pill"><?= e($l['status']) ?></span></td>
        </tr>
    <?php endforeach; ?>
    <?php if (empty($recentLeads)): ?><tr><td colspan="5" class="muted">No leads yet.</td></tr><?php endif; ?>
    </tbody>
</table>
