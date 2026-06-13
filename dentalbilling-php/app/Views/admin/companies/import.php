<?php /** @var ?array $report @var array $categories @var array $optionalFields @var array $requiredConfig */ ?>
<div class="toolbar">
    <h1 style="margin:0">Import companies (CSV)</h1>
    <a href="<?= url('/admin/companies') ?>" class="btn btn--ghost btn--sm">← Back to companies</a>
</div>

<?php if ($report): ?>
    <div class="alert alert--success">
        Import complete — <strong><?= (int) $report['created'] ?></strong> created,
        <strong><?= (int) $report['skipped'] ?></strong> skipped.
    </div>
    <?php if (!empty($report['errors'])): ?>
        <div class="card">
            <h3>Skipped rows</h3>
            <ul class="muted" style="margin:0;padding-left:1.2rem">
                <?php foreach ($report['errors'] as $err): ?><li><?= e($err) ?></li><?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>
<?php endif; ?>

<div class="company-layout" style="grid-template-columns:1fr 320px">
    <div>
        <div class="card">
            <h2>Upload your CSV</h2>
            <form method="post" action="<?= url('/admin/companies/import') ?>" enctype="multipart/form-data">
                <?= csrf_field() ?>
                <input type="file" name="csv" accept=".csv,text/csv" required style="margin:.5rem 0">
                <button class="btn btn--primary" type="submit" style="display:block;margin-top:.75rem">Import companies</button>
            </form>
        </div>

        <div class="card">
            <h2>Required fields</h2>
            <p class="muted">Choose which columns must be filled in for a row to import. Rows missing a required field are skipped and reported. <code>name</code>, <code>state</code> and <code>city</code> are always required.</p>
            <form method="post" action="<?= url('/admin/companies/import/fields') ?>">
                <?= csrf_field() ?>
                <div class="chips">
                    <label class="chip" style="opacity:.6"><input type="checkbox" checked disabled> name</label>
                    <label class="chip" style="opacity:.6"><input type="checkbox" checked disabled> state</label>
                    <label class="chip" style="opacity:.6"><input type="checkbox" checked disabled> city</label>
                    <?php foreach ($optionalFields as $key => $label): ?>
                        <label class="chip" style="cursor:pointer">
                            <input type="checkbox" name="required[]" value="<?= e($key) ?>" <?= in_array($key, $requiredConfig, true) ? 'checked' : '' ?>>
                            <?= e($label) ?>
                        </label>
                    <?php endforeach; ?>
                </div>
                <button class="btn btn--ghost btn--sm" type="submit" style="margin-top:.75rem">Save required fields</button>
            </form>
        </div>

        <div class="card">
            <h2>CSV format</h2>
            <p class="muted">First row must be the header. Columns:</p>
            <table class="table">
                <thead><tr><th>Column</th><th>Notes</th></tr></thead>
                <tbody>
                    <tr><td><code>name</code></td><td>Required.</td></tr>
                    <tr><td><code>state</code></td><td>Required. Full name, 2-letter code (CA), or slug.</td></tr>
                    <tr><td><code>city</code></td><td>Required. Created automatically if new.</td></tr>
                    <tr><td><code>tier</code></td><td>FREE / BASIC / PREMIUM / FEATURED (default FREE).</td></tr>
                    <tr><td><code>status</code></td><td>ACTIVE / PENDING / SUSPENDED / REJECTED (default ACTIVE).</td></tr>
                    <tr><td><code>short_description</code></td><td>Optional tagline.</td></tr>
                    <tr><td><code>description</code></td><td>Optional.</td></tr>
                    <tr><td><code>website, phone, email, address</code></td><td>Optional.</td></tr>
                    <tr><td><code>website_nofollow</code></td><td><code>nofollow</code> (default) or <code>dofollow</code>.</td></tr>
                    <tr><td><code>founded_year, team_size</code></td><td>Optional.</td></tr>
                    <tr><td><code>logo</code></td><td>Image URL (e.g. <code>https://site.com/logo.png</code>).</td></tr>
                    <tr><td><code>services</code></td><td>Category slugs separated by <code>|</code> (e.g. <code>claims-submission|payment-posting</code>).</td></tr>
                    <tr><td><code>rating</code></td><td>Star rating 0–5 (e.g. <code>4.5</code>). Used when no <code>reviews</code> are given.</td></tr>
                    <tr><td><code>review_count</code></td><td>Number of reviews to display (e.g. <code>54</code>).</td></tr>
                    <tr><td><code>reviews</code></td><td>Full reviews. Format <code>author|rating|title|body</code>, multiple separated by <code>;;</code>. When present, the company’s rating &amp; count are computed from these.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div>
        <div class="card">
            <h3>Sample file</h3>
            <p class="muted">Download a ready-to-edit template with example rows.</p>
            <a href="<?= url('/admin/companies/import/sample') ?>" class="btn btn--ghost" style="width:100%">⬇ Download sample CSV</a>
        </div>
        <div class="card">
            <h3>Service slugs</h3>
            <p class="muted">Use these in the <code>services</code> column:</p>
            <div class="chips">
                <?php foreach ($categories as $cat): ?>
                    <span class="chip chip--sm"><?= e($cat['slug']) ?></span>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
