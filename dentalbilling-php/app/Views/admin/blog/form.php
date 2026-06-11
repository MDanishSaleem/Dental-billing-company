<?php /** @var ?array $post @var array $categories */
$isEdit = $post !== null;
$action = $isEdit ? url('/admin/blog/' . $post['id']) : url('/admin/blog'); ?>
<div class="toolbar">
    <h1 style="margin:0"><?= $isEdit ? 'Edit post' : 'New post' ?></h1>
    <a href="<?= url('/admin/blog') ?>" class="btn btn--ghost btn--sm">← Back</a>
</div>
<form method="post" action="<?= $action ?>">
    <?= csrf_field() ?>
    <div class="card">
        <div class="form" style="max-width:none">
            <label>Title</label>
            <input type="text" name="title" value="<?= e($post['title'] ?? '') ?>" required>
            <div class="form-row">
                <div><label>Category</label>
                    <select name="category_id">
                        <option value="">— none —</option>
                        <?php foreach ($categories as $cat): ?>
                            <option value="<?= e($cat['id']) ?>" <?= (int)($post['category_id'] ?? 0)===(int)$cat['id']?'selected':'' ?>><?= e($cat['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div><label>Status</label>
                    <select name="status">
                        <?php foreach (['DRAFT','PUBLISHED','ARCHIVED'] as $st): ?>
                            <option value="<?= $st ?>" <?= ($post['status'] ?? 'DRAFT')===$st?'selected':'' ?>><?= $st ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <label>Featured image URL</label>
            <input type="text" name="image" value="<?= e($post['image'] ?? '') ?>">
            <label>Excerpt</label>
            <textarea name="excerpt" rows="2"><?= e($post['excerpt'] ?? '') ?></textarea>
            <label>Body (HTML allowed)</label>
            <textarea name="body" rows="12"><?= e($post['body'] ?? '') ?></textarea>
        </div>
    </div>
    <button class="btn btn--primary" type="submit"><?= $isEdit ? 'Save post' : 'Create post' ?></button>
</form>
