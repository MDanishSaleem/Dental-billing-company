<?php /** @var array $company @var array $images */ ?>
<h1>Photo gallery</h1>
<?= partial('partials/flash', []) ?>
<p class="muted">Upload photos to showcase your company on your public profile.</p>

<div class="card">
    <form method="post" action="<?= url('/dashboard/gallery') ?>" enctype="multipart/form-data" style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
        <?= csrf_field() ?>
        <input type="file" name="photo" accept="image/*" required>
        <button class="btn btn--primary btn--sm" type="submit">Upload photo</button>
    </form>
</div>

<div class="grid grid--cards">
    <?php foreach ($images as $img): ?>
        <div class="card" style="padding:.5rem">
            <img src="<?= url($img['image']) ?>" alt="" style="width:100%;height:160px;object-fit:cover;border-radius:8px">
            <form method="post" action="<?= url('/dashboard/gallery/' . e($img['id']) . '/delete') ?>" style="margin-top:.5rem" onsubmit="return confirm('Remove this photo?')">
                <?= csrf_field() ?>
                <button class="btn btn--danger btn--sm" type="submit" style="width:100%">Remove</button>
            </form>
        </div>
    <?php endforeach; ?>
</div>
<?php if (empty($images)): ?><p class="muted">No photos yet.</p><?php endif; ?>
