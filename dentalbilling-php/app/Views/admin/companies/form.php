<?php /** @var ?array $company @var array $categories @var array $serviceIds @var array $states @var array $cities */
$isEdit = $company !== null;
$action = $isEdit ? url('/admin/companies/' . $company['id']) : url('/admin/companies'); ?>
<div class="toolbar">
    <h1 style="margin:0"><?= $isEdit ? 'Edit company' : 'New company' ?></h1>
    <a href="<?= url('/admin/companies') ?>" class="btn btn--ghost btn--sm">← Back</a>
</div>
<form method="post" action="<?= $action ?>">
    <?= csrf_field() ?>
    <div class="card">
        <div class="form" style="max-width:none">
            <label>Name</label>
            <input type="text" name="name" value="<?= e($company['name'] ?? '') ?>" required>
            <label>Short tagline</label>
            <input type="text" name="short_description" value="<?= e($company['short_description'] ?? '') ?>">
            <label>Description</label>
            <textarea name="description" rows="5"><?= e($company['description'] ?? '') ?></textarea>
            <div class="form-row">
                <div><label>Status</label>
                    <select name="status">
                        <?php foreach (['PENDING','ACTIVE','SUSPENDED','REJECTED'] as $st): ?>
                            <option value="<?= $st ?>" <?= ($company['status'] ?? 'PENDING')===$st?'selected':'' ?>><?= $st ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div><label>Tier</label>
                    <select name="tier">
                        <?php foreach (['FREE','BASIC','PREMIUM','FEATURED'] as $t): ?>
                            <option value="<?= $t ?>" <?= ($company['tier'] ?? 'FREE')===$t?'selected':'' ?>><?= $t ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <div class="card">
        <h2>Contact & location</h2>
        <div class="form" style="max-width:none">
            <label>Website</label><input type="text" name="website" value="<?= e($company['website'] ?? '') ?>">
            <?php if ($nofollowSupported ?? false): ?>
            <label>Website link SEO</label>
            <select name="website_nofollow">
                <option value="1" <?= (int)($company['website_nofollow'] ?? 1)===1?'selected':'' ?>>nofollow — don’t pass SEO value (default)</option>
                <option value="0" <?= (int)($company['website_nofollow'] ?? 1)===0?'selected':'' ?>>dofollow — pass SEO value</option>
            </select>
            <?php endif; ?>
            <label>Phone</label><input type="text" name="phone" value="<?= e($company['phone'] ?? '') ?>">
            <label>Email</label><input type="email" name="email" value="<?= e($company['email'] ?? '') ?>">
            <label>Address</label><input type="text" name="address" value="<?= e($company['address'] ?? '') ?>">
            <label>Founded year</label><input type="number" name="founded_year" value="<?= e($company['founded_year'] ?? '') ?>">
            <label>Team size</label><input type="text" name="team_size" value="<?= e($company['team_size'] ?? '') ?>">
            <label>State</label>
            <select name="state_id">
                <?php foreach ($states as $s): ?>
                    <option value="<?= e($s['id']) ?>" <?= (int)($company['state_id'] ?? 0)===(int)$s['id']?'selected':'' ?>><?= e($s['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <label>City</label>
            <select name="city_id">
                <?php foreach ($cities as $ci): ?>
                    <option value="<?= e($ci['id']) ?>" <?= (int)($company['city_id'] ?? 0)===(int)$ci['id']?'selected':'' ?>><?= e($ci['name']) ?>, <?= e($ci['state_name']) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>
    <div class="card">
        <h2>Services</h2>
        <div class="chips">
            <?php foreach ($categories as $cat): ?>
                <label class="chip" style="cursor:pointer">
                    <input type="checkbox" name="services[]" value="<?= e($cat['id']) ?>" <?= in_array((int)$cat['id'],$serviceIds,true)?'checked':'' ?>>
                    <?= e($cat['name']) ?>
                </label>
            <?php endforeach; ?>
        </div>
    </div>
    <button class="btn btn--primary" type="submit"><?= $isEdit ? 'Save changes' : 'Create company' ?></button>
</form>
