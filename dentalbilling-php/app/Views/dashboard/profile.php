<?php /** @var ?array $company @var array $categories @var array $serviceIds @var array $states @var array $cities */ ?>
<h1>Company profile</h1>
<?= partial('partials/flash', []) ?>

<?php if (!$company): ?>
    <div class="card"><p class="muted">No company is linked to your account yet.</p></div>
<?php else: ?>
<form method="post" action="<?= url('/dashboard/profile') ?>" enctype="multipart/form-data">
    <?= csrf_field() ?>

    <?php if (cap($company, 'logo_upload')): ?>
    <div class="card">
        <h2>Company logo</h2>
        <div style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap">
            <div class="company-card__logo" style="width:64px;height:64px;font-size:1.5rem;overflow:hidden">
                <?php if (!empty($company['logo'])): ?>
                    <img src="<?= e(media_url($company['logo'])) ?>" alt="logo" style="width:100%;height:100%;object-fit:cover">
                <?php else: ?><?= e(strtoupper(substr($company['name'], 0, 1))) ?><?php endif; ?>
            </div>
            <div class="form" style="max-width:none;flex:1;min-width:220px">
                <label>Upload a new logo (JPG/PNG/WebP, max 3 MB)</label>
                <input type="file" name="logo" accept="image/*">
            </div>
        </div>
    </div>
    <?php endif; ?>

    <div class="card">
        <h2>Basics</h2>
        <div class="form" style="max-width:none">
            <label>Company name</label>
            <input type="text" name="name" value="<?= e($company['name']) ?>" required>
            <label>Short tagline</label>
            <input type="text" name="short_description" value="<?= e($company['short_description']) ?>">
            <label>Description</label>
            <textarea name="description" rows="5"><?= e($company['description']) ?></textarea>
        </div>
    </div>

    <div class="card">
        <h2>Contact & details</h2>
        <div class="form" style="max-width:none">
            <label>Website</label>
            <input type="text" name="website" value="<?= e($company['website']) ?>">
            <label>Phone</label>
            <input type="text" name="phone" value="<?= e($company['phone']) ?>">
            <label>Public email</label>
            <input type="email" name="email" value="<?= e($company['email']) ?>">
            <label>Address</label>
            <input type="text" name="address" value="<?= e($company['address']) ?>">
            <label>Founded year</label>
            <input type="number" name="founded_year" value="<?= e($company['founded_year']) ?>">
            <label>Team size</label>
            <input type="text" name="team_size" value="<?= e($company['team_size']) ?>" placeholder="e.g. 10-25">
            <label>State</label>
            <select name="state_id">
                <?php foreach ($states as $s): ?>
                    <option value="<?= e($s['id']) ?>" <?= (int)$company['state_id']===(int)$s['id']?'selected':'' ?>><?= e($s['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <label>City</label>
            <select name="city_id">
                <?php foreach ($cities as $ci): ?>
                    <option value="<?= e($ci['id']) ?>" <?= (int)$company['city_id']===(int)$ci['id']?'selected':'' ?>><?= e($ci['name']) ?>, <?= e($ci['state_name']) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>

    <div class="card">
        <h2>Services</h2>
        <div class="chips">
            <?php foreach ($categories as $cat): ?>
                <label class="chip" style="cursor:pointer">
                    <input type="checkbox" name="services[]" value="<?= e($cat['id']) ?>"
                        <?= in_array((int)$cat['id'], $serviceIds, true) ? 'checked' : '' ?>>
                    <?= e($cat['icon']) ?> <?= e($cat['name']) ?>
                </label>
            <?php endforeach; ?>
        </div>
    </div>

    <button class="btn btn--primary" type="submit">Save changes</button>
</form>
<?php endif; ?>
