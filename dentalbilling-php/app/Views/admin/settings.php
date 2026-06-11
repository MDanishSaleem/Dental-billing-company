<?php /** @var array $settings */ ?>
<h1>Settings</h1>
<form method="post" action="<?= url('/admin/settings') ?>">
    <?= csrf_field() ?>
    <div class="card">
        <div class="form" style="max-width:none">
            <label>Site name</label>
            <input type="text" name="site_name" value="<?= e($settings['site_name'] ?? '') ?>">
            <label>Tagline</label>
            <input type="text" name="site_tagline" value="<?= e($settings['site_tagline'] ?? '') ?>">
            <label>Contact email</label>
            <input type="email" name="contact_email" value="<?= e($settings['contact_email'] ?? '') ?>">
            <label>Currency</label>
            <input type="text" name="currency" value="<?= e($settings['currency'] ?? 'USD') ?>">
            <label style="display:flex;align-items:center;gap:.5rem;margin-top:.75rem">
                <input type="checkbox" name="reviews_require_approval" value="1" <?= !empty($settings['reviews_require_approval'])?'checked':'' ?>>
                Reviews require admin approval before showing
            </label>
        </div>
    </div>
    <button class="btn btn--primary" type="submit">Save settings</button>
</form>
