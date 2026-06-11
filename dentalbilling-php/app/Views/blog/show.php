<?php /** @var array $post */ ?>
<article class="section">
    <div class="container container--narrow">
        <nav class="crumbs"><a href="<?= url('/blog') ?>">Blog</a> / <span><?= e($post['title']) ?></span></nav>
        <div class="post-card__cat"><?= e($post['category_name'] ?: 'Article') ?></div>
        <h1 class="post-title"><?= e($post['title']) ?></h1>
        <p class="muted post-meta">
            <?php if (!empty($post['author_name'])): ?>By <?= e($post['author_name']) ?> · <?php endif; ?>
            <?= $post['published_at'] ? date('F j, Y', strtotime($post['published_at'])) : '' ?>
        </p>
        <div class="prose"><?= $post['body'] /* trusted admin HTML */ ?></div>
        <div style="margin-top:2rem"><a href="<?= url('/blog') ?>" class="btn btn--ghost">← Back to blog</a></div>
    </div>
</article>
