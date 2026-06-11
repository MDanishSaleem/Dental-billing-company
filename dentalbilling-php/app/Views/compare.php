<?php /** @var array $companies */ ?>
<section class="page-head">
    <div class="container">
        <h1>Compare companies</h1>
        <p class="muted">Side-by-side comparison of up to 3 dental billing companies.</p>
    </div>
</section>
<section class="section">
    <div class="container">
        <?php if (empty($companies)): ?>
            <div class="empty">
                <p>No companies selected to compare.</p>
                <a href="<?= url('/search') ?>" class="btn btn--primary">Find companies</a>
            </div>
        <?php else: ?>
            <div class="compare-grid" style="--cols:<?= count($companies) ?>">
                <div class="compare-row compare-row--head">
                    <div class="compare-label"></div>
                    <?php foreach ($companies as $c): ?>
                        <div class="compare-cell">
                            <div class="company-card__logo"><?= e(strtoupper(substr($c['name'],0,1))) ?></div>
                            <a href="<?= url('/companies/' . e($c['slug'])) ?>"><strong><?= e($c['name']) ?></strong></a>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="compare-row">
                    <div class="compare-label">Location</div>
                    <?php foreach ($companies as $c): ?><div class="compare-cell"><?= e($c['city_name']) ?>, <?= e($c['abbreviation']) ?></div><?php endforeach; ?>
                </div>
                <div class="compare-row">
                    <div class="compare-label">Rating</div>
                    <?php foreach ($companies as $c): ?><div class="compare-cell"><?= stars_html((float)$c['rating']) ?> <?= e(number_format((float)$c['rating'],1)) ?></div><?php endforeach; ?>
                </div>
                <div class="compare-row">
                    <div class="compare-label">Reviews</div>
                    <?php foreach ($companies as $c): ?><div class="compare-cell"><?= e($c['review_count']) ?></div><?php endforeach; ?>
                </div>
                <div class="compare-row">
                    <div class="compare-label">Plan</div>
                    <?php foreach ($companies as $c): ?><div class="compare-cell"><?= e(ucfirst(strtolower($c['tier']))) ?></div><?php endforeach; ?>
                </div>
                <div class="compare-row">
                    <div class="compare-label">Services</div>
                    <?php foreach ($companies as $c): ?>
                        <div class="compare-cell">
                            <?php foreach ($c['service_list'] as $s): ?><span class="chip chip--sm"><?= e($s['name']) ?></span><?php endforeach; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="compare-row">
                    <div class="compare-label"></div>
                    <?php foreach ($companies as $c): ?>
                        <div class="compare-cell"><a href="<?= url('/companies/' . e($c['slug'])) ?>" class="btn btn--primary">View profile</a></div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</section>
