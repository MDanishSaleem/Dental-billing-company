<?php /** @var array $plans @var array $catalog @var array $planCaps @var bool $capsEnabled */ ?>
<h1>Plans &amp; features</h1>
<p class="muted">Toggle a feature to grant or revoke that <strong>functionality</strong> for everyone on that plan
(e.g. enable “Company logo” on Free and Free-plan owners can upload a logo).</p>

<?php if (!$capsEnabled): ?>
    <div class="alert alert--error">
        Feature control isn’t enabled yet. Import
        <code>migrations/002_capabilities_and_nofollow.sql</code> via phpMyAdmin once, then refresh.
    </div>
<?php endif; ?>

<?php foreach ($plans as $p): ?>
    <?php $enabled = $planCaps[(int) $p['id']] ?? []; ?>
    <div class="card">
        <div class="toolbar" style="margin-bottom:1rem">
            <h2 style="margin:0"><?= e($p['name']) ?> <span class="muted">— $<?= e(number_format((float)$p['price'])) ?>/mo</span></h2>
            <span class="pill <?= (int)$p['active']===1?'pill--green':'pill--red' ?>"><?= (int)$p['active']===1?'Active':'Inactive' ?></span>
        </div>

        <form method="post" action="<?= url('/admin/plans/' . e($p['id'])) ?>" class="form" style="max-width:none;margin-bottom:1.25rem">
            <?= csrf_field() ?>
            <div class="form-row">
                <div><label>Name</label><input type="text" name="name" value="<?= e($p['name']) ?>"></div>
                <div><label>Price (USD/mo)</label><input type="number" step="0.01" name="price" value="<?= e($p['price']) ?>"></div>
            </div>
            <label style="display:flex;align-items:center;gap:.5rem;margin-top:.75rem">
                <input type="checkbox" name="active" value="1" <?= (int)$p['active']===1?'checked':'' ?>> Active (shown on pricing page)
            </label>
            <button class="btn btn--ghost btn--sm" type="submit" style="margin-top:.75rem">Save plan</button>
        </form>

        <?php if ($capsEnabled): ?>
        <h3 style="font-size:1rem;margin:.5rem 0">Features &amp; functionality</h3>
        <table class="table">
            <tbody>
            <?php foreach ($catalog as $key => $meta): ?>
                <?php $on = in_array($key, $enabled, true); ?>
                <tr>
                    <td style="width:55%">
                        <strong><?= e($meta['label']) ?></strong><br>
                        <span class="muted" style="font-size:.85rem"><?= e($meta['desc']) ?></span>
                    </td>
                    <td><span class="pill <?= $on?'pill--green':'' ?>"><?= $on?'Enabled':'Disabled' ?></span></td>
                    <td style="text-align:right">
                        <form class="inline-form" method="post" action="<?= url('/admin/plans/' . e($p['id']) . '/capability') ?>">
                            <?= csrf_field() ?>
                            <input type="hidden" name="cap" value="<?= e($key) ?>">
                            <button class="btn <?= $on?'btn--ghost':'btn--primary' ?> btn--sm"><?= $on?'Disable':'Enable' ?></button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>
    </div>
<?php endforeach; ?>
