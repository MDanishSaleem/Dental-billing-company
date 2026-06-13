<?php /** @var array $companies */ ?>
<div class="toolbar">
    <h1 style="margin:0">Companies</h1>
    <div style="display:flex;gap:.5rem">
        <a href="<?= url('/admin/companies/import') ?>" class="btn btn--ghost btn--sm">⬆ Import CSV</a>
        <a href="<?= url('/admin/companies/new') ?>" class="btn btn--primary btn--sm">+ New company</a>
    </div>
</div>
<table class="table">
    <thead><tr><th>Name</th><th>Location</th><th>Tier</th><th>Status</th><th>Rating</th><th>Actions</th></tr></thead>
    <tbody>
    <?php foreach ($companies as $c): ?>
        <tr>
            <td><a href="<?= url('/admin/companies/' . e($c['id'])) ?>"><strong><?= e($c['name']) ?></strong></a></td>
            <td><?= e($c['city_name']) ?>, <?= e($c['abbreviation']) ?></td>
            <td><span class="pill <?= $c['tier']==='FEATURED'?'pill--amber':'' ?>"><?= e($c['tier']) ?></span></td>
            <td><span class="pill <?= $c['status']==='ACTIVE'?'pill--green':($c['status']==='PENDING'?'pill--amber':'pill--red') ?>"><?= e($c['status']) ?></span></td>
            <td><?= e(number_format((float)$c['rating'],1)) ?></td>
            <td>
                <a href="<?= url('/admin/companies/' . e($c['id'])) ?>" class="btn btn--ghost btn--sm">Edit</a>
                <?php if ($c['status'] !== 'ACTIVE'): ?>
                    <form class="inline-form" method="post" action="<?= url('/admin/companies/' . e($c['id']) . '/approve') ?>">
                        <?= csrf_field() ?><button class="btn btn--sm" style="background:var(--emerald);color:#fff">Approve</button>
                    </form>
                <?php endif; ?>
                <form class="inline-form" method="post" action="<?= url('/admin/companies/' . e($c['id']) . '/feature') ?>">
                    <?= csrf_field() ?><button class="btn btn--ghost btn--sm"><?= $c['tier']==='FEATURED'?'Unfeature':'Feature' ?></button>
                </form>
                <form class="inline-form" method="post" action="<?= url('/admin/companies/' . e($c['id']) . '/delete') ?>" onsubmit="return confirm('Delete this company?')">
                    <?= csrf_field() ?><button class="btn btn--danger btn--sm">Delete</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
