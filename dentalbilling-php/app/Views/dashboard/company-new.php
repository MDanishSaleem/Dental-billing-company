<?php /** @var array $categories @var array $states @var array $cities */ ?>
<div class="toolbar">
    <h1 style="margin:0">List your company</h1>
    <a href="<?= url('/dashboard') ?>" class="btn btn--ghost btn--sm">← Back</a>
</div>
<?= partial('partials/flash', []) ?>
<p class="muted">Fill in your details below. Your listing will be reviewed and published by an admin.</p>

<form method="post" action="<?= url('/dashboard/company/new') ?>">
    <?= csrf_field() ?>
    <div class="card">
        <h2>Basics</h2>
        <div class="form" style="max-width:none">
            <label>Company name *</label>
            <input type="text" name="name" value="<?= e(old('name')) ?>" required>
            <label>Short tagline</label>
            <input type="text" name="short_description" placeholder="One line about your company">
            <label>Description</label>
            <textarea name="description" rows="5" placeholder="What services do you offer, and what makes you different?"></textarea>
        </div>
    </div>

    <div class="card">
        <h2>Contact &amp; location</h2>
        <div class="form" style="max-width:none">
            <label>Website</label><input type="text" name="website" placeholder="https://…">
            <label>Phone</label><input type="text" name="phone">
            <label>Public email</label><input type="email" name="email">
            <label>Address</label><input type="text" name="address">
            <div class="form-row">
                <div><label>Founded year</label><input type="number" name="founded_year"></div>
                <div><label>Team size</label><input type="text" name="team_size" placeholder="e.g. 10-25"></div>
            </div>
            <label>State *</label>
            <select name="state_id" required>
                <option value="">Select a state…</option>
                <?php foreach ($states as $s): ?>
                    <option value="<?= e($s['id']) ?>"><?= e($s['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <label>City *</label>
            <select name="city_id" required>
                <option value="">Select a city…</option>
                <?php foreach ($cities as $ci): ?>
                    <option value="<?= e($ci['id']) ?>"><?= e($ci['name']) ?>, <?= e($ci['state_name']) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>

    <div class="card">
        <h2>Services offered</h2>
        <div class="chips">
            <?php foreach ($categories as $cat): ?>
                <label class="chip" style="cursor:pointer">
                    <input type="checkbox" name="services[]" value="<?= e($cat['id']) ?>">
                    <?= e($cat['icon']) ?> <?= e($cat['name']) ?>
                </label>
            <?php endforeach; ?>
        </div>
    </div>

    <button class="btn btn--primary" type="submit">Submit listing for review</button>
</form>
<?php $_SESSION['_old'] = []; ?>
