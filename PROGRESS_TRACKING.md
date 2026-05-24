# Progress Tracking Implementation

## Deskripsi
Implementasi lengkap untuk tracking progress siswa saat belajar:
- Database: `progress_records` mencatat progress per siswa per course
- API: `GET|POST /student/progress` untuk baca/tulis progress
- Frontend: Progress terupdate real-time saat siswa membuka materi di `CourseLearn` dan ditampilkan di `StudentDashboard`

## File Baru
- `database/migrations/2026_05_16_000001_create_progress_records_table.php` — Migration
- `app/Models/ProgressRecord.php` — Model Eloquent
- `app/Http/Controllers/Student/ProgressController.php` — API Controller
- `database/seeders/ProgressSeeder.php` — Sample data seeder
- `scripts/migrate_bypass.php` — Bypass PHP version check untuk run migration

## File yang Diubah
- `routes/web.php` — Tambah endpoint progress API
- `resources/js/Pages/StudentDashboard.jsx` — Fetch progress dari API & tampilkan persen per course
- `resources/js/Pages/CourseLearn.jsx` — Kirim progress update saat membuka materi

## Cara Setup

### Opsi A: Run Migration dengan Bypass (Disarankan untuk PHP 8.2)
Jika lokal PHP 8.2 dan composer require PHP 8.3+:

```bash
php scripts/migrate_bypass.php
```

Atau edit `composer.json` baris require PHP agar kompatibel 8.2:
```json
{
  "require": {
    "php": "^8.2",
    ...
  }
}
```

Kemudian jalankan:
```bash
php artisan migrate --force
php artisan db:seed --class=ProgressSeeder
```

### Opsi B: Run dalam Docker
```bash
docker run --rm -it -v "${PWD}:/app" -w /app php:8.3-cli bash -c "
  curl -fsSL https://raw.githubusercontent.com/composer/getcomposer.org/main/web/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
  composer install && \
  php artisan migrate --force && \
  php artisan db:seed --class=ProgressSeeder
"
```

## Testing
1. Login sebagai siswa
2. Buka `/dashboard` — lihat progress di "Rata-rata Progres" card
3. Buka course dan buka materi — progress update otomatis
4. Refresh dashboard — progress tetap tersimpan

## API Endpoints
- `GET /student/progress` — Lihat progress user
  Response:
  ```json
  {
    "courses": [
      {"course_id": 1, "percent": 25},
      {"course_id": 2, "percent": 50}
    ]
  }
  ```

- `POST /student/progress` — Update progress
  Body:
  ```json
  {
    "course_id": 1,
    "material_id": null,
    "percent": 25,
    "status": "in_progress"
  }
  ```

## Catatan
- Progress otomatis terupdate ketika siswa membuka materi di halaman `CourseLearn`
- Percent dihitung dari: `(jumlah materi dibuka / total materi) * 100`
- Data tersimpan di database `progress_records` untuk persistence
