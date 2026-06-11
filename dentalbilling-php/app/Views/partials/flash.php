<?php if ($msg = flash('success')): ?>
    <div class="alert alert--success"><?= e($msg) ?></div>
<?php endif; ?>
<?php if ($msg = flash('error')): ?>
    <div class="alert alert--error"><?= e($msg) ?></div>
<?php endif; ?>
