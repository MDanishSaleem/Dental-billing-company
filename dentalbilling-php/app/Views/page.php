<?php /** @var array $page */ ?>
<section class="section">
    <div class="container container--narrow">
        <h1 class="post-title"><?= e($page['title']) ?></h1>
        <div class="prose"><?= $page['body'] /* trusted admin HTML */ ?></div>
    </div>
</section>
