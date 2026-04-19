# BRICS Education

### Software Engineering KOM1231 Even Semester 2025/2026

Web-based SNBT preparation tutoring management platform that integrates independent learning with automated transaction management. Designed to provide a structured and accessible learning experience for prospective university students.


Developed by:

| Name                           | Student ID  |
|--------------------------------|-------------|
| Nasywa Azzahra Naadhirah       | M0403241032 |
| Julius Calvin Kurniadi         | M0403241082 |
| Azalia Noverizqy Aqila Pramono | M0403241123 |

## Prerequisites

- PHP 8.3+
- Composer 2+
- Node.js 20+ and npm 10+
- PostgreSQL PHP extension (pgsql and pdo_pgsql)

## Tech Stack
- PHP 8.3
- Laravel 13
- PostgreSQL (Supabase)
- Inertia.js + React 18
- Vite 8

## Clone
```bash
git clone https://github.com/Calvinismee/brics-education.git
cd brics-education
```

## GitHub Workflow (Feature Development)

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

## Quick Start

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

3. Configure database using Supabase session pooler values (see [Supabase Database Setup](#supabase-database-setup)).

4. Build frontend assets and run migrations:

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

Then open http://localhost:8000 in your browser.

## Supabase Database Setup

Use the Session Pooler connection details from Supabase dashboard:

1. Open Supabase project.
2. Go to Connect.
3. Under Connection string, choose Session pooler.
4. Copy host, port, user, and password.

Required .env values:

```env
DB_CONNECTION=pgsql
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<supabase-db-password>
```

Important:

- Do not commit real database credentials.
- Supabase direct host is often IPv6-only. Use Session Pooler for IPv4-compatible access.
#
### Happy Engineering, y'all !!