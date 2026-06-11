<?php /** @var array $plans */ ?>
<section class="page-head center">
    <div class="container">
        <h1>List your dental billing company</h1>
        <p class="muted">Reach dental practices actively searching for billing partners. Cancel anytime.</p>
    </div>
</section>
<section class="section">
    <div class="container">
        <div class="grid grid--cards pricing-grid">
            <?php foreach ($plans as $plan): ?>
                <div class="plan <?= $plan['tier'] === 'PREMIUM' ? 'plan--popular' : '' ?>">
                    <?php if ($plan['tier'] === 'PREMIUM'): ?><span class="plan__tag">Most popular</span><?php endif; ?>
                    <h3><?= e($plan['name']) ?></h3>
                    <div class="plan__price">
                        $<?= e(number_format((float) $plan['price'])) ?><span>/mo</span>
                    </div>
                    <ul class="plan__features">
                        <?php foreach (array_filter(explode('|', (string) $plan['features'])) as $feat): ?>
                            <li>✓ <?= e(trim($feat)) ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <a href="<?= url('/auth/register?plan=' . e($plan['slug'])) ?>"
                       class="btn <?= $plan['tier'] === 'PREMIUM' ? 'btn--primary' : 'btn--ghost' ?>" style="width:100%">
                        <?= (float) $plan['price'] > 0 ? 'Choose ' . e($plan['name']) : 'Start free' ?>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
