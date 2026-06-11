<?php /** @var ?array $company */ ?>
<h1>Subscription</h1>
<?= partial('partials/flash', []) ?>
<?php if (!$company): ?>
    <div class="card"><p class="muted">No company linked to your account.</p></div>
<?php else: ?>
<div class="card">
    <h2>Current plan: <?= e(ucfirst(strtolower($company['tier']))) ?></h2>
    <p class="muted">
        <?php if ($company['tier'] === 'FREE'): ?>
            You’re on the free plan. Upgrade to unlock more categories, a photo gallery, lead capture, and priority placement.
        <?php else: ?>
            Thanks for being a <?= e(ucfirst(strtolower($company['tier']))) ?> member.
        <?php endif; ?>
    </p>
    <a href="<?= url('/pricing') ?>" class="btn btn--primary">View plans</a>
</div>

<div class="card">
    <h3>Pay by bank transfer / Payoneer (manual)</h3>
    <p class="muted">Submit a manual payment and an admin will activate your upgrade after confirmation.</p>
    <form method="post" action="<?= url('/payments/manual') ?>" class="form" style="max-width:none">
        <?= csrf_field() ?>
        <input type="hidden" name="company_id" value="<?= e($company['id']) ?>">
        <label>Plan</label>
        <select name="plan_tier">
            <option value="BASIC">Basic — $29/mo</option>
            <option value="PREMIUM">Premium — $79/mo</option>
            <option value="FEATURED">Featured — $149/mo</option>
        </select>
        <label>Payment reference / note</label>
        <input type="text" name="reference" placeholder="Transaction ID or note">
        <button class="btn btn--ghost" type="submit" style="margin-top:1rem">Submit manual payment</button>
    </form>
</div>
<?php endif; ?>
