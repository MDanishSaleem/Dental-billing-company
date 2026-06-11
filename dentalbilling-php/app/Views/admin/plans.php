<?php /** @var array $plans */ ?>
<h1>Plans</h1>
<p class="muted">Pricing tiers shown on the public pricing page. Use <code>|</code> to separate features.</p>
<?php foreach ($plans as $p): ?>
    <div class="card">
        <form method="post" action="<?= url('/admin/plans/' . e($p['id'])) ?>" class="form" style="max-width:none">
            <?= csrf_field() ?>
            <div class="form-row">
                <div><label>Name</label><input type="text" name="name" value="<?= e($p['name']) ?>"></div>
                <div><label>Price (USD/mo)</label><input type="number" step="0.01" name="price" value="<?= e($p['price']) ?>"></div>
            </div>
            <label>Features (pipe-separated)</label>
            <input type="text" name="features" value="<?= e($p['features']) ?>">
            <label style="display:flex;align-items:center;gap:.5rem;margin-top:.75rem">
                <input type="checkbox" name="active" value="1" <?= (int)$p['active']===1?'checked':'' ?>> Active
            </label>
            <button class="btn btn--primary btn--sm" type="submit" style="margin-top:.75rem">Save <?= e($p['name']) ?></button>
        </form>
    </div>
<?php endforeach; ?>
