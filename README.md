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
AWS_DEFAULT_REGION=<storage-region>
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

`AWS_URL` must be the public bucket URL, for example a custom domain such as `https://files.example.com` or the R2 public development URL. Use a custom domain for production because some networks may block or rewrite `r2.dev` public URLs. Keep the bucket public, or configure signed URL support before switching it to private. Students, tutors, and admins read the same stored material URL, so files remain accessible as long as the object storage bucket remains available.

Cloudflare R2 setup checklist:

1. Open Cloudflare Dashboard.
2. Go to Storage & databases > R2.
3. Create a bucket named `materials`.
4. Open the bucket settings and enable public access. Prefer a custom domain for production; use the R2 public development URL only for quick testing.
5. Copy that public bucket URL into `AWS_URL`.
6. Go back to R2 Overview > Manage API Tokens.
7. Create an API token with Object Read & Write access, scoped only to the `materials` bucket.
8. Copy the Access Key ID into `AWS_ACCESS_KEY_ID`.
9. Copy the Secret Access Key into `AWS_SECRET_ACCESS_KEY`. Cloudflare only shows this once.
10. Copy your S3 API endpoint, usually `https://<your-cloudflare-account-id>.r2.cloudflarestorage.com`, into `AWS_ENDPOINT`.
11. In deployment, run `php artisan config:clear` after changing env values.

## Testing Guide <a id="testing-guide"></a>

This project uses Pest on top of PHPUnit. Automated tests must run against a local PostgreSQL test database, not Supabase or production data.

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

### Running Tests <a id="running-tests"></a>

Clear cached configuration before running tests:

```bash
php artisan config:clear
```

Run the full test suite:

```bash
composer test
```

Run only admin-related tests:

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
- `tests/Unit`: small isolated checks or documented pending cases.

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

If a planned test case cannot be automated yet because the route, controller, model, or validation does not exist, keep it as a `todo()` entry in:

```text
tests/Unit/AdminPendingTestCasesTest.php
```

When a pending feature becomes testable:

1. Add or update the feature test.
2. Remove the matching `todo()` entry.
3. Run `php artisan test --filter=Admin`.
4. Run `composer test` before merging.

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
```

Important:

- Do not commit real database credentials.
- Supabase direct host is often IPv6-only. Use Session Pooler for IPv4-compatible access.

### Happy Engineering, y'all !!
