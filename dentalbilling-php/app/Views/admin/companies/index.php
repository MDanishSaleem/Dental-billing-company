<?php /** @var array $companies */ ?>
<div class="toolbar">
    <h1 style="margin:0">Companies</h1>
    <div style="display:flex;gap:.5rem">
        <a href="<?= url('/admin/companies/import') ?>" class="btn btn--ghost btn--sm">⬆ Import CSV</a>
        <a href="<?= url('/admin/companies/new') ?>" class="btn btn--primary btn--sm">+ New company</a>
    </div>
</div>

<!-- Bulk action bar (checkboxes in the table reference this form via the HTML form= attribute) -->
<form id="bulkForm" method="post" action="<?= url('/admin/companies/bulk') ?>"
      onsubmit="return bulkOk(this)" class="card" style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;padding:.75rem 1rem">
    <?= csrf_field() ?>
    <strong style="font-size:.9rem"><span id="selCount">0</span> selected</strong>
    <select name="bulk_action" style="border:1px solid var(--line);border-radius:8px;padding:.4rem .6rem;font:inherit">
        <option value="">Bulk action…</option>
        <optgroup label="Status">
            <option value="status:ACTIVE">Approve / set Active</option>
            <option value="status:PENDING">Set Pending</option>
            <option value="status:SUSPENDED">Suspend</option>
            <option value="status:REJECTED">Reject</option>
        </optgroup>
        <optgroup label="Change plan">
            <option value="tier:FREE">Move to Free</option>
            <option value="tier:BASIC">Move to Basic</option>
            <option value="tier:PREMIUM">Move to Premium</option>
            <option value="tier:FEATURED">Move to Featured</option>
        </optgroup>
        <optgroup label="Danger">
            <option value="delete">Delete selected</option>
        </optgroup>
    </select>
    <button class="btn btn--ghost btn--sm" type="submit">Apply to selected</button>
</form>

<table class="table">
    <thead>
        <tr>
            <th style="width:32px"><input type="checkbox" id="cb-all" title="Select all"></th>
            <th>Name</th><th>Location</th><th>Tier</th><th>Status</th><th>Rating</th><th>Actions</th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($companies as $c): ?>
        <tr>
            <td><input type="checkbox" class="rowcb" name="ids[]" value="<?= e($c['id']) ?>" form="bulkForm"></td>
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
                <form class="inline-form" method="post" action="<?= url('/admin/companies/' . e($c['id']) . '/delete') ?>" onsubmit="return confirm('Delete this company?')">
                    <?= csrf_field() ?><button class="btn btn--danger btn--sm">Delete</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (empty($companies)): ?><tr><td colspan="7" class="muted">No companies yet.</td></tr><?php endif; ?>
    </tbody>
</table>

<script>
(function () {
    var all = document.getElementById('cb-all');
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.rowcb'));
    var count = document.getElementById('selCount');
    function refresh() {
        var n = boxes.filter(function (b) { return b.checked; }).length;
        if (count) count.textContent = n;
        if (all) all.checked = n > 0 && n === boxes.length;
    }
    if (all) all.addEventListener('change', function () {
        boxes.forEach(function (b) { b.checked = all.checked; });
        refresh();
    });
    boxes.forEach(function (b) { b.addEventListener('change', refresh); });
    refresh();
    window.bulkOk = function (form) {
        var checked = boxes.filter(function (b) { return b.checked; }).length;
        if (checked === 0) { alert('Select at least one company first.'); return false; }
        if (!form.bulk_action.value) { alert('Choose a bulk action.'); return false; }
        if (form.bulk_action.value === 'delete') {
            return confirm('Delete ' + checked + ' selected compan' + (checked === 1 ? 'y' : 'ies') + '? This cannot be undone.');
        }
        return true;
    };
})();
</script>
