<div class="auth-wrap">
    <div class="auth-card">
        <h1>Welcome back</h1>
        <?= partial('partials/flash', []) ?>
        <form method="post" action="<?= url('/auth/login') ?>" class="form" style="max-width:none">
            <?= csrf_field() ?>
            <label>Email</label>
            <input type="email" name="email" value="<?= e(old('email')) ?>" required autofocus>
            <label>Password</label>
            <input type="password" name="password" required>
            <button class="btn btn--primary" type="submit" style="width:100%;margin-top:1.25rem">Log in</button>
        </form>
        <p class="auth-alt"><a href="<?= url('/auth/forgot-password') ?>">Forgot password?</a></p>
        <p class="auth-alt">No account? <a href="<?= url('/auth/register') ?>">Create one</a></p>
    </div>
</div>
<?php $_SESSION['_old'] = []; ?>
