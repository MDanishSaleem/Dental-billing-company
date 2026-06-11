<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Setting;

final class SettingController extends AdminController
{
    private const KEYS = ['site_name', 'site_tagline', 'contact_email', 'currency', 'reviews_require_approval'];

    public function index(): void
    {
        $this->admin('admin/settings', [
            'title'    => 'Settings',
            'active'   => 'settings',
            'settings' => Setting::all(),
        ]);
    }

    public function save(): void
    {
        $this->guard('/admin/settings');
        foreach (self::KEYS as $key) {
            if ($key === 'reviews_require_approval') {
                Setting::set($key, isset($_POST[$key]) ? '1' : '0');
            } elseif (array_key_exists($key, $_POST)) {
                Setting::set($key, (string) $_POST[$key]);
            }
        }
        flash('success', 'Settings saved.');
        $this->redirect('/admin/settings');
    }
}
