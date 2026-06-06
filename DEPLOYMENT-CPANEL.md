# Deploying DentalBilling.us to cPanel (Node.js + MySQL)

This app is a **Next.js 14 server application** — it runs as a live Node.js
process behind cPanel's Passenger ("Setup Node.js App"). It is **not** a static
upload. You need a cPanel plan with **Setup Node.js App** and a **MySQL**
database (both confirmed available on your host).

---

## 0. Overview of what we'll do

1. Create a MySQL database + user in cPanel.
2. Upload the code to the server.
3. Create the Node.js app in cPanel (Passenger) → startup file `server.js`.
4. Install dependencies + generate Prisma client on the **server** (via SSH).
5. Set environment variables (`.env`).
6. Push the schema to MySQL and seed it.
7. Build (`npm run build`) and start the app.
8. Point your domain + enable HTTPS.

---

## 1. Create the MySQL database (cPanel UI)

cPanel → **MySQL® Databases**:

1. **Create New Database** — e.g. `dental`. cPanel prefixes it with your account
   name, so the real name becomes `youracct_dental`.
2. **Add New User** — e.g. `dbuser` → becomes `youracct_dbuser`. Use a strong
   password and **save it**.
3. **Add User To Database** → grant **ALL PRIVILEGES**.

Your connection details:
- Host: `localhost`  (cPanel MySQL is local to the app)
- Port: `3306`
- Database: `youracct_dental`
- User: `youracct_dbuser`
- Password: the one you saved

> ⚠️ If your password contains symbols like `@ : / # ? %`, they must be
> **URL-encoded** in the connection string (e.g. `@` → `%40`, `#` → `%23`).
> Easiest fix: choose a password with only letters and digits.

---

## 2. Get the code onto the server

Pick ONE:

**A) git clone (recommended, needs git on the server):**
```bash
cd ~
git clone https://github.com/MDanishSaleem/Dental-billing-company.git dental
cd dental
git checkout claude/dental-billing-directory-dEbLV
```

**B) Upload a zip:** zip the project **without** `node_modules` and `.next`,
upload via File Manager to `~/dental`, and Extract.

> Do **NOT** upload your local Windows `node_modules`. Native packages (`sharp`,
> Prisma's query engine) are platform-specific and must be installed on Linux.

Put the project in a folder like `~/dental` (your home dir), NOT inside
`public_html`. Passenger will map the domain to it.

---

## 3. Create the Node.js application (cPanel UI)

cPanel → **Setup Node.js App** → **Create Application**:

- **Node.js version:** 20.x or 22.x (18+ required; this project was tested on 20+).
- **Application mode:** Production.
- **Application root:** `dental`  (the folder from step 2, relative to home).
- **Application URL:** your domain or subdomain (e.g. `dentalbillingcompany.us`).
- **Application startup file:** `server.js`  ← the file included in this repo.

Click **Create**. cPanel creates a Python-style virtualenv for Node and shows a
command near the top like:

```
source /home/youracct/nodevenv/dental/20/bin/activate && cd /home/youracct/dental
```

**Copy that command** — you'll run it over SSH to get the correct `node`/`npm`.

---

## 4. Install dependencies on the server (SSH)

SSH in, then activate the app environment using the command from step 3:

```bash
source /home/youracct/nodevenv/dental/20/bin/activate && cd /home/youracct/dental
```

cPanel sets `NODE_ENV=production`, which makes `npm install` **skip
devDependencies** — but this build needs them (`typescript`, `tailwindcss`,
`tsx`). So force a full install:

```bash
npm install --include=dev
```

This also runs `postinstall` → `prisma generate`, downloading the correct Linux
query engine. (If you hit a memory error here, see Troubleshooting.)

---

## 5. Set environment variables (`.env`)

Edit `~/dental/.env` (File Manager or `nano .env`). Replace placeholders:

```env
DATABASE_URL="mysql://youracct_dbuser:YOUR_PASSWORD@localhost:3306/youracct_dental?connection_limit=5"

NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="PASTE_A_REAL_32+_CHAR_SECRET_HERE"

NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Payments / email — leave placeholders if not used yet; those features just
# won't work until filled in. NEXTAUTH_* and DATABASE_URL are mandatory.
```

A freshly generated secret you can use:
```
NEXTAUTH_SECRET="Xt2EqSRm9LHkk6w8iqdIjcghOe01w/XlU5JB7RcZ92M="
```
(Generate your own with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)

> cPanel's Node.js App UI also has an "Environment variables" section. You can
> set them there instead of `.env` if you prefer — but `.env` is read by the
> Prisma CLI (via `dotenv/config` in `prisma.config.ts`), so keep `DATABASE_URL`
> in `.env` at minimum.

---

## 6. Create tables + seed data (SSH, env still activated)

```bash
# Create all tables from prisma/schema.prisma (no migration files needed):
npx prisma db push

# Seed: 50 states, 120+ cities, 12 categories, 4 plans, 50 companies, admin user, CMS pages
npx prisma db seed
```

After seeding, the admin login is:
- URL: `https://yourdomain.com/admin`
- Email: `admin@dentalbillingcompany.us`
- Password: `admin123!`  ← **change this immediately after first login.**

---

## 7. Build and start

```bash
npm run build
```

Then in cPanel → Setup Node.js App → your app → click **Restart**.
(Or `touch tmp/restart.txt` in the app root — Passenger restarts on that.)

Visit your domain. The homepage should render with seeded companies.

---

## 8. HTTPS / domain

- Assign the domain/subdomain to the app via the **Application URL** field.
- Enable SSL via cPanel → **SSL/TLS Status** → **Run AutoSSL** (Let's Encrypt).
- Make sure `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` use `https://`.

---

## Updating the site later

```bash
source /home/youracct/nodevenv/dental/20/bin/activate && cd /home/youracct/dental
git pull
npm install --include=dev
npx prisma db push        # only if schema changed
npm run build
# cPanel → Restart (or: mkdir -p tmp && touch tmp/restart.txt)
```

---

## Troubleshooting

**`next build` killed / out of memory.** Shared hosting caps RAM (CloudLinux LVE).
- Try: `NODE_OPTIONS=--max-old-space-size=2048 npm run build`
- Ask your host to raise the LVE memory limit during the build, or
- Build locally (`npm run build` on your PC) and upload the generated `.next`
  folder — the build output is platform-independent; only `node_modules` must be
  installed on the server.

**App shows 503 / "We're sorry".** Passenger couldn't start `server.js`. Check
`~/dental/stderr.log` or the app's log. Usually a missing env var or the build
hasn't been run yet.

**`Can't reach database server`.** DATABASE_URL wrong — verify db name/user have
the account prefix, password is URL-encoded, host is `localhost`.

**Prisma "query engine not found".** You uploaded Windows `node_modules`. Delete
it on the server and re-run `npm install --include=dev`.

**Styles missing / 404 on `/_next/static`.** The build didn't complete, or you're
running an old build. Re-run `npm run build` and Restart.

**devDependencies missing during build.** You ran plain `npm install` with
`NODE_ENV=production`. Re-run `npm install --include=dev`.
