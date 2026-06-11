<?php /** @var ?array $page */
$isEdit = $page !== null;
$action = $isEdit ? url('/admin/pages/' . $page['id']) : url('/admin/pages'); ?>
<div class="toolbar">
    <h1 style="margin:0"><?= $isEdit ? 'Edit page' : 'New page' ?></h1>
    <a href="<?= url('/admin/pages') ?>" class="btn btn--ghost btn--sm">← Back</a>
</div>
<form method="post" action="<?= $action ?>">
    <?= csrf_field() ?>
    <div class="card">
        <div class="form" style="max-width:none">
            <label>Title</label>
            <input type="text" name="title" value="<?= e($page['title'] ?? '') ?>" required>
            <label>Slug (URL)</label>
            <input type="text" name="slug" value="<?= e($page['slug'] ?? '') ?>" placeholder="about">
            <label>Status</label>
            <select name="status">
                <?php foreach (['PUBLISHED','DRAFT'] as $st): ?>
                    <option value="<?= $st ?>" <?= ($page['status'] ?? 'PUBLISHED')===$st?'selected':'' ?>><?= $st ?></option>
                <?php endforeach; ?>
            </select>
            <label>Body (HTML allowed)</label>
            <textarea name="body" rows="14"><?= e($page['body'] ?? '') ?></textarea>
        </div>
    </div>
    <button class="btn btn--primary" type="submit"><?= $isEdit ? 'Save page' : 'Create page' ?></button>
</form>
