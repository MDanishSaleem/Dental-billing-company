<?php /** @var array $posts */ ?>
<section class="page-head">
    <div class="container">
        <h1>Dental billing insights</h1>
        <p class="muted">Tips and guides to help your practice get paid faster.</p>
    </div>
</section>
<section class="section">
    <div class="container">
        <div class="grid grid--cards">
            <?php foreach ($posts as $p): ?>
                <a href="<?= url('/blog/' . e($p['slug'])) ?>" class="post-card">
                    <div class="post-card__cat"><?= e($p['category_name'] ?: 'Article') ?></div>
                    <h3><?= e($p['title']) ?></h3>
                    <p class="muted"><?= e(excerpt($p['excerpt'] ?: $p['body'], 120)) ?></p>
                    <span class="post-card__date"><?= $p['published_at'] ? date('M j, Y', strtotime($p['published_at'])) : '' ?></span>
                </a>
            <?php endforeach; ?>
        </div>
        <?php if (empty($posts)): ?><p class="muted">No posts published yet.</p><?php endif; ?>
    </div>
</section>
