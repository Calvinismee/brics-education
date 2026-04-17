# Supabase Setup

This document explains the standard Supabase configuration used by this project.

## 1. Get Session Pooler Credentials

In Supabase dashboard:

1. Open your project.
2. Click Connect.
3. In Connection string, switch to Session pooler.
4. Copy the values for host, port, database, user, and password.

Use Session Pooler when developing from IPv4 networks.

## 2. Configure .env

Set these values in .env:

```env
DB_CONNECTION=pgsql
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<your-supabase-db-password>
DB_SSLMODE=require
```

Notes:

- DB_SSLMODE=require is required for Supabase in most environments.
- Never commit real DB passwords.

## 3. Install PostgreSQL PHP Driver

Check loaded modules:

```bash
php -m | grep -E "pgsql|pdo_pgsql"
```

If nothing is returned, install:

Ubuntu/Debian:

```bash
sudo apt update
sudo apt install php8.3-pgsql
```

Fedora:

```bash
sudo dnf install php-pgsql
```

Arch:

```bash
sudo pacman -S php-pgsql
```

## 4. Run Migrations

```bash
php artisan config:clear
php artisan migrate
```

## 5. Connection Validation

Optional quick check:

```bash
php artisan tinker
DB::connection()->getPdo();
```

If it returns without exception, the database connection is working.
