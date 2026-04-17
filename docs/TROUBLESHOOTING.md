# Troubleshooting

## Database Errors

### Error: could not find driver (Connection: pgsql)

Cause:

- PostgreSQL PHP extension is missing for CLI PHP.

Fix:

1. Install pgsql extension for your distribution.
2. Verify modules:

```bash
php -m | grep -E "pgsql|pdo_pgsql"
```

3. Retry:

```bash
php artisan config:clear
php artisan migrate
```

### Error: connection timeout or SSL failure

Cause:

- Wrong host/port or SSL mode not set.

Fix:

- Use Session Pooler credentials from Supabase Connect panel.
- Set DB_SSLMODE=require in .env.

## Vite / Frontend Errors

### Error: Unable to locate file in Vite manifest: resources/js/app.jsx

Cause:

- public/build/manifest.json is stale and still references app.js.

Fix:

```bash
rm -rf public/build
npm run build
php artisan optimize:clear
```

### Error: Failed to resolve import "./bootstrap" from resources/js/app.jsx

Cause:

- Missing resources/js/bootstrap.js file or typo in import path.

Fix:

1. Ensure app entry imports:

```js
import './bootstrap';
```

2. Create resources/js/bootstrap.js:

```js
import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
```

3. Install axios if needed:

```bash
npm install axios
```

## Recommended Recovery Sequence

When setup looks inconsistent:

```bash
php artisan optimize:clear
rm -rf public/build
npm install
npm run build
php artisan config:clear
php artisan migrate
```
