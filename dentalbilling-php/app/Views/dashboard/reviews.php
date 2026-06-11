<?php /** @var ?array $company @var array $reviews */ ?>
<h1>Reviews</h1>
<?php if (!$company): ?>
    <div class="card"><p class="muted">No company linked to your account.</p></div>
<?php elseif (empty($reviews)): ?>
    <div class="card"><p class="muted">No reviews yet.</p></div>
<?php else: ?>
<table class="table">
    <thead><tr><th>Date</th><th>Author</th><th>Rating</th><th>Review</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($reviews as $r): ?>
        <tr>
            <td><?= date('M j, Y', strtotime($r['created_at'])) ?></td>
            <td><?= e($r['author_name']) ?></td>
            <td><?= stars_html((float)$r['rating']) ?></td>
            <td><strong><?= e($r['title']) ?></strong><br><span class="muted"><?= e(excerpt($r['body'], 80)) ?></span></td>
            <td><span class="pill <?= $r['status']==='APPROVED'?'pill--green':($r['status']==='REJECTED'?'pill--red':'pill--amber') ?>"><?= e($r['status']) ?></span></td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
<?php endif; ?>
