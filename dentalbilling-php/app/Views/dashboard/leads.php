<?php /** @var ?array $company @var array $leads */ ?>
<h1>Leads</h1>
<?php if (!$company): ?>
    <div class="card"><p class="muted">No company linked to your account.</p></div>
<?php elseif (empty($leads)): ?>
    <div class="card"><p class="muted">No leads yet. They’ll appear here when practices contact you.</p></div>
<?php else: ?>
<table class="table">
    <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($leads as $l): ?>
        <tr>
            <td><?= date('M j, Y', strtotime($l['created_at'])) ?></td>
            <td><?= e($l['name']) ?></td>
            <td><a href="mailto:<?= e($l['email']) ?>"><?= e($l['email']) ?></a></td>
            <td><?= e($l['phone']) ?></td>
            <td><?= e(excerpt($l['message'], 60)) ?></td>
            <td><span class="pill"><?= e($l['status']) ?></span></td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
<?php endif; ?>
