<?php /** @var array $payments */ ?>
<h1>Payments</h1>
<table class="table">
    <thead><tr><th>Date</th><th>Company</th><th>Plan</th><th>Provider</th><th>Amount</th><th>Reference</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($payments as $p): ?>
        <tr>
            <td><?= date('M j, Y', strtotime($p['created_at'])) ?></td>
            <td><?= e($p['company_name'] ?: '—') ?></td>
            <td><?= e($p['plan_name'] ?: '—') ?></td>
            <td><span class="pill"><?= e($p['provider']) ?></span></td>
            <td>$<?= e(number_format((float)$p['amount'], 2)) ?></td>
            <td class="muted"><?= e($p['reference']) ?></td>
            <td>
                <form class="inline-form" method="post" action="<?= url('/admin/payments/' . e($p['id']) . '/status') ?>">
                    <?= csrf_field() ?>
                    <select name="status" onchange="this.form.submit()">
                        <?php foreach (['PENDING','COMPLETED','FAILED','REFUNDED'] as $st): ?>
                            <option value="<?= $st ?>" <?= $p['status']===$st?'selected':'' ?>><?= $st ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (empty($payments)): ?><tr><td colspan="7" class="muted">No payments yet.</td></tr><?php endif; ?>
    </tbody>
</table>
