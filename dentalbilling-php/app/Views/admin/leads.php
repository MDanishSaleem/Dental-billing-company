<?php /** @var array $leads */ ?>
<h1>Leads</h1>
<table class="table">
    <thead><tr><th>Date</th><th>Company</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($leads as $l): ?>
        <tr>
            <td><?= date('M j, Y', strtotime($l['created_at'])) ?></td>
            <td><?= e($l['company_name']) ?></td>
            <td><?= e($l['name']) ?></td>
            <td><a href="mailto:<?= e($l['email']) ?>"><?= e($l['email']) ?></a></td>
            <td><?= e($l['phone']) ?></td>
            <td>
                <form class="inline-form" method="post" action="<?= url('/admin/leads/' . e($l['id']) . '/status') ?>">
                    <?= csrf_field() ?>
                    <select name="status" onchange="this.form.submit()">
                        <?php foreach (['NEW','CONTACTED','CONVERTED','ARCHIVED'] as $st): ?>
                            <option value="<?= $st ?>" <?= $l['status']===$st?'selected':'' ?>><?= $st ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (empty($leads)): ?><tr><td colspan="6" class="muted">No leads yet.</td></tr><?php endif; ?>
    </tbody>
</table>
