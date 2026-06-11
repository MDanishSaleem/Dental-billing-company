<div class="auth-wrap">
    <div class="auth-card">
        <h1>Reset password</h1>
        <p class="auth-alt">Enter your email and we’ll send reset instructions.</p>
        <?= partial('partials/flash', []) ?>
        <form method="post" action="<?= url('/auth/forgot-password') ?>" class="form" style="max-width:none">
            <?= csrf_field() ?>
            <label>Email</label>
            <input type="email" name="email" required autofocus>
            <button class="btn btn--primary" type="submit" style="width:100%;margin-top:1.25rem">Send instructions</button>
        </form>
        <p class="auth-alt"><a href="<?= url('/auth/login') ?>">Back to log in</a></p>
    </div>
</div>
