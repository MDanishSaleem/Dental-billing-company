<?php /** @var array $posts */ ?>
<div class="toolbar">
    <h1 style="margin:0">Blog posts</h1>
    <a href="<?= url('/admin/blog/new') ?>" class="btn btn--primary btn--sm">+ New post</a>
</div>
<table class="table">
    <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($posts as $p): ?>
        <tr>
            <td><a href="<?= url('/admin/blog/' . e($p['id'])) ?>"><strong><?= e($p['title']) ?></strong></a></td>
            <td><?= e($p['category_name']) ?></td>
            <td><span class="pill <?= $p['status']==='PUBLISHED'?'pill--green':'' ?>"><?= e($p['status']) ?></span></td>
            <td><?= $p['published_at'] ? date('M j, Y', strtotime($p['published_at'])) : '—' ?></td>
            <td>
                <a href="<?= url('/admin/blog/' . e($p['id'])) ?>" class="btn btn--ghost btn--sm">Edit</a>
                <form class="inline-form" method="post" action="<?= url('/admin/blog/' . e($p['id']) . '/delete') ?>" onsubmit="return confirm('Delete post?')">
                    <?= csrf_field() ?><button class="btn btn--danger btn--sm">Delete</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (empty($posts)): ?><tr><td colspan="5" class="muted">No posts yet.</td></tr><?php endif; ?>
    </tbody>
</table>
