<?php /** @var array $pages */ ?>
<div class="toolbar">
    <h1 style="margin:0">Pages</h1>
    <a href="<?= url('/admin/pages/new') ?>" class="btn btn--primary btn--sm">+ New page</a>
</div>
<table class="table">
    <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($pages as $p): ?>
        <tr>
            <td><a href="<?= url('/admin/pages/' . e($p['id'])) ?>"><strong><?= e($p['title']) ?></strong></a></td>
            <td class="muted">/<?= e($p['slug']) ?></td>
            <td><span class="pill <?= $p['status']==='PUBLISHED'?'pill--green':'' ?>"><?= e($p['status']) ?></span></td>
            <td>
                <a href="<?= url('/' . e($p['slug'])) ?>" class="btn btn--ghost btn--sm" target="_blank">View</a>
                <a href="<?= url('/admin/pages/' . e($p['id'])) ?>" class="btn btn--ghost btn--sm">Edit</a>
                <form class="inline-form" method="post" action="<?= url('/admin/pages/' . e($p['id']) . '/delete') ?>" onsubmit="return confirm('Delete page?')">
                    <?= csrf_field() ?><button class="btn btn--danger btn--sm">Delete</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
