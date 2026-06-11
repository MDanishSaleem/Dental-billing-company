<?php /** @var array $states */ ?>
<h1>States &amp; cities</h1>
<p class="muted">Toggle which states appear in the directory.</p>
<table class="table">
    <thead><tr><th>State</th><th>Abbr</th><th>Cities</th><th>Active companies</th><th>Status</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($states as $s): ?>
        <tr>
            <td><strong><?= e($s['name']) ?></strong></td>
            <td><?= e($s['abbreviation']) ?></td>
            <td><?= e($s['city_count']) ?></td>
            <td><?= e($s['company_count']) ?></td>
            <td><span class="pill <?= (int)$s['active']===1?'pill--green':'pill--red' ?>"><?= (int)$s['active']===1?'Active':'Hidden' ?></span></td>
            <td>
                <form class="inline-form" method="post" action="<?= url('/admin/states/' . e($s['id']) . '/toggle') ?>">
                    <?= csrf_field() ?><button class="btn btn--ghost btn--sm"><?= (int)$s['active']===1?'Hide':'Show' ?></button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
