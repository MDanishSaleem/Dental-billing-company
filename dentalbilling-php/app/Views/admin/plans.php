<?php /** @var array $plans @var array $features @var bool $featuresEnabled */ ?>
<h1>Plans &amp; features</h1>

<?php if (!$featuresEnabled): ?>
    <div class="alert alert--error">
        Per-feature management is not enabled yet. Import
        <code>migrations/001_plan_features.sql</code> via phpMyAdmin once, then refresh this page.
    </div>
<?php endif; ?>

<?php foreach ($plans as $p): ?>
    <div class="card">
        <div class="toolbar" style="margin-bottom:1rem">
            <h2 style="margin:0"><?= e($p['name']) ?> <span class="muted">— $<?= e(number_format((float)$p['price'])) ?>/mo</span></h2>
            <span class="pill <?= (int)$p['active']===1?'pill--green':'pill--red' ?>"><?= (int)$p['active']===1?'Active':'Inactive' ?></span>
        </div>

        <!-- Plan basics -->
        <form method="post" action="<?= url('/admin/plans/' . e($p['id'])) ?>" class="form" style="max-width:none;margin-bottom:1rem">
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

        <?php if ($featuresEnabled): ?>
        <!-- Feature list -->
        <h3 style="font-size:1rem;margin:.5rem 0">Features</h3>
        <table class="table" style="margin-bottom:.75rem">
            <tbody>
            <?php foreach ($features[(int)$p['id']] as $f): ?>
                <tr>
                    <td style="width:60%">
                        <?php if ((int)$f['enabled']===1): ?>
                            <?= e($f['label']) ?>
                        <?php else: ?>
                            <span class="muted" style="text-decoration:line-through"><?= e($f['label']) ?></span>
                        <?php endif; ?>
                    </td>
                    <td><span class="pill <?= (int)$f['enabled']===1?'pill--green':'' ?>"><?= (int)$f['enabled']===1?'Enabled':'Disabled' ?></span></td>
                    <td style="text-align:right">
                        <form class="inline-form" method="post" action="<?= url('/admin/plan-features/' . e($f['id']) . '/toggle') ?>">
                            <?= csrf_field() ?><button class="btn btn--ghost btn--sm"><?= (int)$f['enabled']===1?'Disable':'Enable' ?></button>
                        </form>
                        <form class="inline-form" method="post" action="<?= url('/admin/plan-features/' . e($f['id']) . '/delete') ?>" onsubmit="return confirm('Remove this feature?')">
                            <?= csrf_field() ?><button class="btn btn--danger btn--sm">Remove</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (empty($features[(int)$p['id']])): ?>
                <tr><td colspan="3" class="muted">No features yet — add one below.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
        <form method="post" action="<?= url('/admin/plans/' . e($p['id']) . '/features') ?>" style="display:flex;gap:.5rem">
            <?= csrf_field() ?>
            <input type="text" name="label" placeholder="Add a feature…" style="flex:1;border:1px solid var(--line);border-radius:9px;padding:.55rem .8rem;font:inherit">
            <button class="btn btn--primary btn--sm" type="submit">+ Add feature</button>
        </form>
        <?php endif; ?>
    </div>
<?php endforeach; ?>
