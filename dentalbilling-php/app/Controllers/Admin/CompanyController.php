<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Models\Company;
use App\Models\ServiceCategory;
use App\Models\State;
use App\Models\City;
use App\Models\Setting;
use App\Models\Review;

final class CompanyController extends AdminController
{
    private const CSV_COLUMNS = [
        'name', 'state', 'city', 'tier', 'status', 'short_description', 'description',
        'website', 'website_nofollow', 'phone', 'email', 'address', 'founded_year',
        'team_size', 'logo', 'services', 'rating', 'review_count', 'reviews',
    ];

    // name/state/city are always required (structural). These can be toggled by the admin.
    private const OPTIONAL_FIELDS = [
        'tier' => 'Tier', 'status' => 'Status', 'short_description' => 'Short description',
        'description' => 'Description', 'website' => 'Website', 'website_nofollow' => 'Website nofollow',
        'phone' => 'Phone', 'email' => 'Email', 'address' => 'Address',
        'founded_year' => 'Founded year', 'team_size' => 'Team size', 'logo' => 'Logo URL',
        'services' => 'Services', 'rating' => 'Rating', 'review_count' => 'Review count',
        'reviews' => 'Reviews',
    ];

    private function requiredConfig(): array
    {
        return array_values(array_filter(array_map('trim', explode(',', (string) setting('import_required_fields', '')))));
    }

    /** Show the bulk-import page. */
    public function importForm(): void
    {
        $report = $_SESSION['_import_report'] ?? null;
        unset($_SESSION['_import_report']);
        $this->admin('admin/companies/import', [
            'title'          => 'Import companies (CSV)',
            'active'         => 'companies',
            'report'         => $report,
            'categories'     => ServiceCategory::all(),
            'optionalFields' => self::OPTIONAL_FIELDS,
            'requiredConfig' => $this->requiredConfig(),
        ]);
    }

    /** Save which optional fields are required for import. */
    public function saveRequiredFields(): void
    {
        $this->guard('/admin/companies/import');
        $selected = array_values(array_intersect(
            array_keys(self::OPTIONAL_FIELDS),
            (array) ($_POST['required'] ?? [])
        ));
        Setting::set('import_required_fields', implode(',', $selected));
        flash('success', 'Required fields updated.');
        $this->redirect('/admin/companies/import');
    }

    /** Stream a sample CSV template. */
    public function sampleCsv(): void
    {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="companies-sample.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, self::CSV_COLUMNS);
        // name,state,city,tier,status,short_description,description,website,website_nofollow,
        // phone,email,address,founded_year,team_size,logo,services,rating,review_count,reviews
        fputcsv($out, [
            'Bright Smile Billing', 'California', 'Los Angeles', 'PREMIUM', 'ACTIVE',
            'Full-service dental RCM', 'We handle end-to-end dental billing for practices of all sizes.',
            'https://brightsmile.example', 'dofollow',
            '(213) 555-0100', 'hello@brightsmile.example', '123 Main St', '2016', '10-25',
            'https://brightsmile.example/logo.png',
            'claims-submission|payment-posting|insurance-verification',
            '', '', 'Dr. Lauren M.|5|Collections up 22%|Apex took over our billing and it transformed our cash flow. ;; Office Manager|5|Reliable|We barely think about billing now.',
        ]);
        fputcsv($out, [
            'Lone Star Dental Billing', 'TX', 'Dallas', 'FREE', 'ACTIVE',
            'Reliable Texas billing', 'Dependable claims and patient billing with a personal touch.',
            'https://lonestar.example', 'nofollow',
            '(214) 555-0101', 'info@lonestar.example', '', '2019', '1-10', '',
            'claims-submission|patient-billing',
            '4.5', '54', '',
        ]);
        fclose($out);
        exit;
    }

    /** Process an uploaded CSV. */
    public function import(): void
    {
        $this->guard('/admin/companies/import');

        if (empty($_FILES['csv']) || ($_FILES['csv']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            flash('error', 'Please choose a CSV file to upload.');
            $this->redirect('/admin/companies/import');
        }
        $fh = @fopen($_FILES['csv']['tmp_name'], 'r');
        if (!$fh) {
            flash('error', 'Could not read the uploaded file.');
            $this->redirect('/admin/companies/import');
        }

        $header = fgetcsv($fh);
        if (!$header) {
            fclose($fh);
            flash('error', 'The CSV appears to be empty.');
            $this->redirect('/admin/companies/import');
        }
        // Strip a UTF-8 BOM from the first header cell and index columns by name.
        $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $header[0]);
        $map = [];
        foreach ($header as $i => $h) {
            $map[strtolower(trim((string) $h))] = $i;
        }

        $required = $this->requiredConfig();
        $created = 0; $skipped = 0; $errors = [];
        $rowNum = 1;
        while (($row = fgetcsv($fh)) !== false) {
            $rowNum++;
            if (count(array_filter($row, static fn($v) => trim((string) $v) !== '')) === 0) {
                continue; // blank line
            }
            $get = static fn(string $k) => isset($map[$k]) ? trim((string) ($row[$map[$k]] ?? '')) : '';

            $name = $get('name');
            if ($name === '') { $skipped++; $errors[] = "Row $rowNum: missing name."; continue; }

            $state = State::findByNameOrAbbr($get('state'));
            if (!$state) { $skipped++; $errors[] = "Row $rowNum ($name): unknown state '" . $get('state') . "'."; continue; }

            $city = City::findOrCreate((int) $state['id'], $get('city'));
            if (!$city) { $skipped++; $errors[] = "Row $rowNum ($name): missing city."; continue; }

            // Admin-configured required fields.
            $missing = null;
            foreach ($required as $field) {
                if (isset(self::OPTIONAL_FIELDS[$field]) && $get($field) === '') { $missing = $field; break; }
            }
            if ($missing !== null) {
                $skipped++; $errors[] = "Row $rowNum ($name): missing required field '$missing'."; continue;
            }

            $slug = slugify($name);
            if (Company::findBySlug($slug)) {
                $slug .= '-' . substr(bin2hex(random_bytes(3)), 0, 5);
            }
            $tier = strtoupper($get('tier'));
            if (!in_array($tier, ['FREE', 'BASIC', 'PREMIUM', 'FEATURED'], true)) { $tier = 'FREE'; }
            $status = strtoupper($get('status'));
            if (!in_array($status, ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'], true)) { $status = 'ACTIVE'; }

            $id = Company::create([
                'name'              => $name,
                'slug'              => $slug,
                'status'            => $status,
                'tier'              => $tier,
                'short_description' => $get('short_description'),
                'description'       => $get('description'),
                'website'           => $get('website'),
                'phone'             => $get('phone'),
                'email'             => $get('email'),
                'address'           => $get('address'),
                'founded_year'      => (int) $get('founded_year'),
                'team_size'         => $get('team_size'),
                'city_id'           => (int) $city['id'],
                'state_id'          => (int) $state['id'],
            ]);

            // Services: pipe-separated category slugs or names.
            $serviceIds = [];
            foreach (preg_split('/[|,]/', $get('services')) as $svc) {
                $svc = trim((string) $svc);
                if ($svc === '') { continue; }
                $cat = Database::first(
                    "SELECT id FROM service_categories WHERE slug=? OR name=? LIMIT 1", [slugify($svc), $svc]
                );
                if ($cat) { $serviceIds[] = (int) $cat['id']; }
            }
            if ($serviceIds) {
                Company::syncServices($id, $serviceIds);
            }

            // Logo (URL or path)
            if ($get('logo') !== '') {
                Company::updateLogo($id, $get('logo'));
            }
            // Website nofollow / dofollow
            if ($get('website_nofollow') !== '') {
                $nf = strtolower($get('website_nofollow'));
                Company::setWebsiteNofollow($id, in_array($nf, ['0', 'dofollow', 'no', 'false'], true) ? 0 : 1);
            }
            // Individual reviews (author|rating|title|body, separated by ;;) take priority;
            // otherwise an explicit rating/review_count.
            $reviewsRaw = $get('reviews');
            if ($reviewsRaw !== '') {
                foreach (explode(';;', $reviewsRaw) as $rv) {
                    $parts = array_map('trim', explode('|', $rv));
                    $author = $parts[0] ?? '';
                    $rRating = (int) ($parts[1] ?? 0);
                    if ($author === '' || $rRating < 1 || $rRating > 5) { continue; }
                    Review::create([
                        'company_id'  => $id,
                        'author_name' => $author,
                        'rating'      => $rRating,
                        'title'       => $parts[2] ?? null,
                        'body'        => $parts[3] ?? null,
                        'status'      => 'APPROVED',
                    ]);
                }
                Company::recalcRating($id);
            } elseif ($get('rating') !== '' || $get('review_count') !== '') {
                Company::setRatingCount($id, (float) $get('rating'), (int) $get('review_count'));
            }

            $created++;
        }
        fclose($fh);

        $_SESSION['_import_report'] = [
            'created' => $created,
            'skipped' => $skipped,
            'errors'  => array_slice($errors, 0, 50),
        ];
        flash('success', "Import complete: {$created} created, {$skipped} skipped.");
        $this->redirect('/admin/companies/import');
    }

    public function index(): void
    {
        $this->admin('admin/companies/index', [
            'title'     => 'Companies',
            'active'    => 'companies',
            'companies' => Company::adminAll(),
        ]);
    }

    public function create(): void
    {
        $this->admin('admin/companies/form', [
            'title'      => 'New company',
            'active'     => 'companies',
            'company'    => null,
            'serviceIds' => [],
            'categories' => ServiceCategory::all(),
            'states'     => State::all(),
            'cities'     => City::all(),
            'nofollowSupported' => Company::nofollowSupported(),
        ]);
    }

    public function store(): void
    {
        $this->guard('/admin/companies/new');
        $data = $this->collect();
        if ($data['name'] === '') { flash('error', 'Name is required.'); $this->redirect('/admin/companies/new'); }
        $data['slug'] = slugify($data['name']);
        $id = Company::create($data);
        Company::syncServices($id, (array) ($_POST['services'] ?? []));
        Company::setWebsiteNofollow($id, (int) $this->input('website_nofollow', 1));
        flash('success', 'Company created.');
        $this->redirect('/admin/companies');
    }

    public function edit(array $args): void
    {
        $company = Company::findById((int) $args['id']);
        if (!$company) { $this->notFound(); return; }
        $this->admin('admin/companies/form', [
            'title'      => 'Edit ' . $company['name'],
            'active'     => 'companies',
            'company'    => $company,
            'serviceIds' => Company::serviceIds((int) $company['id']),
            'categories' => ServiceCategory::all(),
            'states'     => State::all(),
            'cities'     => City::all(),
            'nofollowSupported' => Company::nofollowSupported(),
        ]);
    }

    public function update(array $args): void
    {
        $id = (int) $args['id'];
        $this->guard('/admin/companies/' . $id);
        $data = $this->collect();
        $existing = Company::findById($id);
        if (!$existing) { $this->notFound(); return; }
        $data['slug'] = $existing['slug'];
        Company::update($id, $data);
        Company::syncServices($id, (array) ($_POST['services'] ?? []));
        Company::setWebsiteNofollow($id, (int) $this->input('website_nofollow', 1));
        flash('success', 'Company updated.');
        $this->redirect('/admin/companies/' . $id);
    }

    public function delete(array $args): void
    {
        $this->guard('/admin/companies');
        Company::delete((int) $args['id']);
        flash('success', 'Company deleted.');
        $this->redirect('/admin/companies');
    }

    /** Apply a bulk action to selected companies. */
    public function bulk(): void
    {
        $this->guard('/admin/companies');
        $ids = (array) ($_POST['ids'] ?? []);
        $action = (string) $this->input('bulk_action');

        if (!$ids) {
            flash('error', 'No companies selected.');
            $this->redirect('/admin/companies');
        }

        if ($action === 'delete') {
            $n = Company::deleteMany($ids);
            flash('success', "Deleted {$n} compan" . ($n === 1 ? 'y' : 'ies') . '.');
        } elseif (strpos($action, 'status:') === 0) {
            $status = substr($action, 7);
            if (in_array($status, ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'], true)) {
                $n = Company::setStatusMany($ids, $status);
                flash('success', "Set {$n} compan" . ($n === 1 ? 'y' : 'ies') . " to {$status}.");
            }
        } elseif (strpos($action, 'tier:') === 0) {
            $tier = substr($action, 5);
            if (in_array($tier, ['FREE', 'BASIC', 'PREMIUM', 'FEATURED'], true)) {
                $n = Company::setTierMany($ids, $tier);
                flash('success', "Moved {$n} compan" . ($n === 1 ? 'y' : 'ies') . " to the {$tier} plan.");
            }
        } else {
            flash('error', 'Please choose a bulk action.');
        }
        $this->redirect('/admin/companies');
    }

    public function approve(array $args): void
    {
        $this->guard('/admin/companies');
        Company::setStatus((int) $args['id'], 'ACTIVE');
        flash('success', 'Company approved.');
        $this->redirect('/admin/companies');
    }

    public function feature(array $args): void
    {
        $this->guard('/admin/companies');
        $company = Company::findById((int) $args['id']);
        if ($company) {
            Company::setTier((int) $args['id'], $company['tier'] === 'FEATURED' ? 'PREMIUM' : 'FEATURED');
        }
        flash('success', 'Featured status updated.');
        $this->redirect('/admin/companies');
    }

    private function collect(): array
    {
        return [
            'name'              => trim((string) $this->input('name')),
            'status'            => $this->input('status', 'PENDING'),
            'tier'              => $this->input('tier', 'FREE'),
            'short_description' => trim((string) $this->input('short_description')),
            'description'       => trim((string) $this->input('description')),
            'website'           => trim((string) $this->input('website')),
            'phone'             => trim((string) $this->input('phone')),
            'email'             => trim((string) $this->input('email')),
            'address'           => trim((string) $this->input('address')),
            'founded_year'      => (int) $this->input('founded_year'),
            'team_size'         => trim((string) $this->input('team_size')),
            'city_id'           => (int) $this->input('city_id'),
            'state_id'          => (int) $this->input('state_id'),
        ];
    }
}
