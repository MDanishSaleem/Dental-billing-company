<?php /** @var array $categories */ ?>
<h1>Service categories</h1>
<div class="company-layout" style="grid-template-columns:1fr 320px">
    <table class="table">
        <thead><tr><th>Icon</th><th>Name</th><th>Slug</th><th>Companies</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($categories as $c): ?>
            <tr>
                <td style="font-size:1.3rem"><?= e($c['icon']) ?></td>
                <td><strong><?= e($c['name']) ?></strong></td>
                <td class="muted"><?= e($c['slug']) ?></td>
                <td><?= e($c['company_count']) ?></td>
                <td>
                    <form class="inline-form" method="post" action="<?= url('/admin/categories/' . e($c['id']) . '/delete') ?>" onsubmit="return confirm('Delete category?')">
                        <?= csrf_field() ?><button class="btn btn--danger btn--sm">Delete</button>
                    </form>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
    <div class="card">
        <h2>Add category</h2>
        <form method="post" action="<?= url('/admin/categories') ?>" class="form" style="max-width:none">
            <?= csrf_field() ?>
            <label>Name</label><input type="text" name="name" required>
            <label>Icon (emoji)</label><input type="text" name="icon" placeholder="🦷">
            <label>Description</label><input type="text" name="description">
            <label>Sort order</label><input type="number" name="sort_order" value="0">
            <button class="btn btn--primary" type="submit" style="margin-top:1rem">Add</button>
        </form>
    </div>
</div>
