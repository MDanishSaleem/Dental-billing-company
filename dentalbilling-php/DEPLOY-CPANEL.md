# Deploy DentalBilling.us (PHP) to cPanel — no terminal, no build

This app is plain **PHP 8 + MySQL**. cPanel runs it natively: **no Node, no build
step, no Composer, no Passenger.** You only use **File Manager** and **phpMyAdmin**.

---

## 1. Create the database (cPanel → MySQL Databases)
1. **MySQL® Database Wizard** → create a database (e.g. `dental`) → becomes `youracct_dental`.
2. Create a user (e.g. `dental`) with a **letters-and-numbers-only** password.
3. Grant the user **ALL PRIVILEGES** on the database.
4. Write down: database name, username, password.

## 2. Import the tables + data (phpMyAdmin)
1. cPanel → **phpMyAdmin**.
2. Click your database (`youracct_dental`) in the left list.
3. Top menu → **Import** → **Choose File** → select **`database.sql`** → **Go**.
4. You should see "Import has been successfully finished." (Creates all tables + seed data, including the admin account.)

## 3. Upload the app files (File Manager)
1. cPanel → **File Manager**.
2. Go into the folder your domain/subdomain serves from (its **document root** — for a
   subdomain like `test.example.com` that's usually `/home/youracct/test.example.com`).
3. Click **Upload** → upload everything in this `dentalbilling-php` folder
   *(easiest: zip this folder on your PC, upload the zip, then right-click → Extract,
   and move the files so `index.php` sits directly in the document root)*.
4. Make sure **Show Hidden Files** is on (Settings → Show Hidden Files) so `.htaccess`
   uploads too.

The document root should directly contain: `index.php`, `.htaccess`, `config.php`,
`app/`, `assets/`. (You can delete `database.sql` and `DEPLOY-CPANEL.md` after import.)

## 4. Enter your database details (config.php)
1. In File Manager, right-click **`config.php`** → **Edit**.
2. Fill the `db` section with the database name, user, and password from step 1.
3. Set `site.url` to your domain (e.g. `https://test.example.com`), no trailing slash.
4. Change `app_key` to any long random string.
5. **Save.**

## 5. Pick the PHP version (if needed)
cPanel → **MultiPHP Manager** → set your domain to **PHP 8.0+** (8.1 or 8.2 recommended).

## 6. Visit your site
Open your domain. The homepage should load with the seeded companies. 🎉

**Admin login:** `https://yourdomain/admin`
Email `admin@dentalbillingcompany.us` · Password `admin123!`
*(Change the password after first login. The admin panel arrives in a later build phase.)*

---

## Updating later
Edit files in File Manager (or re-upload changed ones). **No build or restart needed** —
PHP picks up changes immediately.

## Troubleshooting
- **"Database connection failed"** → wrong details in `config.php`, or the user isn't
  added to the database with privileges.
- **Blank page / 500** → set `site.env` to `development` in `config.php` temporarily to
  see the error, then set it back to `production`.
- **Links/styles look off** → make sure `site.url` in `config.php` exactly matches your
  domain (with `https://`).
- **Homepage works but `/pricing` etc. 404** → those pages are added in later build
  phases; only the homepage is live in Phase 1.
