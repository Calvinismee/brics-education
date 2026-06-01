# BRICS Education <a id="brics-education"></a>

### Software Engineering KOM1231 Even Semester 2025/2026 <a id="software-engineering-kom1231-even-semester-20252026"></a>

Web-based SNBT preparation tutoring management platform that integrates independent learning with automated transaction management. Designed to provide a structured and accessible learning experience for prospective university students.

Developed by:

| Name                           | Student ID  |
|--------------------------------|-------------|
| Nasywa Azzahra Naadhirah       | M0403241032 |
| Julius Calvin Kurniadi         | M0403241082 |
| Azalia Noverizqy Aqila Pramono | M0403241123 |

## Table of Contents <a id="table-of-contents"></a>

- [BRICS Education](#brics-education)
  - [Software Engineering KOM1231 Even Semester 2025/2026](#software-engineering-kom1231-even-semester-20252026)
  - [Prerequisites](#prerequisites)
  - [Tech Stack](#tech-stack)
  - [Clone](#clone)
  - [GitHub Workflow Feature Development](#github-workflow-feature-development)
  - [Quick Start](#quick-start)
  - [Permanent Material Storage](#permanent-material-storage)
  - [Password Reset Email](#password-reset-email)
  - [Scheduled Tutor Reminders](#scheduled-tutor-reminders)
  - [Production Deployment Checklist](#production-deployment-checklist)
  - [Testing Guide](#testing-guide)
  - [Supabase Database Setup](#supabase-database-setup)

## Prerequisites <a id="prerequisites"></a>

- PHP 8.3+
- Composer 2+
- Node.js 20+ and npm 10+
- PostgreSQL PHP extension (pgsql and pdo_pgsql)

## Tech Stack <a id="tech-stack"></a>

- PHP 8.3
- Laravel 13
- PostgreSQL (Supabase)
- Inertia.js + React 18
- Vite 8

## Clone <a id="clone"></a>

```bash
git clone https://github.com/Calvinismee/brics-education.git
cd brics-education
```

## GitHub Workflow (Feature Development) <a id="github-workflow-feature-development"></a>

1. Pull from `main`:

```bash
git checkout main
git pull origin main
```

2. Checkout a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Make the feature:

```bash
# implement your feature
```

4. Push the branch:

```bash
git add .
git commit -m "feat: short description"
git push -u origin feature/your-feature-name
```

5. Request merge:

- Open a Pull Request from `feature/your-feature-name` to `main`.
- Ask for review, then merge after approval.

## Quick Start <a id="quick-start"></a>

1. Install backend and frontend dependencies:

```bash
composer install
npm install
```

2. Copy environment file and generate key:

```bash
cp .env.example .env
php artisan key:generate
```

3. Configure database using Supabase session pooler values. See [Supabase Database Setup](#supabase-database-setup).

4. Build frontend assets, run migrations, and seed the database:

```bash
npm run build
php artisan config:clear
php artisan migrate
```

5. Start development servers in two separate terminals:

```bash
# Terminal 1
php artisan serve
```

```bash
# Terminal 2
npm run dev
```

6. Verify setup:

```bash
php artisan migrate:status
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Permanent Material Storage <a id="permanent-material-storage"></a>

Tutor-uploaded PDFs, docs, PPTs, and quizzes use the `MATERIALS_FILESYSTEM_DISK` value.

For local development, use Laravel's public disk:

```env
MATERIALS_FILESYSTEM_DISK=public
```

Then make sure the public storage link exists:

```bash
php artisan storage:link
```

For production deployment on platforms where app files can be reset during redeploys, use persistent object storage. This project is configured to work with Cloudflare R2 through Laravel's S3-compatible filesystem driver:

```env
MATERIALS_FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<storage-access-key>
AWS_SECRET_ACCESS_KEY=<storage-secret-key>
AWS_DEFAULT_REGION=auto
AWS_BUCKET=<bucket-name>
AWS_URL=<public-bucket-url>
AWS_ENDPOINT=<s3-compatible-endpoint>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Example Cloudflare R2 values:

```env
MATERIALS_FILESYSTEM_DISK=s3
AWS_DEFAULT_REGION=auto
AWS_BUCKET=materials
AWS_URL=https://<your-r2-public-bucket-url>
AWS_ENDPOINT=https://<your-cloudflare-account-id>.r2.cloudflarestorage.com
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Set `APP_URL` to the deployed HTTPS website URL. Uploaded materials are stored permanently in R2, but PDF, DOC, and PPT previews are served through a temporary signed application URL. This keeps admin, tutor, and student previews independent from the public `r2.dev` URL.

`AWS_URL` is still used for assets that need a direct public URL, such as uploaded tutor profile photos. Use an R2 custom domain such as `https://files.example.com` in production. Cloudflare documents `r2.dev` as a rate-limited development endpoint, so do not rely on it for production traffic.

Cloudflare R2 setup checklist:

1. Open Cloudflare Dashboard.
2. Go to Storage & databases > R2.
3. Create a bucket named `materials`.
4. Connect a custom domain for production assets. Enable the R2 public development URL only for quick testing.
5. Copy the custom domain, or the temporary development URL while testing, into `AWS_URL`.
6. Go back to R2 Overview > Manage API Tokens.
7. Create an API token with Object Read & Write access, scoped only to the `materials` bucket.
8. Copy the Access Key ID into `AWS_ACCESS_KEY_ID`.
9. Copy the Secret Access Key into `AWS_SECRET_ACCESS_KEY`. Cloudflare only shows this once.
10. Copy your S3 API endpoint, usually `https://<your-cloudflare-account-id>.r2.cloudflarestorage.com`, into `AWS_ENDPOINT`.
11. Set `APP_URL` to the deployed HTTPS website URL.
12. In deployment, run `php artisan optimize:clear` after changing env values.

### Production Upload Limits <a id="production-upload-limits"></a>

Tutor upload supports a module and a question bank file of up to `50 MB` each in one request. The repository includes `public/.user.ini` for PHP-FPM deployments:

```ini
upload_max_filesize = 50M
post_max_size = 120M
```

If the deployment platform uses Nginx or another reverse proxy, also set its request body limit to at least `120 MB` (for Nginx: `client_max_body_size 120M;`). Redeploy after changing PHP or proxy limits.

## Password Reset Email <a id="password-reset-email"></a>

Student, tutor, and admin accounts can request a password reset link from their respective login page. Laravel stores the short-lived token in `password_reset_tokens`, sends an email, updates the hashed password after the token is confirmed, and redirects the user back to the correct role-specific login page.

Local development uses `MAIL_MAILER=log`, so reset links are written to `storage/logs/laravel.log`. For production, configure a real SMTP provider:

```env
APP_URL=https://<your-app-domain>
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=<your-smtp-host>
MAIL_PORT=587
MAIL_USERNAME=<your-smtp-username>
MAIL_PASSWORD=<your-smtp-password>
MAIL_FROM_ADDRESS=no-reply@<your-app-domain>
MAIL_FROM_NAME="${APP_NAME}"
```

After changing deployment environment variables, run:

```bash
php artisan optimize:clear
```

The sender address must be accepted by the selected email provider. Some providers require domain or sender verification before email delivery is enabled.

## Scheduled Tutor Reminders <a id="scheduled-tutor-reminders"></a>

Tutors can enable or disable an automatic notification reminder from the tutor settings page. When enabled, the scheduler creates an in-app notification 10 minutes before each live class or consultation. No additional database migration is required because reminders use the existing `notifications` table.

Run Laravel's scheduler every minute in production:

```cron
* * * * * cd /path/to/brics-education && php artisan schedule:run >> /dev/null 2>&1
```

For deployment platforms that provide a persistent worker instead of cron, run:

```bash
php artisan schedule:work
```

To trigger the reminder check manually:

```bash
php artisan tutor:send-class-reminders
```

## Production Deployment Checklist <a id="production-deployment-checklist"></a>

Before opening the deployed application to users:

1. Keep `DB_SEARCH_PATH=public` in the production environment. The `testing` schema is only for automated tests.
2. Configure the production SMTP values described in [Password Reset Email](#password-reset-email). Reset links cannot reach real users while `MAIL_MAILER=log`.
3. Configure Cloudflare R2 values described in [Permanent Material Storage](#permanent-material-storage).
4. Apply database migrations and clear stale cached configuration:

```bash
php artisan migrate --force
php artisan optimize:clear
```

5. Configure exactly one scheduler process using cron `php artisan schedule:run` every minute or a persistent `php artisan schedule:work` worker. This is required for tutor class reminders.
6. Verify the deployed configuration:

```bash
php artisan schedule:list
php artisan tutor:send-class-reminders
```

## Testing Guide <a id="testing-guide"></a>

This project uses Pest on top of PHPUnit. Automated tests use Laravel `RefreshDatabase`, so they must never run against the application `public` schema. Tests can use either a local PostgreSQL test database or the isolated `testing` schema on Supabase.

### Test Database Setup <a id="test-database-setup"></a>

Create a dedicated local PostgreSQL database 
The test database connection is configured directly in `phpunit.xml`:

```env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=brics_test
DB_USERNAME=postgres
DB_PASSWORD=
```

If your local PostgreSQL username is not `postgres`, or if it needs a password, update the forced database values in `phpunit.xml`.

The test suite uses Laravel `RefreshDatabase`, so migrations are rebuilt automatically while tests run.

### Supabase Test Schema <a id="supabase-test-schema"></a>

To run the tests with the Supabase credentials already configured in `.env`, create a dedicated schema once from the Supabase SQL Editor:

```sql
create schema if not exists testing;
```

Then run Pest with the Supabase-specific configuration:

```bash
./vendor/bin/pest -c phpunit.supabase.xml
```

`phpunit.supabase.xml` reuses the Supabase host, port, database, username, and password from `.env`, but forces `DB_SEARCH_PATH=testing`. A guard in `tests/TestCase.php` blocks remote tests before migration if the connection points to the `public` schema. Do not rename the schema or bypass this guard.

### Running Tests <a id="running-tests"></a>

Clear cached configuration before running tests:

```bash
php artisan config:clear
```

Run the full test suite:

```bash
composer test
```

Run the full test suite with the isolated Supabase schema:

```bash
./vendor/bin/pest -c phpunit.supabase.xml
```

Run only password reset and tutor reminder tests with Supabase:

```bash
./vendor/bin/pest -c phpunit.supabase.xml tests/Feature/Auth/PasswordResetTest.php tests/Feature/Tutor/TutorSettingsReminderTest.php
```

Run only admin-related local tests:

```bash
php artisan test --filter=Admin
```

Run one test file:

```bash
php artisan test tests/Feature/Admin/AdminPackageContentTest.php
```

Run a specific test case ID:

```bash
php artisan test --filter=TC_ADMIN_TRX_003
```

### Creating Tests <a id="creating-tests"></a>

Place tests based on their scope:

- `tests/Feature/Admin`: admin HTTP, route, controller, database, and Inertia response tests.
- `tests/Feature/Auth`: authentication and profile behavior.
- `tests/Feature/Tutor`: tutor workflow, schedule, material, and reminder tests.

Use shared helper functions from `tests/Pest.php` to keep test setup consistent:

- `adminUser()`
- `studentUser()`
- `tutorUser()`
- `courseRecord()`
- `packageRecord()`
- `materialRecord()`
- `transactionRecord()`
- `notificationRecord()`

Keep traceability to the planned test cases by including the test case ID in the Pest test name:

```php
test('TC_ADMIN_TRX_003 admin dapat filter transaksi berdasarkan status', function () {
    // Documentation: admin opens transactions with a status filter; expected only matching transactions are shown.
});
```

When a pending feature becomes testable:

1. Add or update the feature test.
2. Run the related filtered tests.
3. Run the full suite before merging.

## Supabase Database Setup <a id="supabase-database-setup"></a>

Use the Session Pooler connection details from Supabase dashboard:

1. Open Supabase project.
2. Go to Connect.
3. Choose `Direct - Connection string`.
4. In Connection Method, choose Session pooler.
5. Copy host, port, database, and user.
6. Ask database owner for password.

Required `.env` values:

```env
DB_CONNECTION=pgsql
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=<database-name>
DB_USERNAME=<username>
DB_PASSWORD=<supabase-db-password>
DB_SSLMODE=require
DB_SEARCH_PATH=public
```

Important:

- Do not commit real database credentials.
- Supabase direct host is often IPv6-only. Use Session Pooler for IPv4-compatible access.
- Keep deployment on `DB_SEARCH_PATH=public`. The `testing` schema is only for automated tests.

### Happy Engineering, y'all !!
