<div class="auth-wrap">
    <div class="auth-card">
        <h1>Create your account</h1>
        <p class="auth-alt">List your dental billing company and start receiving leads.</p>
        <?= partial('partials/flash', []) ?>
        <form method="post" action="<?= url('/auth/register') ?>" class="form" style="max-width:none">
            <?= csrf_field() ?>
            <label>Full name</label>
            <input type="text" name="name" value="<?= e(old('name')) ?>" required autofocus>
            <label>Email</label>
            <input type="email" name="email" value="<?= e(old('email')) ?>" required>
            <label>Password</label>
            <input type="password" name="password" required minlength="8" placeholder="At least 8 characters">
            <button class="btn btn--primary" type="submit" style="width:100%;margin-top:1.25rem">Create account</button>
        </form>
        <p class="auth-alt">Already have an account? <a href="<?= url('/auth/login') ?>">Log in</a></p>
    </div>
</div>
<?php $_SESSION['_old'] = []; ?>
