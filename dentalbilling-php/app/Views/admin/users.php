<?php /** @var array $users */ ?>
<h1>Users</h1>
<table class="table">
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($users as $u): ?>
        <tr>
            <td><strong><?= e($u['name']) ?></strong></td>
            <td><?= e($u['email']) ?></td>
            <td>
                <form class="inline-form" method="post" action="<?= url('/admin/users/' . e($u['id']) . '/role') ?>">
                    <?= csrf_field() ?>
                    <select name="role" onchange="this.form.submit()">
                        <?php foreach (['USER','COMPANY_OWNER','ADMIN'] as $role): ?>
                            <option value="<?= $role ?>" <?= $u['role']===$role?'selected':'' ?>><?= $role ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </td>
            <td><?= date('M j, Y', strtotime($u['created_at'])) ?></td>
            <td><span class="pill <?= (int)$u['banned']===1?'pill--red':'pill--green' ?>"><?= (int)$u['banned']===1?'Banned':'Active' ?></span></td>
            <td>
                <form class="inline-form" method="post" action="<?= url('/admin/users/' . e($u['id']) . '/ban') ?>">
                    <?= csrf_field() ?><button class="btn btn--ghost btn--sm"><?= (int)$u['banned']===1?'Unban':'Ban' ?></button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
