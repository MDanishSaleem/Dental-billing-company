<?php /** @var array $states */ ?>
<section class="page-head">
    <div class="container">
        <h1>Browse by state</h1>
        <p class="muted">Find dental billing companies in all 50 states.</p>
    </div>
</section>
<section class="section">
    <div class="container">
        <div class="grid grid--states">
            <?php foreach ($states as $s): ?>
                <a href="<?= url('/companies/' . e($s['slug'])) ?>" class="state-pill">
                    <span><?= e($s['name']) ?></span>
                    <span class="state-pill__count"><?= e($s['company_count']) ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
