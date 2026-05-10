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
