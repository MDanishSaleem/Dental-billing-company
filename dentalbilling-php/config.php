<?php
/**
 * Application configuration.
 * EDIT the database section with your cPanel MySQL details, then save.
 * This file is blocked from web access by .htaccess.
 */

return [
    // ---- Database (cPanel → MySQL Databases) ----
    'db' => [
        'host'     => 'localhost',
        'port'     => '3306',
        'name'     => 'emergenc_dental',     // your full DB name (with account prefix)
        'user'     => 'emergenc_dental',     // your DB username
        'pass'     => 'CHANGE_ME',           // your DB password (letters + numbers)
        'charset'  => 'utf8mb4',
    ],

    // ---- Site ----
    'site' => [
        'name'     => 'DentalBilling.us',
        'url'      => 'https://test.emergencyrooftarping.us', // no trailing slash
        'email'    => 'noreply@dentalbillingcompany.us',
        'env'      => 'production',          // 'production' or 'development'
    ],

    // ---- Security ----
    'app_key' => 'change-this-to-a-long-random-string-min-32-chars',

    // ---- Mail (SMTP) — optional until you wire up email ----
    'mail' => [
        'host' => 'mail.dentalbillingcompany.us',
        'port' => 465,
        'user' => 'noreply@dentalbillingcompany.us',
        'pass' => '',
        'from' => 'DentalBilling.us <noreply@dentalbillingcompany.us>',
    ],

    // ---- Payments — optional until you wire them up ----
    'stripe' => [
        'secret'         => '',
        'publishable'    => '',
        'webhook_secret' => '',
    ],
    'paypal' => [
        'client_id' => '',
        'secret'    => '',
        'mode'      => 'sandbox', // 'sandbox' or 'live'
    ],
];
