<?php /** @var array $pending */ ?>
<h1>Review moderation</h1>
<p class="muted"><?= count($pending) ?> review<?= count($pending)===1?'':'s' ?> awaiting approval.</p>
<?php foreach ($pending as $r): ?>
    <div class="card">
        <div class="toolbar" style="margin-bottom:.5rem">
            <div>
                <strong><?= e($r['author_name']) ?></strong> on
                <a href="<?= url('/companies/' . e($r['company_slug'])) ?>"><?= e($r['company_name']) ?></a>
                — <?= stars_html((float)$r['rating']) ?>
            </div>
            <div>
                <form class="inline-form" method="post" action="<?= url('/admin/reviews/' . e($r['id']) . '/approve') ?>">
                    <?= csrf_field() ?><button class="btn btn--sm" style="background:var(--emerald);color:#fff">Approve</button>
                </form>
                <form class="inline-form" method="post" action="<?= url('/admin/reviews/' . e($r['id']) . '/reject') ?>">
                    <?= csrf_field() ?><button class="btn btn--danger btn--sm">Reject</button>
                </form>
            </div>
        </div>
        <?php if ($r['title']): ?><strong><?= e($r['title']) ?></strong><br><?php endif; ?>
        <span class="muted"><?= nl2br(e($r['body'])) ?></span>
    </div>
<?php endforeach; ?>
<?php if (empty($pending)): ?><div class="card"><p class="muted">No reviews to moderate. 🎉</p></div><?php endif; ?>
