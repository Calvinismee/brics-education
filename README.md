# BRICS Education

Laravel 13 + Inertia + React (JSX) application for BRICS Education.

## Tech Stack

- PHP 8.3
- Laravel 13
- PostgreSQL (Supabase)
- Inertia.js + React 18
- Vite 8

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

3. Configure database using Supabase session pooler values (see section below).

4. Build frontend assets and run migrations:

```bash
npm run build
php artisan config:clear
php artisan migrate
```

5. Start development servers:

```bash
php artisan serve
npm run dev
```

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
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<your-supabase-db-password>
DB_SSLMODE=require
```

Important:

- Do not commit real database credentials.
- Supabase direct host is often IPv6-only. Use Session Pooler for IPv4-compatible access.

## Required PHP Extension

Laravel PostgreSQL connections require both pgsql and pdo_pgsql.

Ubuntu/Debian:

```bash
sudo apt update
sudo apt install php8.3-pgsql
```

Fedora:

```bash
sudo dnf install php-pgsql
```

Arch Linux:

```bash
sudo pacman -S php-pgsql
```

Verify installation:

```bash
php -m | grep -E "pgsql|pdo_pgsql"
```

## JSX Notes

- Vite entry is resources/js/app.jsx.
- Inertia pages are resolved from resources/js/Pages/**/*.jsx.
- resources/js/bootstrap.js must exist and be imported by app.jsx.

If you hit a manifest mismatch error, rebuild assets:

```bash
rm -rf public/build
npm run build
php artisan optimize:clear
```

## Technical Documentation

- Supabase onboarding and connection details: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
- Developer troubleshooting guide: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
