# Laporan Tahapan Implementasi Fitur BRICS Education

## 1. Gambaran Umum Implementasi

Implementasi sistem BRICS Education dilakukan dengan metode incremental. Pada praktiknya, pembagian pekerjaan dibagi menjadi tiga area utama berdasarkan role pengguna, yaitu admin, tutor, dan siswa. Setiap increment menghasilkan fitur yang dapat diuji secara langsung, lalu disinkronkan dengan modul lain melalui database yang sama.

Tujuan utama implementasi adalah membuat alur pembelajaran UTBK berjalan dari proses administrasi, pengajaran tutor, sampai akses belajar siswa. Fitur utama yang diimplementasikan meliputi manajemen akun, penugasan tutor ke course, manajemen jadwal, upload materi, review materi oleh admin, dashboard tutor, monitoring kelas, dashboard siswa, akses materi, notifikasi, profil, dan progress belajar.

## 2. Pembagian Tanggung Jawab

| Area | Penanggung Jawab | Fokus Implementasi |
| --- | --- | --- |
| Admin | Nama anggota admin | Manajemen user, penugasan tutor, manajemen jadwal, review materi, monitoring riwayat tutor |
| Tutor | Nama anggota tutor | Dashboard tutor, jadwal tutor, upload materi, monitor kelas, profil, settings, notifikasi |
| Siswa | Nama anggota siswa | Dashboard siswa, akses course, jadwal siswa, notifikasi, progress belajar, preview/download materi |

Catatan: nama penanggung jawab dapat diganti sesuai pembagian kerja asli kelompok.

## 3. Tahapan Implementasi Incremental

### Increment 1 - Modul Admin

Tahap pertama berfokus pada fitur admin karena admin menjadi pengendali data utama sistem. Admin dapat membuat akun pengguna, menentukan role, menugaskan tutor ke course, membuat jadwal, dan melakukan review materi yang diupload tutor.

Fitur yang diimplementasikan:

- CRUD pengguna.
- Assignment tutor ke satu atau lebih course.
- CRUD jadwal course.
- Penambahan tipe jadwal admin: live class, konsultasi, deadline tutor, review, dan tryout.
- Monitoring seluruh jadwal, termasuk deadline siswa yang dibuat tutor.
- Review materi tutor: approve atau reject.
- Monitoring riwayat mengajar tutor.

### Increment 2 - Modul Tutor

Tahap kedua berfokus pada pengalaman tutor. Tutor menerima data yang sebelumnya dibuat oleh admin, seperti akun, course yang diajar, dan jadwal yang ditetapkan. Tutor juga dapat membuat live class, konsultasi, deadline tugas siswa, upload materi, menghapus materi, menambahkan meeting link, dan memonitor siswa.

Fitur yang diimplementasikan:

- Dashboard tutor.
- Jadwal tutor mingguan dinamis.
- Create jadwal live class dan konsultasi oleh tutor.
- Create, update, dan delete deadline tugas siswa dengan link form wajib.
- Update link meeting.
- Start session.
- Upload materi video, modul, dan bank soal.
- Delete materi.
- Monitor kelas dan daftar siswa.
- Profil tutor, edit profil, upload foto profil, settings, password.
- Notifikasi dan riwayat mengajar.
- Mobile drawer untuk tampilan mobile.

### Increment 3 - Modul Siswa

Tahap ketiga berfokus pada akses siswa. Siswa hanya dapat melihat course yang sedang aktif berdasarkan enrollment. Materi yang terlihat hanya materi yang sudah disetujui admin. Jadwal siswa otomatis mengikuti live class, konsultasi, deadline tugas, dan tryout pada course aktif tanpa menampilkan pengingat internal tutor.

Fitur yang diimplementasikan:

- Dashboard siswa.
- Daftar course aktif.
- Jadwal siswa per minggu.
- Join meeting jika link tersedia.
- Akses form deadline tugas sebelum jam batas akhir.
- Akses platform tryout dari jadwal siswa.
- Course learn untuk melihat video, modul, dan bank soal.
- Preview PDF, DOC, DOCX, PPT, PPTX.
- Download materi.
- Notifikasi materi baru dan pengumuman tutor.
- Progress belajar.

## 4. Struktur Data Utama

| Tabel | Fungsi |
| --- | --- |
| `users` | Menyimpan akun admin, tutor, dan siswa |
| `roles` | Menentukan role pengguna |
| `courses` | Menyimpan daftar course/subtes UTBK |
| `course_tutor` | Menyimpan relasi tutor dengan course yang diajar |
| `enrollments` | Menyimpan relasi siswa dengan course aktif |
| `schedules` | Menyimpan jadwal lintas-role beserta `type`, `audience`, meeting link, link aksi, dan waktu berakhir |
| `materials` | Menyimpan materi tutor dan status review admin |
| `notifications` | Menyimpan notifikasi untuk admin, tutor, dan siswa |
| `progress_records` | Menyimpan progress belajar siswa |

### 4.1 Desain Data Jadwal Lintas-Role

Seluruh agenda disimpan pada tabel `schedules`. Pemisahan kebutuhan tutor dan siswa dilakukan melalui kombinasi field `type` dan `audience`, bukan dengan data dummy atau tabel terpisah.

| Field | Fungsi |
| --- | --- |
| `type` | Menentukan jenis agenda: `live`, `consultation`, `deadline`, `review`, `student_deadline`, atau `tryout` |
| `audience` | Menentukan target baca: `shared`, `tutor`, atau `student` |
| `meeting_link` | Menyimpan Zoom atau Google Meet URL untuk live class dan konsultasi |
| `action_link` | Menyimpan link form pengumpulan atau platform tryout |
| `start_time` | Menyimpan waktu mulai sesi. Untuk deadline siswa dinormalisasi ke awal hari agar dapat ditempatkan pada kalender |
| `end_time` | Menyimpan waktu selesai sesi atau satu-satunya jam batas akhir deadline siswa |
| `started_at` | Menyimpan waktu tutor menekan tombol mulai sesi sebagai bukti kehadiran |

Snippet migrasi:

```php
// database/migrations/2026_05_30_000001_add_audience_and_action_link_to_schedules_table.php
Schema::table('schedules', function (Blueprint $table) {
    if (! Schema::hasColumn('schedules', 'audience')) {
        $table->string('audience', 20)->default('shared')->after('type');
    }

    if (! Schema::hasColumn('schedules', 'action_link')) {
        $table->string('action_link', 1024)->nullable()->after('meeting_link');
    }
});
```

Penjelasan:

`meeting_link` dan `action_link` dipisah agar maknanya jelas. Link meeting dipakai untuk sesi sinkron, sedangkan action link dipakai untuk aktivitas eksternal seperti form tugas dan platform tryout.

Snippet normalisasi deadline siswa:

```php
// database/migrations/2026_05_30_000002_normalize_student_deadline_start_times.php
DB::table('schedules')
    ->where('type', 'student_deadline')
    ->whereNotNull('end_time')
    ->select('id', 'end_time')
    ->orderBy('id')
    ->chunkById(100, function ($schedules) {
        foreach ($schedules as $schedule) {
            DB::table('schedules')
                ->where('id', $schedule->id)
                ->update([
                    'start_time' => Carbon::parse($schedule->end_time)->startOfDay(),
                ]);
        }
    });
```

Penjelasan:

Deadline siswa hanya memiliki satu jam penting, yaitu batas akhir pada `end_time`. Migrasi menormalkan data lama agar `start_time` berada di awal hari. Dengan begitu, deadline tetap dapat ditempatkan pada tanggal yang benar tanpa menampilkan rentang jam yang membingungkan siswa.

Screenshot yang perlu diambil:

- Struktur tabel `schedules` yang menampilkan kolom `type`, `audience`, `meeting_link`, `action_link`, `start_time`, `end_time`, dan `started_at`.
- Contoh row live class dengan audiens `shared`.
- Contoh row deadline tutor dengan audiens `tutor`.
- Contoh row deadline siswa atau tryout dengan audiens `student`.

## 5. Core Feature dan Flow Admin

### 5.1 Dashboard Admin

Dashboard admin menjadi halaman awal setelah admin login. Halaman ini menampilkan ringkasan kondisi platform, seperti total pengguna, registrasi baru, pengguna aktif, distribusi role, grafik pertumbuhan pengguna, dan daftar pengguna terbaru.

Flow:

1. Admin login melalui `/login/admin`.
2. Sistem mengarahkan admin ke `/admin/dashboard`.
3. Controller membaca data dari tabel `users` berdasarkan role.
4. Sistem menghitung total user, user aktif, registrasi baru, user tidak aktif, dan distribusi role.
5. Data dikirim ke halaman `Admin/Dashboard.jsx`.
6. UI menampilkan kartu statistik, grafik pertumbuhan, distribusi pengguna, dan pengguna terbaru.

Snippet controller:

```php
// app/Http/Controllers/AdminDashboardController.php
public function index()
{
    $dashboardData = Cache::remember(
        self::DASHBOARD_CACHE_KEY,
        self::DASHBOARD_CACHE_TTL_SECONDS,
        fn () => $this->dashboardData(),
    );

    return Inertia::render('Admin/Dashboard', [
        ...$dashboardData,
    ]);
}

private function dashboardData(): array
{
    $now = CarbonImmutable::now();
    $roleIds = User::adminRoleIds();
    $metrics = $this->userMetrics($roleIds, $now, $now->subMonthNoOverflow(), $now->subDays(7));

    return [
        'userStats' => [
            ['label' => 'Total Pengguna', 'value' => number_format((int) ($metrics->total_users ?? 0))],
            ['label' => 'Registrasi Baru', 'value' => number_format((int) ($metrics->new_registrations ?? 0))],
            ['label' => 'Pengguna Aktif', 'value' => number_format((int) ($metrics->active_users ?? 0))],
        ],
        'growthData' => array_map(
            fn (int $index) => (int) ($metrics->{'growth_month_'.$index} ?? 0),
            range(0, 5),
        ),
        'distributionData' => [
            ['label' => 'Siswa', 'value' => (int) ($metrics->student_count ?? 0)],
            ['label' => 'Tutor/Mentor', 'value' => (int) ($metrics->tutor_count ?? 0)],
            ['label' => 'Admin', 'value' => (int) ($metrics->admin_count ?? 0)],
        ],
    ];
}
```

Penjelasan:

Method `index()` mengambil data dashboard melalui cache agar query statistik tidak terus dijalankan setiap halaman dibuka. Method `dashboardData()` menyusun data statistik pengguna, grafik pertumbuhan, dan distribusi role yang kemudian dipakai oleh tampilan dashboard admin.

Snippet tampilan:

```jsx
// resources/js/Pages/Admin/Dashboard.jsx
<AdminLayout title="Dashboard Admin" subtitle="Ringkasan data pengguna platform BRICS Education.">
    <Head title="Dashboard Admin" />

    <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statsWithIcons.map((stat) => (
            <StatCard key={stat.label} {...stat} />
        ))}
    </div>

    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-bold text-gray-900">Pertumbuhan Pengguna</h3>
            {(growthData || []).map((value, index) => (
                <div key={index}>{value.toLocaleString()}</div>
            ))}
        </div>
    </div>
</AdminLayout>
```

Penjelasan:

Komponen dashboard admin menerima data dari controller melalui props Inertia. UI hanya merender kartu statistik dan grafik, sedangkan perhitungan data tetap dilakukan di backend.

Screenshot yang perlu diambil:

- Halaman dashboard admin secara penuh.
- Kartu Total Pengguna, Registrasi Baru, Pengguna Aktif, dan Tidak Aktif.
- Grafik Pertumbuhan Pengguna.
- Distribusi Pengguna.
- Daftar Pengguna Terbaru.

### 5.2 Manajemen Pengguna dan Assignment Tutor

Admin dapat membuat, mengedit, dan menghapus akun pengguna. Saat membuat akun tutor, admin dapat langsung memilih course yang akan diajar oleh tutor. Data assignment disimpan ke tabel `course_tutor`, sehingga tutor hanya dapat mengakses course yang memang ditugaskan kepadanya.

Flow:

1. Admin membuka halaman `Admin > Pengguna`.
2. Admin menambahkan user baru.
3. Admin memilih role: siswa, tutor, atau admin.
4. Jika role tutor, admin memilih course yang diajar.
5. Sistem menyimpan akun ke tabel `users`.
6. Sistem menyimpan assignment tutor ke tabel `course_tutor`.
7. Tutor login dan hanya melihat course yang ditugaskan.

CRUD:

| Aksi | Implementasi |
| Create | Admin membuat user baru |
| Read | Admin melihat daftar user |
| Update | Admin mengedit data user dan assignment course |
| Delete | Admin menghapus user |

Snippet kode:

```php
// app/Http/Controllers/Admin/UserController.php
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', 'string', 'min:8'],
        'role' => ['required', Rule::in(['student', 'tutor', 'admin'])],
        'mentor_course_ids' => ['nullable', 'array'],
        'mentor_course_ids.*' => ['integer', 'exists:courses,id'],
    ]);

    $roles = User::adminRoleIds();

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
        'role_id' => $roles[$validated['role']] ?? 1,
    ]);

    TutorCourseResolver::sync($user, $this->mentorCourseIdsFrom($validated));

    return redirect()->route('admin.users')->with('success', 'Pengguna berhasil ditambahkan.');
}
```

Penjelasan:

Kode di atas menunjukkan proses create user oleh admin. Data divalidasi terlebih dahulu, password di-hash, lalu role user ditentukan. Jika user adalah tutor, maka course yang diajar disimpan melalui `TutorCourseResolver::sync()`.

Screenshot yang perlu diambil:

- Form tambah user admin.
- Field role saat memilih tutor.
- Checklist/dropdown course tutor.
- Daftar user setelah tutor berhasil dibuat.

### 5.3 Manajemen Jadwal oleh Admin

Admin menjadi pengendali utama seluruh jadwal. Semua data tersimpan pada tabel `schedules`, tetapi tidak semua tipe ditampilkan kepada semua role. Field `audience` menentukan target jadwal agar tutor dan siswa hanya membaca agenda yang relevan.

| Tipe | Dibuat Admin | Tampil di Tutor | Tampil di Siswa | Link yang Digunakan |
| --- | --- | --- | --- | --- |
| `live` | Ya | Ya | Ya | Meeting link |
| `consultation` | Ya | Ya | Ya | Meeting link |
| `deadline` | Ya | Ya | Tidak | Tidak ada, pengingat upload materi tutor |
| `review` | Ya | Ya | Tidak | Tidak ada, pengingat review pekerjaan siswa |
| `tryout` | Ya | Tidak | Ya | Action link platform tryout |
| `student_deadline` | Dibaca, diedit, atau dihapus admin jika dibuat tutor | Tidak tampil di kalender mengajar | Ya | Action link form pengumpulan |

Admin juga dapat membaca, mengubah, dan menghapus jadwal yang dibuat tutor. Dengan begitu, jadwal tetap dapat dimonitor dari satu halaman admin tanpa mencampurkan agenda internal tutor dengan agenda siswa.

Flow:

1. Admin membuka halaman `Admin > Jadwal`.
2. Admin klik tambah jadwal.
3. Admin memilih course.
4. Admin memilih tipe jadwal.
5. Admin memilih tutor yang mengajar course tersebut, kecuali untuk tipe `tryout`.
6. Admin menentukan tanggal dan jam.
7. Jika tipenya `live` atau `consultation`, admin dapat mengisi meeting link.
8. Jika tipenya `tryout`, admin wajib mengisi action link menuju platform eksternal.
9. Sistem menyimpan jadwal dan menentukan `audience` secara otomatis.
10. Sistem mengirim notifikasi ke siswa aktif hanya jika jadwal memang ditujukan untuk siswa.
11. Jika admin menghapus jadwal, row yang sama hilang dari seluruh role yang sebelumnya dapat melihatnya.

CRUD:

| Aksi | Implementasi |
| --- | --- |
| Create | Admin membuat live class, konsultasi, deadline tutor, review, atau tryout |
| Read | Admin membaca seluruh jadwal, termasuk jadwal yang dibuat tutor |
| Update | Admin mengubah jadwal dan link sesuai tipe |
| Delete | Admin menghapus jadwal dari sumber data utama sehingga hilang dari role target |

Snippet pembatasan tipe jadwal:

```php
// app/Models/Schedule.php
public const ADMIN_CREATABLE_TYPES = [
    self::TYPE_LIVE,
    self::TYPE_CONSULTATION,
    self::TYPE_TUTOR_DEADLINE,
    self::TYPE_REVIEW,
    self::TYPE_TRYOUT,
];

public static function audienceForType(?string $type): string
{
    return match ($type) {
        self::TYPE_TUTOR_DEADLINE, self::TYPE_REVIEW => self::AUDIENCE_TUTOR,
        self::TYPE_STUDENT_DEADLINE, self::TYPE_TRYOUT => self::AUDIENCE_STUDENT,
        default => self::AUDIENCE_SHARED,
    };
}
```

Penjelasan:

Konstanta model menjadi aturan pusat. Live class dan konsultasi memiliki audiens `shared`, deadline tutor dan review memiliki audiens `tutor`, sedangkan deadline tugas siswa dan tryout memiliki audiens `student`.

Screenshot yang perlu diambil:

- Halaman admin schedule list.
- Modal tambah jadwal admin dengan dropdown tipe.
- Kalender admin yang menampilkan seluruh tipe jadwal.
- Form admin tipe `tryout` dengan action link.
- Tampilan live class yang sama pada halaman tutor dan siswa.
- Deadline tutor yang tampil di tutor tetapi tidak tampil di siswa.
- Tryout yang tampil di siswa tetapi tidak tampil di tutor.

Snippet penyimpanan payload berdasarkan tipe:

```php
// app/Http/Controllers/Admin/ScheduleController.php
return [
    'course_id' => $courseId,
    'mentor_id' => $mentorId,
    'title' => $courseTitle,
    'type' => $type,
    'audience' => Schedule::audienceForType($type),
    'meeting_link' => Schedule::needsMeetingLink($type)
        && filled($validated['meeting_link'] ?? null)
            ? $validated['meeting_link']
            : null,
    'action_link' => Schedule::needsActionLink($type)
        && filled($validated['action_link'] ?? null)
            ? $validated['action_link']
            : null,
    'start_time' => $startTime,
    'end_time' => $endTime,
];
```

Penjelasan:

Meeting link hanya disimpan untuk `live` dan `consultation`. Action link hanya disimpan untuk `student_deadline` dan `tryout`. Tipe pengingat internal tutor tidak memiliki tombol sesi maupun link eksternal.

Snippet hapus jadwal dan sinkronisasi role target:

```php
// app/Http/Controllers/Admin/ScheduleController.php
public function destroy(Schedule $schedule): RedirectResponse
{
    $this->notifyStudentsAboutSchedule($schedule, 'deleted');
    $schedule->delete();

    return redirect()->route('admin.schedule')
        ->with('success', 'Jadwal kelas berhasil dihapus.');
}

private function notifyStudentsAboutSchedule(Schedule $schedule, string $event): void
{
    if (($schedule->audience ?: Schedule::audienceForType($schedule->type)) === Schedule::AUDIENCE_TUTOR) {
        return;
    }

    // Notifikasi hanya dikirim kepada siswa enrolled pada course terkait.
}
```

Penjelasan:

Admin menghapus row jadwal pada sumber data utama. Agenda langsung hilang dari role target. Notifikasi siswa hanya dibuat untuk jadwal `shared` atau `student`; deadline internal tutor dan review tidak dikirim kepada siswa.

Screenshot yang perlu diambil:

- Form admin saat memilih live class atau konsultasi.
- Form admin saat memilih deadline tutor atau review.
- Form admin saat memilih tryout.
- Jadwal deadline/review di tutor tanpa tombol mulai sesi.
- Jadwal tryout di siswa dengan tombol menuju platform tryout.

### 5.4 Review Materi oleh Admin

Admin bertugas melakukan validasi materi yang diupload tutor. Materi yang baru diupload berstatus `pending`. Setelah direview, admin dapat menyetujui atau menolak materi. Jika disetujui, siswa yang terdaftar pada course tersebut akan menerima notifikasi dan materi akan tampil di dashboard/course siswa.

Flow:

1. Tutor upload materi.
2. Sistem membuat row baru di tabel `materials` dengan `approval_status = pending`.
3. Admin membuka halaman review materi.
4. Admin melihat preview file atau link video.
5. Admin approve atau reject.
6. Jika approve, status berubah menjadi `approved`.
7. Siswa enrolled melihat materi tersebut.
8. Jika reject, status berubah menjadi `rejected` dan tutor menerima notifikasi.

CRUD:

| Aksi | Implementasi |
| --- | --- |
| Create | Tutor upload materi |
| Read | Admin membaca daftar materi pending |
| Update | Admin mengubah status menjadi approved/rejected |
| Delete | Tutor dapat menghapus materi dari course yang diajar |

Snippet kode:

```php
// app/Http/Controllers/Admin/ContentController.php
public function approve(int $content): RedirectResponse
{
    return $this->updateApprovalStatus($content, 'approved', 'Konten berhasil disetujui.');
}

public function reject(Request $request, int $content): RedirectResponse
{
    $validated = $request->validate([
        'comment' => ['nullable', 'string', 'max:1000'],
    ]);

    return $this->updateApprovalStatus(
        $content,
        'rejected',
        'Konten berhasil ditolak.',
        $validated['comment'] ?? null
    );
}
```

Penjelasan:

Admin tidak membuat materi, tetapi melakukan update status materi. Fungsi approve dan reject memanggil method yang sama, yaitu `updateApprovalStatus()`, sehingga proses review terpusat.

Screenshot yang perlu diambil:

- Halaman admin review materi.
- Modal preview materi PDF/DOC/PPT/video.
- Tombol approve.
- Tombol reject dan field komentar.
- Notifikasi tutor setelah materi direview.

## 6. Core Feature dan Flow Tutor

### 6.1 Dashboard Tutor

Dashboard tutor menampilkan ringkasan kelas aktif, jadwal hari ini, materi terbaru, notifikasi, dan riwayat mengajar. Data yang tampil disaring berdasarkan course yang ditugaskan kepada tutor.

Flow:

1. Tutor login.
2. Sistem membaca course dari `course_tutor`.
3. Dashboard menampilkan course yang diajar tutor.
4. Jadwal hari ini diambil dari tabel `schedules`.
5. Materi terbaru diambil dari tabel `materials`.
6. Notifikasi diambil dari tabel `notifications`.

Snippet controller:

```php
// app/Http/Controllers/Tutor/DashboardController.php
public function index(Request $request)
{
    $user = $request->user()->load('mentorCourse.category');
    $courseIds = $this->tutorCourseIds($user);

    $courses = Course::query()
        ->with('category')
        ->withCount(['materials', 'schedules'])
        ->whereIn('id', $courseIds)
        ->orderBy('title')
        ->get();

    $todaySchedules = Schedule::query()
        ->with('course:id,title')
        ->where('mentor_id', $user->id)
        ->whereIn('course_id', $courseIds)
        ->visibleToTutor()
        ->whereDate('start_time', Carbon::today('Asia/Jakarta')->toDateString())
        ->orderBy('start_time')
        ->get();

    return Inertia::render('Tutor/TutorDashboard', [
        'user' => $user,
        'tutorClasses' => $courses,
        'todaySchedule' => $todaySchedules,
        'teachingHistory' => $this->teachingHistoryQuery($user, $courseIds)->take(5)->get(),
        'notifications' => Notification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->take(3)
            ->get(),
        'stats' => [
            'activeClasses' => $courses->count(),
            'completedSessions' => $this->teachingHistoryQuery($user, $courseIds)->count(),
        ],
    ]);
}
```

Penjelasan:

Dashboard tutor mengambil semua data berdasarkan `$courseIds`, yaitu course yang ditugaskan ke tutor. Scope `visibleToTutor()` memastikan dashboard hanya menampilkan agenda mengajar dengan audiens `shared` atau `tutor`. Deadline tugas siswa tetap dikelola melalui panel khusus pada halaman jadwal, bukan card Jadwal Hari Ini. Jadwal hari ini memakai tanggal real dari timezone `Asia/Jakarta`, bukan data dummy.

Snippet tampilan:

```jsx
// resources/js/Pages/Tutor/TutorDashboard.jsx
{todaySchedule.length === 0 ? (
  <p>Jadwal akan muncul otomatis saat ada sesi pada tanggal hari ini.</p>
) : (
  todaySchedule.map((item) => {
    const completed = item.status === "completed"
      || new Date(item.end_time).getTime() <= currentTime.getTime();

    return (
      <div key={item.id}>
        <p>{item.time}</p>
        <h4>{item.course}</h4>
        <span>{completed ? "Selesai" : item.status}</span>
      </div>
    );
  })
)}
```

Penjelasan:

Tampilan dashboard tutor membaca props `todaySchedule`. Jika tidak ada jadwal pada tanggal hari ini, halaman menampilkan empty state agar tutor tahu tidak ada agenda mengajar. Jika waktu berakhir sudah lewat, label berubah menjadi `Selesai` berdasarkan clock aktual sehingga tidak lagi menampilkan status `Akan Datang`.

Screenshot yang perlu diambil:

- Dashboard tutor.
- Card kelas aktif.
- Jadwal hari ini.
- Jadwal hari ini yang waktunya sudah lewat dengan label Selesai.
- Notifikasi tutor.
- Riwayat mengajar.

### 6.2 Jadwal Tutor

Tutor melihat kalender mengajar minggu berjalan dari Senin sampai Minggu. Kalender ini hanya memuat jadwal dengan audiens `shared` atau `tutor`, yaitu live class, konsultasi, deadline upload materi, dan review. Tutor dapat membuat live class, konsultasi, serta deadline tugas siswa.

Deadline tugas siswa tidak dimasukkan ke kalender mengajar tutor karena agenda tersebut ditujukan kepada siswa. Agar tetap dapat dikelola, halaman `/tutor/schedule` memiliki panel khusus **Deadline Tugas Siswa** untuk membuat, melihat, mengedit, dan menghapus deadline.

Flow jadwal tutor:

1. Tutor membuka halaman `Tutor > Jadwal`.
2. Sistem membaca `schedules` berdasarkan `mentor_id`, course assignment tutor, dan scope `visibleToTutor()`.
3. Kalender menampilkan live class, konsultasi, deadline tutor, dan review dengan warna berbeda.
4. Tutor dapat membuat live class atau konsultasi untuk dirinya dan siswa enrolled.
5. Tutor dapat menambahkan atau memperbarui meeting link sebelum waktu sesi berakhir.
6. Tutor dapat klik mulai sesi jika meeting link tersedia dan waktu sesi belum berakhir.
7. Tutor dapat membuat deadline tugas siswa melalui panel khusus.
8. Saat membuat deadline tugas siswa, tutor wajib menentukan tanggal, satu jam batas akhir, dan link form pengumpulan.
9. Tutor dapat mengedit atau menghapus deadline tugas siswa dari panel tersebut.
10. Jika sesi atau deadline sudah lewat, link tidak dapat digunakan lagi.

CRUD:

| Aksi | Implementasi |
| --- | --- |
| Create | Tutor membuat live class, konsultasi, dan deadline tugas siswa |
| Read | Tutor membaca agenda mengajar serta panel deadline siswa |
| Update | Tutor memperbarui meeting link sebelum sesi berakhir dan mengedit deadline siswa |
| Delete | Tutor menghapus deadline tugas siswa yang dibuatnya |

Snippet tipe yang boleh dibuat tutor dan validasi deadline siswa:

```php
// app/Models/Schedule.php
public const TUTOR_CREATABLE_TYPES = [
    self::TYPE_LIVE,
    self::TYPE_CONSULTATION,
    self::TYPE_STUDENT_DEADLINE,
];

// app/Http/Controllers/Tutor/ScheduleController.php
$validated = $request->validate([
    'course_id' => ['required', 'integer', Rule::in($courseIds)],
    'title' => ['required', 'string', 'max:255'],
    'type' => ['required', Rule::in(Schedule::TUTOR_CREATABLE_TYPES)],
    'schedule_date' => ['required', 'date'],
    'start_time' => ['nullable', 'required_unless:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i'],
    'end_time' => ['nullable', 'required_unless:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i', 'after:start_time'],
    'deadline_time' => ['nullable', 'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i'],
    'meeting_link' => ['nullable', 'url', 'max:1024'],
    'action_link' => ['nullable', 'url', 'max:1024', 'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE],
]);
```

Penjelasan:

Tutor hanya dapat membuat jadwal untuk course yang ditugaskan admin. Validasi `required_if` memastikan deadline tugas siswa tidak pernah tersimpan tanpa jam batas akhir dan link form pengumpulan.

Screenshot yang perlu diambil:

- Halaman tutor schedule.
- Modal tambah jadwal dengan pilihan live class, konsultasi, dan deadline tugas siswa.
- Jadwal live class yang dibuat tutor.
- Panel Deadline Tugas Siswa.
- Form deadline siswa dengan tanggal, jam deadline, dan link pengumpulan.
- Tombol edit dan hapus deadline siswa.
- Jadwal admin dengan tipe deadline tutor dan review.

Snippet start session:

```php
// app/Http/Controllers/Tutor/ScheduleController.php
public function startSession(Request $request, Schedule $schedule)
{
    abort_unless((int) $schedule->mentor_id === (int) $request->user()->id, 403);

    if (! in_array($this->eventType($schedule), Schedule::MEETING_TYPES, true)) {
        return back()->withErrors([
            'schedule' => 'Jadwal ini hanya berupa pengingat dan tidak bisa dimulai sebagai sesi meeting.',
        ]);
    }

    if (blank($schedule->meeting_link)) {
        return back()->withErrors([
            'meeting_link' => 'Tambahkan link meeting terlebih dahulu sebelum memulai sesi.',
        ]);
    }

    if ($this->hasEnded($schedule)) {
        return back()->withErrors([
            'schedule' => 'Sesi ini sudah berakhir dan tidak bisa dimulai ulang.',
        ]);
    }

    if (! $schedule->started_at) {
        $schedule->update(['started_at' => Carbon::now('Asia/Jakarta')->format('Y-m-d H:i:s')]);
    }

    return redirect()->away($schedule->meeting_link);
}
```

Penjelasan:

Kode ini memastikan hanya live class dan konsultasi yang dapat dimulai sebagai sesi meeting. Sesi tanpa link atau sesi yang waktunya sudah berakhir ditolak. Sistem mencatat `started_at` sebagai bukti tutor membuka sesi.

Screenshot yang perlu diambil:

- Jadwal live class tanpa link.
- Modal tambah link meeting.
- Tombol mulai sesi setelah link tersedia.
- Jadwal deadline/review tanpa tombol mulai sesi.
- Jadwal yang sudah berakhir dengan tombol nonaktif bertuliskan `Sudah Berakhir`.

### 6.3 Upload Materi Tutor

Tutor dapat upload materi dalam tiga bentuk:

- Video YouTube.
- Modul file PDF/DOC/DOCX/PPT/PPTX.
- Bank soal file PDF/DOC/DOCX/PPT/PPTX.

Semua materi yang diupload tutor masuk ke status `pending` dan harus direview admin.

Flow:

1. Tutor membuka halaman upload materi.
2. Tutor memilih course.
3. Tutor mengisi judul dan deskripsi.
4. Tutor menginput link YouTube atau upload file.
5. Sistem menyimpan file ke storage permanen.
6. Sistem membuat row di tabel `materials`.
7. Admin menerima notifikasi review.
8. Setelah admin approve, siswa bisa melihat materi.

Snippet kode:

```php
// app/Http/Controllers/Tutor/MaterialController.php
$validated = $request->validate([
    'course_id' => ['required', 'integer', Rule::in($courseIds)],
    'title' => ['required', 'string', 'max:255'],
    'description' => ['nullable', 'string', 'max:5000'],
    'youtube_url' => ['nullable', 'url', 'max:1024'],
    'module_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:51200'],
    'quiz_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:51200'],
]);
```

Penjelasan:

Validasi ini memastikan tutor hanya bisa upload materi untuk course yang diajar, dan file yang diterima hanya format dokumen yang sesuai kebutuhan pembelajaran.

Screenshot yang perlu diambil:

- Form upload materi tutor.
- Pilihan course.
- Upload modul file.
- Upload bank soal.
- Input link YouTube.

Snippet penyimpanan file:

```php
// app/Http/Controllers/Tutor/MaterialController.php
private function storeMaterialFile($file, string $directory): array
{
    $disk = config('filesystems.materials_disk', 'public');
    $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
    $filename = Str::uuid().'-'.Str::slug($originalName ?: 'materi').'.'.$extension;
    $path = $file->storeAs($directory.'/'.now()->format('Y/m'), $filename, $disk);

    return [
        'disk' => $disk,
        'path' => $path,
        'url' => Material::publicUrlFor($disk, $path),
    ];
}
```

Penjelasan:

File disimpan ke disk yang dikonfigurasi pada `MATERIALS_FILESYSTEM_DISK`. Pada deployment, disk ini dapat diarahkan ke Cloudflare R2 agar file tersimpan permanen.

Screenshot yang perlu diambil:

- `.env` bagian konfigurasi storage, jika diperbolehkan tanpa menampilkan secret.
- File berhasil muncul di daftar materi tutor.
- Status materi `Menunggu Review`.

### 6.4 Monitor Kelas

Tutor dapat melihat daftar kelas yang diajar, daftar siswa pada course, progress siswa, kehadiran, dan materi yang tersedia di kelas tersebut.

Flow:

1. Tutor membuka monitor kelas.
2. Sistem membaca course yang diajar tutor.
3. Tutor memilih course.
4. Sistem menampilkan siswa enrolled pada course tersebut.
5. Sistem menampilkan materi terkait course.
6. Tutor dapat melihat/download/delete materi sesuai hak akses.
7. Tutor dapat membuka profil siswa.

Screenshot yang perlu diambil:

- Halaman monitor kelas.
- Daftar course di sidebar.
- Daftar siswa.
- Filter/sort daftar siswa.
- Daftar materi kelas.
- Menu lihat profil siswa.

### 6.5 Profil, Settings, dan Password Tutor

Tutor dapat melihat profil dalam mode read-only. Jika menekan tombol edit profil, field menjadi editable. Email tidak dapat diedit. Nomor telepon hanya boleh angka agar mudah dicopy dari database.

Flow:

1. Tutor membuka halaman profil.
2. Profil tampil read-only.
3. Tutor klik edit profil.
4. Tutor mengubah nama, nomor telepon, gender, pendidikan, bio, dan foto.
5. Sistem menyimpan perubahan ke database.
6. Foto profil disimpan ke storage permanen.

Snippet kode:

```php
// app/Http/Controllers/Tutor/DashboardController.php
if ($request->has('phone')) {
    $phone = preg_replace('/\D+/', '', (string) $request->input('phone'));
    $request->merge([
        'phone' => $phone !== '' ? $phone : null,
    ]);
}

$validated = $request->validate([
    'name' => ['required', 'string', 'max:255'],
    'phone' => ['nullable', 'string', 'max:20', 'regex:/^\d+$/'],
    'gender' => ['nullable', Rule::in(['male', 'female'])],
    'education' => ['nullable', Rule::in(['SMA', 'S1', 'S2', 'S3'])],
    'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
]);
```

Penjelasan:

Nomor telepon dibersihkan dari karakter selain angka. Dengan begitu format yang tersimpan adalah contoh `088888888888`, bukan `0888-8888-8888`.

Screenshot yang perlu diambil:

- Halaman profil tutor read-only.
- Tombol edit profil.
- Field nomor telepon dengan keterangan format.
- Dropdown gender.
- Dropdown pendidikan terakhir.
- Foto profil setelah upload.

## 7. Core Feature dan Flow Siswa

### 7.1 Dashboard Siswa

Dashboard siswa menampilkan course aktif, jadwal minggu ini, materi terbaru, notifikasi, dan progress belajar. Data yang tampil berdasarkan enrollment siswa.

Flow:

1. Siswa login.
2. Sistem membaca enrollment aktif siswa.
3. Dashboard menampilkan course aktif.
4. Sistem mengambil jadwal dari course yang diikuti siswa.
5. Sistem mengambil materi approved dari course tersebut.
6. Siswa dapat membuka course learn.

Screenshot yang perlu diambil:

- Dashboard siswa.
- Course aktif.
- Jadwal minggu ini.
- Materi terbaru.
- Notifikasi siswa.

### 7.2 Jadwal Siswa

Jadwal siswa menggunakan tabel `schedules` yang sama, tetapi hanya membaca row dengan audiens `shared` atau `student`. Siswa tidak melihat deadline upload materi maupun agenda review milik tutor.

| Tipe yang Terlihat Siswa | Sumber | Aksi Siswa |
| --- | --- | --- |
| Live class | Admin atau tutor | Klik join meeting sebelum sesi berakhir |
| Konsultasi | Admin atau tutor | Klik join konsultasi sebelum sesi berakhir |
| Deadline tugas | Tutor | Klik link form pengumpulan sebelum jam deadline |
| Tryout | Admin | Klik link platform tryout sebelum jadwal berakhir |

Flow:

1. Admin atau tutor membuat jadwal sesuai kewenangannya.
2. Sistem menyimpan jadwal beserta `type` dan `audience`.
3. Siswa membuka halaman jadwal.
4. Sistem mengambil course aktif siswa dari `enrollments`.
5. Sistem mengambil jadwal course aktif melalui scope `visibleToStudent()`.
6. Live class dan konsultasi menggunakan `meeting_link`.
7. Deadline tugas dan tryout menggunakan `action_link`.
8. Deadline tugas ditampilkan sebagai satu jam batas akhir, bukan rentang jam mulai-selesai.
9. Setelah `end_time` terlewati, tombol aksi tidak lagi dapat diklik.

Snippet kode:

```php
// routes/web.php - studentScheduleWeekPayload()
$scheduleEvents = Schedule::with(['course.category', 'mentor'])
    ->whereIn('course_id', $courseIds)
    ->visibleToStudent()
    ->whereBetween('start_time', [$weekStart, $weekEnd])
    ->orderBy('start_time')
    ->get();

// app/Models/Schedule.php
public function scopeVisibleToStudent(Builder $query): Builder
{
    return $query->whereIn('audience', [
        self::AUDIENCE_SHARED,
        self::AUDIENCE_STUDENT,
    ]);
}
```

Snippet penguncian tombol setelah jadwal berakhir:

```jsx
// resources/js/Pages/StudentSchedules.jsx
const isScheduleCompleted = (schedule, now = new Date()) => {
  if (schedule?.status === 'completed') return true;

  const endTime = new Date(schedule?.end_time);
  return !Number.isNaN(endTime.getTime()) && endTime.getTime() <= now.getTime();
};

const targetLink = completed
  ? null
  : (type.needsMeeting ? schedule.meeting_link : schedule.action_link);
```

Penjelasan:

Jadwal siswa tidak dibuat manual. Scope `visibleToStudent()` mencegah agenda internal tutor ikut tampil. Karena admin dan tutor menyimpan jadwal ke sumber data yang sama, perubahan atau penghapusan langsung terbaca pada halaman siswa. UI memeriksa `end_time` berdasarkan jam aktual agar siswa tidak bisa membuka meeting, form tugas, atau tryout yang sudah berakhir.

Screenshot yang perlu diambil:

- Halaman jadwal siswa.
- Live class yang sama dengan jadwal tutor.
- Tombol join meeting ketika link tersedia.
- Deadline tugas dengan satu jam deadline dan tombol `Kumpulkan Tugas`.
- Tryout dengan tombol menuju platform eksternal.
- Sesi yang sudah lewat dengan tombol nonaktif `Jadwal sudah berakhir`.

### 7.3 Akses Materi Course

Siswa hanya dapat melihat materi yang sudah disetujui admin. Materi yang masih pending atau rejected tidak tampil di sisi siswa.

Flow:

1. Tutor upload materi.
2. Admin approve materi.
3. Siswa membuka dashboard atau course learn.
4. Sistem mengambil materi dengan `approval_status = approved`.
5. Siswa melihat preview atau download materi.

Snippet kode:

```php
// routes/web.php
$materials = Material::where('course_id', $course->id)
    ->where('approval_status', 'approved')
    ->orderBy('created_at')
    ->get();

return Inertia::render('CourseLearn', [
    'user' => $user,
    'course' => $course,
    'materials' => $materials,
    'enrollment' => $enrollment,
    'enrollments' => $enrollments,
]);
```

Penjelasan:

Query ini menjadi filter utama agar siswa hanya melihat materi yang sudah lolos validasi admin.

Screenshot yang perlu diambil:

- Course learn siswa.
- Preview PDF.
- Preview DOC/PPT jika tersedia.
- Embed YouTube.
- Tombol download file.

### 7.4 Progress Belajar

Progress siswa dicatat melalui `ProgressController`. Ketika siswa membuka materi, sistem dapat menyimpan progress berdasarkan course dan material.

Snippet kode:

```php
// app/Http/Controllers/Student/ProgressController.php
$record = ProgressRecord::updateOrCreate(
    [
        'user_id' => $user->id,
        'course_id' => $validated['course_id'],
        'material_id' => $validated['material_id'] ?? null,
    ],
    [
        'percent' => $validated['percent'] ?? 0,
        'status' => $validated['status'] ?? 'started',
    ]
);
```

Penjelasan:

`updateOrCreate()` dipakai agar progress untuk kombinasi user, course, dan material tidak duplikat. Jika sudah ada, data diperbarui.

Screenshot yang perlu diambil:

- Progress belajar di dashboard/course siswa.
- Course dengan progress berubah setelah materi dibuka.

## 8. Business Process End-to-End

### 8.1 Proses Admin Membuat Tutor dan Menugaskan Course

1. Admin login.
2. Admin membuka menu pengguna.
3. Admin membuat akun tutor.
4. Admin memilih course yang akan diajar tutor.
5. Data tutor tersimpan di `users`.
6. Assignment course tersimpan di `course_tutor`.
7. Tutor login menggunakan akun yang dibuat admin.
8. Tutor hanya melihat course yang ditugaskan.

Output:

- Akun tutor aktif.
- Tutor memiliki daftar course.
- Course muncul di dashboard, upload materi, schedule, dan monitor kelas tutor.

### 8.2 Proses Jadwal dari Admin sampai Siswa

1. Admin membuka menu schedule dan memilih tipe agenda.
2. Sistem menetapkan audiens otomatis berdasarkan tipe jadwal.
3. Live class dan konsultasi disimpan sebagai `shared`, sehingga tampil pada tutor dan siswa enrolled.
4. Deadline upload materi dan review disimpan sebagai `tutor`, sehingga hanya tampil pada tutor.
5. Tryout disimpan sebagai `student`, sehingga hanya tampil pada siswa enrolled.
6. Admin tetap melihat seluruh jadwal untuk kebutuhan monitoring.
7. Admin dapat mengubah atau menghapus row jadwal, termasuk jadwal yang sebelumnya dibuat tutor.
8. Saat row dihapus admin, jadwal otomatis hilang dari halaman role target.

Output:

- Jadwal tersinkron tanpa mencampurkan agenda internal tutor dengan agenda siswa.
- Admin tetap menjadi pengendali utama jadwal.

### 8.3 Proses Tutor Memberikan Deadline Tugas kepada Siswa

1. Tutor membuka halaman `/tutor/schedule`.
2. Tutor membuka panel **Deadline Tugas Siswa**.
3. Tutor memilih course, judul tugas, tanggal, dan satu jam deadline.
4. Tutor wajib mengisi link form pengumpulan.
5. Sistem menyimpan jadwal dengan `type = student_deadline` dan `audience = student`.
6. Jadwal masuk ke siswa yang memiliki enrollment aktif pada course tersebut.
7. Tutor dapat mengedit atau menghapus deadline melalui panel khusus.
8. Admin dapat melihat, mengedit, dan menghapus deadline yang sama dari kalender admin.
9. Setelah jam deadline lewat, siswa tidak dapat membuka link pengumpulan lagi.

Output:

- Deadline tugas terpisah dari kalender mengajar tutor.
- Link pengumpulan wajib tersedia sejak deadline dibuat.
- Admin tetap dapat memonitor seluruh deadline tugas siswa.

### 8.4 Proses Upload Materi sampai Tampil di Siswa

1. Tutor upload materi.
2. Sistem menyimpan file ke storage.
3. Sistem membuat data materi di `materials` dengan status `pending`.
4. Admin membuka halaman review materi.
5. Admin melihat preview file.
6. Admin approve atau reject.
7. Jika approved, siswa yang enrolled menerima notifikasi.
8. Materi tampil di dashboard siswa dan halaman course learn.
9. Jika rejected, tutor menerima notifikasi dan materi tidak tampil di siswa.

Output:

- Materi terkontrol oleh admin.
- Siswa hanya melihat materi yang sudah valid.

### 8.5 Proses Live Class dan Konsultasi

1. Admin atau tutor membuat jadwal live class atau konsultasi.
2. Tutor menambahkan meeting link jika belum ada.
3. Siswa melihat link meeting pada jadwal course.
4. Selama waktu sesi belum berakhir, tutor dan siswa dapat menggunakan link meeting.
5. Tutor klik mulai sesi.
6. Sistem menolak sesi yang tidak memiliki link atau sudah melewati `end_time`.
7. Sistem menyimpan `started_at`.
8. Tutor diarahkan ke meeting link.
9. Setelah jadwal lewat, tombol sesi pada tutor dan siswa menjadi nonaktif.
10. Riwayat mengajar dapat digunakan sebagai data monitoring admin.

Output:

- Kehadiran tutor dapat dimonitor berdasarkan jadwal, meeting link, dan `started_at`.

## 9. CRUD Summary

| Modul | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Admin User | Tambah user | Daftar user | Edit user dan role | Hapus user |
| Admin Schedule | Tambah live, konsultasi, deadline tutor, review, tryout | Membaca seluruh jadwal lintas-role | Edit seluruh jadwal | Hapus jadwal untuk seluruh role target |
| Admin Content Review | - | Lihat materi pending | Approve/reject materi | - |
| Tutor Schedule | Tambah live class, konsultasi, deadline siswa | Lihat agenda mengajar dan panel deadline siswa | Edit meeting link dan deadline siswa | Hapus deadline siswa |
| Tutor Material | Upload materi | Lihat materi course | Status berubah oleh admin | Hapus materi |
| Tutor Profile | - | Lihat profil | Edit profil/password | - |
| Student Course | - | Lihat course aktif | Progress belajar | - |
| Student Material | - | Lihat/preview/download materi approved | Progress materi | - |

## 10. Tampilan yang Diimplementasikan

### Admin

- Admin dashboard.
- User management.
- Schedule list dan calendar.
- Content review.
- Tutor history.
- Settings.

### Tutor

- Tutor dashboard.
- Tutor schedule dengan dynamic week.
- Tutor upload material.
- Tutor monitor kelas.
- Tutor student profile.
- Tutor history.
- Tutor notifications.
- Tutor profile.
- Tutor settings.
- Tutor password.
- Mobile drawer.

### Siswa

- Student dashboard.
- Student schedule.
- Course learn.
- Material preview.
- Notifications.
- Progress belajar.

## 11. Checklist Screenshot untuk Laporan

### Admin

1. Login admin.
2. Dashboard admin.
3. Halaman users.
4. Modal tambah tutor dan assignment course.
5. Halaman admin schedule.
6. Modal tambah jadwal dengan tipe schedule.
7. Kalender admin dengan jadwal berwarna.
8. Form tryout admin dengan link platform eksternal.
9. Kalender admin yang menampilkan deadline siswa buatan tutor.
10. Halaman review materi.
11. Preview file/video di admin.
12. Tombol approve/reject materi.
13. Tutor history admin.

### Tutor

1. Login tutor.
2. Dashboard tutor.
3. Sidebar tutor versi desktop.
4. Mobile drawer tutor.
5. Halaman schedule tutor.
6. Jadwal live/konsultasi/deadline/review.
7. Modal tambah link meeting.
8. Tombol mulai sesi.
9. Tombol `Sudah Berakhir` pada sesi lewat.
10. Panel Deadline Tugas Siswa.
11. Form deadline siswa dengan link form wajib.
12. Tombol edit dan hapus deadline siswa.
13. Halaman upload materi.
14. Status materi pending/approved/rejected.
15. Monitor kelas.
16. Daftar siswa.
17. Profil siswa.
18. Profil tutor read-only.
19. Mode edit profil tutor.
20. Settings tutor.
21. Ubah password tutor.
22. Notifications tutor.

### Siswa

1. Login siswa.
2. Dashboard siswa.
3. Course aktif.
4. Jadwal siswa.
5. Tombol join meeting.
6. Deadline tugas dengan tombol kumpulkan sebelum jam berakhir.
7. Deadline tugas setelah berakhir dengan tombol nonaktif.
8. Tryout dengan tombol platform eksternal.
9. Course learn.
10. Preview YouTube.
11. Preview PDF/DOC/PPT.
12. Download materi.
13. Notifikasi materi baru.
14. Progress belajar.

## 12. Bukti Integrasi Database

Integrasi antar role dilakukan melalui tabel yang sama, bukan data dummy terpisah.

| Proses | Tabel Sumber | Role yang Membaca |
| --- | --- | --- |
| Assignment tutor | `course_tutor` | Admin, tutor |
| Jadwal | `schedules` | Admin membaca seluruh row; tutor dan siswa membaca row sesuai `audience` |
| Materi | `materials` | Tutor, admin, siswa |
| Enrollment | `enrollments` | Admin, tutor, siswa |
| Notifikasi | `notifications` | Admin, tutor, siswa |
| Progress | `progress_records` | Siswa, tutor |

Dengan alur ini, perubahan data di satu role akan berdampak ke role lain sesuai business process. Contohnya, ketika admin menghapus jadwal dari tabel `schedules`, data tersebut otomatis tidak tampil lagi pada role target karena admin, tutor, dan siswa membaca sumber data yang sama dengan filter audiens yang sesuai.

## 13. Kelengkapan Fitur Berdasarkan Sidebar

Bagian ini melengkapi dokumentasi berdasarkan seluruh fitur yang muncul di sidebar atau navigasi utama role admin, tutor, dan siswa. Tujuannya agar laporan tidak hanya menjelaskan fitur inti, tetapi juga semua menu yang dapat diakses pengguna.

### 13.1 Fitur Sidebar Admin

| Menu | Route / Halaman | Controller / File | Proses Utama | Screenshot yang Diambil |
| --- | --- | --- | --- | --- |
| Statistik Pengguna | `/admin/dashboard` | `AdminDashboardController@index`, `resources/js/Pages/Admin/Dashboard.jsx` | Membaca jumlah user, distribusi role, pertumbuhan user, dan aktivitas terbaru | Dashboard admin berisi kartu statistik, grafik pertumbuhan, distribusi pengguna |
| Statistik Transaksi | `/admin/transaction-stats` | `Admin/TransactionController@stats`, `Admin/TransactionStats.jsx` | Membaca transaksi berhasil, revenue bulanan, metode pembayaran, dan success rate | Grafik revenue bulanan, ringkasan transaksi, daftar transaksi terbaru |
| Laporan | `/admin/reports/export` | `Admin/ReportController@export`, `Admin/ReportsExport.jsx` | Menampilkan riwayat export laporan dari tabel `report_exports` | Halaman laporan dengan filter tanggal dan daftar file export |
| Pengguna | `/admin/users` | `Admin/UserController`, `Admin/Users.jsx` | CRUD admin/siswa/tutor dan assignment tutor ke course | Tabel user, modal tambah/edit user, checkbox course tutor |
| Transaksi | `/admin/transactions` | `Admin/TransactionController@index/show/export`, `Admin/Transactions.jsx` | Monitoring transaksi, filter status, detail transaksi, export CSV | Tabel transaksi, filter status, halaman detail transaksi |
| Paket | `/admin/packages` | `Admin/PackageController`, `Admin/Packages.jsx` | CRUD paket belajar dan relasi paket-course | Kartu daftar paket, modal tambah/edit paket, pilihan course dalam paket |
| Course | `/admin/courses` | `Admin/CourseController@index`, `Admin/Courses.jsx` | Monitoring course, siswa terdaftar, tutor pengajar, paket, dan materi | Halaman course overview dengan detail siswa/tutor/materi |
| Review Materi | `/admin/content` | `Admin/ContentController@index/approve/reject`, `Admin/Content.jsx` | Review materi tutor, preview file/video, approve/reject | List materi pending, modal preview embed, tombol setujui/tolak |
| Jadwal | `/admin/schedule` | `Admin/ScheduleController`, `Admin/Schedule.jsx` | CRUD seluruh jadwal; membuat live, konsultasi, deadline tutor, review, tryout; memonitor deadline siswa dari tutor | Kalender admin, modal tambah jadwal, pilihan tipe jadwal |
| Riwayat Tutor | `/admin/tutor-history` | `Admin/TutorHistoryController@index`, `Admin/TutorHistory.jsx` | Monitoring riwayat tutor mengajar berdasarkan sesi yang benar-benar dimulai | Ringkasan tutor, total sesi, tabel riwayat mengajar |
| Notifikasi | `/admin/notifications` | `Admin/NotificationController`, `Admin/Notifications.jsx` | Melihat notifikasi sistem dan menandai sudah dibaca | Dropdown notifikasi dan halaman semua notifikasi |

Snippet sidebar admin:

```jsx
// resources/js/Layouts/AdminLayout.jsx
const navigationGroups = [
    {
        title: 'Overview',
        items: [
            { label: 'Statistik Pengguna', href: route('admin.dashboard'), icon: LayoutDashboard },
            { label: 'Statistik Transaksi', href: route('admin.transaction-stats'), icon: TrendingUp },
            { label: 'Laporan', href: route('admin.reports.export'), icon: FileText },
        ],
    },
    {
        title: 'Operasional',
        items: [
            { label: 'Pengguna', href: route('admin.users'), icon: Users },
            { label: 'Transaksi', href: route('admin.transactions'), icon: ReceiptText },
            { label: 'Paket', href: route('admin.packages'), icon: Package },
            { label: 'Course', href: route('admin.courses'), icon: BookOpen },
            { label: 'Review Materi', href: route('admin.content'), icon: ClipboardCheck },
            { label: 'Jadwal', href: route('admin.schedule'), icon: Calendar },
            { label: 'Riwayat Tutor', href: route('admin.tutor-history'), icon: History },
        ],
    },
];
```

Penjelasan: sidebar admin menjadi pintu masuk seluruh fitur operasional. Setiap item diarahkan ke route admin yang dilindungi middleware `auth`, `verified`, dan `admin`.

Screenshot untuk snippet ini: ambil sidebar admin dalam keadaan terbuka, lalu tandai menu Overview dan Operasional.

Snippet route admin:

```php
// routes/web.php
Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::match(['post', 'put'], '/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/packages', [PackageController::class, 'index'])->name('packages');
        Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
        Route::put('/packages/{package}', [PackageController::class, 'update'])->name('packages.update');
        Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->name('packages.destroy');
        Route::get('/courses', [CourseController::class, 'index'])->name('courses');
        Route::get('/content', [ContentController::class, 'index'])->name('content');
        Route::post('/content/{content}/approve', [ContentController::class, 'approve'])->name('content.approve');
        Route::post('/content/{content}/reject', [ContentController::class, 'reject'])->name('content.reject');
        Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');
        Route::post('/schedule', [ScheduleController::class, 'store'])->name('schedule.store');
        Route::put('/schedule/{schedule}', [ScheduleController::class, 'update'])->name('schedule.update');
        Route::delete('/schedule/{schedule}', [ScheduleController::class, 'destroy'])->name('schedule.destroy');
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions');
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
        Route::get('/transaction-stats', [TransactionController::class, 'stats'])->name('transaction-stats');
        Route::get('/tutor-history', [TutorHistoryController::class, 'index'])->name('tutor-history');
    });
```

Penjelasan: route admin dipisah dengan prefix `/admin`, sehingga controller admin tidak konflik dengan controller tutor atau siswa yang memiliki nama fitur serupa seperti schedule.

Screenshot untuk snippet ini: screenshot halaman route yang berbeda, misalnya `/admin/schedule`, `/admin/transactions`, dan `/admin/tutor-history`.

### 13.2 Statistik Pengguna Admin

Fitur ini dipakai admin untuk melihat kondisi user secara umum. Data dihitung dari tabel `users` dan role pengguna, lalu dikirim ke halaman Inertia.

Snippet kode:

```php
// app/Http/Controllers/AdminDashboardController.php
public function index()
{
    $dashboardData = Cache::remember(
        self::DASHBOARD_CACHE_KEY,
        self::DASHBOARD_CACHE_TTL_SECONDS,
        fn () => $this->dashboardData(),
    );

    return Inertia::render('Admin/Dashboard', [
        ...$dashboardData,
    ]);
}
```

Penjelasan: data dashboard di-cache selama beberapa menit agar query statistik tidak terlalu sering dijalankan ketika admin membuka dashboard.

Screenshot yang diambil:

1. Kartu Total Pengguna, Registrasi Baru, Pengguna Aktif, Tidak Aktif.
2. Grafik pertumbuhan pengguna.
3. Distribusi siswa, tutor, dan admin.

### 13.3 Statistik Transaksi, Transaksi, dan Laporan Admin

Fitur transaksi admin terdiri dari tiga bagian: statistik transaksi, daftar transaksi, dan laporan export. Admin bisa melihat performa pembayaran, memfilter transaksi, membuka detail, dan mengunduh CSV.

Snippet statistik transaksi:

```php
// app/Http/Controllers/Admin/TransactionController.php
public function stats()
{
    $rows = DB::table('transactions')
        ->selectRaw("date_trunc('month', created_at) as month, COALESCE(SUM(CASE WHEN payment_status::text IN ('paid', 'success') THEN amount ELSE 0 END), 0) as total")
        ->groupBy('month')
        ->orderBy('month')
        ->get();

    return Inertia::render('Admin/TransactionStats', [
        'summary' => [
            'totalRevenue' => $totalRevenue,
            'averageTransaction' => round($averageTransaction, 2),
            'transactionGrowth' => round($growth, 2),
        ],
        'paymentMethods' => $paymentMethods,
        'recentTransactions' => $recentTransactions,
    ]);
}
```

Penjelasan: controller mengelompokkan transaksi per bulan, menghitung revenue, rata-rata transaksi, growth, metode pembayaran, dan transaksi terbaru.

Screenshot yang diambil: halaman Statistik Transaksi berisi chart revenue, metode pembayaran, success rate, dan recent transactions.

Snippet daftar dan export transaksi:

```php
// app/Http/Controllers/Admin/TransactionController.php
public function index(Request $request)
{
    $status = $request->string('status')->toString();

    $transactions = DB::table('transactions')
        ->leftJoin('users', 'transactions.user_id', 'users.id')
        ->leftJoin('courses', 'transactions.course_id', 'courses.id')
        ->leftJoin('packages', 'transactions.package_id', 'packages.id')
        ->when($status === 'success', fn ($query) => $query->whereIn('transactions.payment_status', ['paid', 'success']))
        ->when($status === 'pending', fn ($query) => $query->where('transactions.payment_status', 'pending'))
        ->orderBy('transactions.created_at', 'desc')
        ->paginate(20);

    return Inertia::render('Admin/Transactions', [
        'transactions' => $transactions,
        'stats' => $stats,
        'filters' => $filters,
    ]);
}

public function export(Request $request): StreamedResponse
{
    DB::table('report_exports')->insert([
        'user_id' => $request->user()?->id,
        'type' => 'Transaksi',
        'title' => 'Export Transaksi',
        'file_name' => $fileName,
        'row_count' => $transactions->count(),
    ]);

    return response()->streamDownload(function () use ($transactions) {
        $output = fopen('php://output', 'w');
        fputcsv($output, ['Invoice', 'Siswa', 'Course', 'Jumlah', 'Metode', 'Status', 'Tanggal']);

        foreach ($transactions as $transaction) {
            fputcsv($output, [
                $transaction->invoice_number,
                $transaction->student ?? '-',
                $transaction->course ?? ($transaction->package_name ? 'Paket: '.$transaction->package_name : '-'),
                (float) $transaction->amount,
                $transaction->payment_method ?? '-',
                $transaction->payment_status,
                Carbon::parse($transaction->created_at)->format('Y-m-d H:i'),
            ]);
        }

        fclose($output);
    }, $fileName);
}
```

Penjelasan: daftar transaksi mengambil data siswa, course, paket, nominal, metode pembayaran, dan status. Saat export, sistem juga menyimpan metadata laporan ke tabel `report_exports`.

Screenshot yang diambil:

1. Tabel transaksi dengan filter status.
2. Halaman detail transaksi.
3. Halaman Laporan setelah export transaksi dibuat.

### 13.4 Paket dan Course Admin

Admin mengelola paket belajar yang dibeli siswa. Paket dapat berisi beberapa course UTBK. Course overview digunakan untuk memonitor siswa, tutor, materi, dan paket yang terkait.

Snippet CRUD paket:

```php
// app/Http/Controllers/Admin/PackageController.php
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'price' => ['required', 'numeric', 'min:0'],
        'description' => ['nullable', 'string'],
        'features' => ['nullable', 'array'],
        'course_ids' => ['nullable', 'array'],
        'course_ids.*' => ['integer', 'exists:courses,id'],
        'popular' => ['boolean'],
    ]);

    $package = Package::create([
        'name' => $validated['name'],
        'price' => $validated['price'],
        'description' => $validated['description'] ?? null,
        'features' => $validated['features'] ?? [],
    ]);

    $package->courses()->sync($validated['course_ids'] ?? []);

    return redirect()->route('admin.packages')->with('success', 'Paket berhasil ditambahkan.');
}
```

Penjelasan: setelah paket dibuat, relasi course disimpan melalui tabel pivot `package_course`.

Screenshot yang diambil: modal tambah paket, input harga, daftar fitur, dan checkbox course dalam paket.

Snippet course overview:

```php
// app/Http/Controllers/Admin/CourseController.php
$students = DB::table('enrollments')
    ->join('users', 'enrollments.user_id', '=', 'users.id')
    ->where('enrollments.course_id', $course->id)
    ->get();

$mentors = DB::table('users')
    ->leftJoin('course_tutor', 'users.id', '=', 'course_tutor.tutor_id')
    ->where('course_tutor.course_id', $course->id)
    ->distinct()
    ->get();

$contents = DB::table('materials')
    ->where('materials.course_id', $course->id)
    ->orderByDesc('materials.created_at')
    ->get();
```

Penjelasan: halaman course admin menggabungkan data enrollment siswa, tutor pengajar, dan materi yang sudah diupload untuk course tersebut.

Screenshot yang diambil: satu kartu course yang terbuka, menampilkan daftar siswa, tutor, paket, dan materi.

### 13.5 Review Materi Admin

Admin bertugas memvalidasi materi sebelum tampil ke siswa. Tutor boleh upload materi, tetapi siswa hanya melihat materi yang statusnya `approved`.

Snippet kode:

```php
// app/Http/Controllers/Admin/ContentController.php
public function approve(int $content): RedirectResponse
{
    return $this->updateApprovalStatus($content, 'approved', 'Konten berhasil disetujui.');
}

public function reject(Request $request, int $content): RedirectResponse
{
    $validated = $request->validate([
        'comment' => ['nullable', 'string', 'max:1000'],
    ]);

    return $this->updateApprovalStatus(
        $content,
        'rejected',
        'Konten berhasil ditolak.',
        $validated['comment'] ?? null
    );
}
```

Penjelasan: status materi diubah menjadi `approved` atau `rejected`. Jika status berubah, sistem mengirim notifikasi ke tutor dan siswa terkait.

Screenshot yang diambil:

1. Materi pending di halaman Review Materi.
2. Modal preview file/video.
3. Tombol Setujui dan Tolak.
4. Status materi setelah disetujui.

### 13.6 Jadwal Admin dan Riwayat Tutor

Admin dapat membuat jadwal bertipe `live`, `consultation`, `deadline`, `review`, atau `tryout`. Admin juga membaca deadline siswa yang dibuat tutor. Field `audience` membuat satu tabel jadwal tetap dapat dipakai bersama tanpa menampilkan agenda yang salah kepada tutor maupun siswa.

Snippet kode jadwal admin:

```php
// app/Models/Schedule.php
public static function audienceForType(?string $type): string
{
    return match ($type) {
        self::TYPE_TUTOR_DEADLINE, self::TYPE_REVIEW => self::AUDIENCE_TUTOR,
        self::TYPE_STUDENT_DEADLINE, self::TYPE_TRYOUT => self::AUDIENCE_STUDENT,
        default => self::AUDIENCE_SHARED,
    };
}
```

Penjelasan: semua jadwal disimpan di tabel `schedules`, tetapi `audienceForType()` menentukan penerima. Live class dan konsultasi terlihat tutor serta siswa. Deadline tutor dan review hanya terlihat tutor. Tryout serta deadline tugas siswa hanya terlihat siswa. Admin tetap membaca seluruh row.

Screenshot yang diambil:

1. Modal tambah jadwal admin dengan dropdown tipe jadwal.
2. Kalender admin yang menampilkan warna berbeda untuk tiap tipe.
3. Live class di admin, tutor, dan siswa.
4. Deadline tutor di admin dan tutor.
5. Tryout di admin dan siswa.
6. Deadline siswa buatan tutor yang tetap muncul di kalender admin.

Snippet riwayat tutor:

```php
// app/Http/Controllers/Admin/TutorHistoryController.php
$history = Schedule::query()
    ->with(['course:id,title', 'mentor:id,name,email'])
    ->whereNotNull('mentor_id')
    ->whereNotNull('meeting_link')
    ->whereNotNull('started_at')
    ->whereColumn('started_at', '<=', 'end_time')
    ->where('end_time', '<', now())
    ->orderByDesc('end_time')
    ->paginate(15);
```

Penjelasan: riwayat tutor hanya dihitung jika tutor memiliki link meeting, menekan mulai sesi, dan waktu sesi sudah selesai. Ini dipakai admin untuk monitoring kehadiran tutor.

Screenshot yang diambil: halaman Riwayat Tutor yang menampilkan total sesi, tutor aktif, sesi bulan ini, dan tabel riwayat.

### 13.7 Fitur Sidebar Tutor

| Menu | Route / Halaman | Controller / File | Proses Utama | Screenshot yang Diambil |
| --- | --- | --- | --- | --- |
| Dashboard | `/tutor/dashboard` | `Tutor/DashboardController@index`, `TutorDashboard.jsx` | Ringkasan kelas, jadwal hari ini, notifikasi, riwayat terbaru | Dashboard tutor dengan jadwal hari ini dan notifikasi |
| Upload Materi | `/tutor/upload` | `Tutor/MaterialController@index/store/destroy/announce`, `TutorMaterialUpload.jsx` | Upload video/modul/bank soal, hapus materi, kirim pengumuman | Form upload materi, list materi terupload, form pengumuman |
| Monitor Kelas | `/tutor/classes` | `Tutor/ClassMonitoringController@index/showStudent`, `TutorClassMonitoring.jsx` | Melihat kelas yang diajar, materi kelas, daftar siswa, profil siswa | Detail kelas, filter materi, daftar siswa, menu lihat profil siswa |
| Riwayat Mengajar | `/tutor/history` | `Tutor/DashboardController@history`, `TutorHistory.jsx` | Melihat sesi mengajar tutor yang sudah selesai | Tabel riwayat mengajar dan statistik sesi |
| Jadwal | `/tutor/schedule` | `Tutor/ScheduleController`, `TutorSchedule.jsx` | Jadwal mingguan, tambah live/konsultasi, kelola deadline siswa, update meeting link, mulai sesi | Minggu berjalan, link meeting, panel deadline siswa, mulai sesi |
| Profil | `/tutor/profile` | `Tutor/DashboardController@profile/updateProfile`, `TutorProfileEdit.jsx` | Melihat profil, edit profil, upload foto ke storage | Profil read-only, mode edit, upload foto |
| Settings | `/tutor/settings` | `Tutor/DashboardController@settings/updateSettings`, `TutorSettings.jsx` | Preferensi notifikasi, tampilan, privasi, progress warning | Toggle settings dan tombol simpan perubahan |
| Notifikasi | `/tutor/notifications` | `Tutor/NotificationController@index`, `TutorNotifications.jsx` | Melihat semua notifikasi tutor | Halaman semua notifikasi tutor |
| Keluar | `/logout` | `AuthenticatedSessionController@destroy` | Logout dan redirect sesuai role | Tombol keluar tutor |

Snippet sidebar tutor:

```jsx
// resources/js/Components/TutorSidebar.jsx
<Link href="/tutor/dashboard" className={itemClass(active === "dashboard")}>Dashboard</Link>
<Link href="/tutor/upload" className={itemClass(active === "upload")}>Upload Materi</Link>
<Link href="/tutor/classes" className={itemClass(active === "classes")}>Monitor Kelas</Link>
<Link href="/tutor/history" className={itemClass(active === "history")}>Riwayat Mengajar</Link>
<Link href="/tutor/schedule" className={itemClass(active === "schedule")}>Jadwal</Link>
<Link href="/tutor/profile" className={itemClass(active === "profile")}>Profil</Link>
<Link href="/tutor/settings" className={itemClass(active === "settings")}>Settings</Link>
<Link href="/tutor/notifications" className={itemClass(active === "notifications")}>Notifikasi</Link>
```

Penjelasan: seluruh halaman tutor memakai komponen sidebar yang sama, sehingga tampilan desktop, mobile drawer, dan menu collapsible tetap konsisten.

Screenshot yang diambil: sidebar tutor desktop terbuka, sidebar tutor collapsed, dan drawer tutor di tampilan mobile.

### 13.8 Upload Materi dan Pengumuman Tutor

Tutor dapat upload tiga jenis materi: video YouTube, modul, dan bank soal. File disimpan ke disk yang dikonfigurasi melalui `MATERIALS_FILESYSTEM_DISK`, sehingga pada deployment dapat diarahkan ke R2.

Snippet kode:

```php
// app/Http/Controllers/Tutor/MaterialController.php
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'course_id' => ['required', 'integer', Rule::in($courseIds)],
        'title' => ['required', 'string', 'max:255'],
        'youtube_url' => ['nullable', 'url', 'max:1024'],
        'module_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:51200'],
        'quiz_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:51200'],
    ]);

    if ($request->hasFile('module_file')) {
        $storedFile = $this->storeMaterialFile($request->file('module_file'), 'materials/modules');
        $this->createMaterial($request, $validated, 'module', $storedFile['url'], null, $storedFile['disk'], $storedFile['path']);
    }

    $this->notifyAdmins($request->user(), $createdMaterials);
}
```

Penjelasan: setelah materi dibuat dengan status `pending`, admin menerima notifikasi untuk review.

Screenshot yang diambil:

1. Form upload materi baru.
2. Materi berstatus Menunggu Review.
3. Notifikasi admin bahwa ada materi baru.

Snippet pengumuman:

```php
// app/Http/Controllers/Tutor/MaterialController.php
public function announce(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'course_id' => ['required', 'integer', Rule::in($courseIds)],
        'title' => ['required', 'string', 'max:120'],
        'message' => ['required', 'string', 'max:1000'],
    ]);

    $studentIds = Enrollment::query()
        ->where('course_id', $validated['course_id'])
        ->where('status', 'active')
        ->pluck('user_id')
        ->unique();

    foreach ($studentIds as $studentId) {
        Notification::create([
            'user_id' => $studentId,
            'title' => 'Pengumuman '.$request->user()->name.': '.$validated['title'],
            'message' => $validated['message'],
        ]);
    }
}
```

Penjelasan: pengumuman tutor dikirim ke siswa yang enroll pada course terkait, bukan ke seluruh siswa.

Screenshot yang diambil: form pengumuman di `/tutor/upload` dan notifikasi yang muncul di dashboard siswa.

### 13.9 Jadwal Tutor dan Absensi Mengajar

Tutor dapat membuat live class, konsultasi, dan deadline tugas siswa untuk course yang diajar. Kalender mengajar hanya menampilkan jadwal `shared` atau `tutor`. Deadline siswa tidak tampil di kalender mengajar, tetapi dikelola melalui panel **Deadline Tugas Siswa** pada halaman yang sama.

Untuk live class dan konsultasi, tutor dapat menambahkan link meeting sebelum sesi selesai. Ketika tutor menekan mulai sesi, sistem menyimpan `started_at`, lalu redirect ke link meeting. Setelah jam akhir lewat, sesi tidak bisa dibuka atau diedit lagi.

Snippet kode penguncian sesi:

```php
// app/Http/Controllers/Tutor/ScheduleController.php
if ($this->hasEnded($schedule)) {
    return back()->withErrors([
        'schedule' => 'Sesi ini sudah berakhir dan tidak bisa dimulai ulang.',
    ]);
}
```

Snippet deadline tugas siswa:

```php
// app/Http/Controllers/Tutor/ScheduleController.php
$validated = $request->validate([
    'type' => ['required', Rule::in(Schedule::TUTOR_CREATABLE_TYPES)],
    'schedule_date' => ['required', 'date'],
    'deadline_time' => [
        'nullable',
        'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE,
        'date_format:H:i',
    ],
    'action_link' => [
        'nullable',
        'url',
        'max:1024',
        'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE,
    ],
]);

$startTime = $isStudentDeadline
    ? Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' 00:00', 'Asia/Jakarta')
    : Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['start_time'], 'Asia/Jakarta');

$endTime = $isStudentDeadline
    ? Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['deadline_time'], 'Asia/Jakarta')
    : Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['end_time'], 'Asia/Jakarta');
```

Penjelasan: deadline siswa memakai satu jam batas akhir pada `end_time`. `start_time` dinormalisasi ke awal hari untuk penempatan kalender siswa. Link form wajib diisi sejak awal agar siswa selalu memiliki tujuan pengumpulan tugas. Sementara itu, `started_at` menjadi bukti tutor membuka sesi meeting dan digunakan pada riwayat tutor.

Screenshot yang diambil:

1. Jadwal tutor sebelum link meeting diisi.
2. Modal tambah link meeting.
3. Tombol Mulai Sesi aktif.
4. Tombol Sudah Berakhir pada sesi lewat.
5. Panel Deadline Tugas Siswa.
6. Modal deadline siswa dengan tanggal, jam deadline, dan link form wajib.
7. Tombol edit serta hapus deadline siswa.
8. Riwayat Mengajar setelah sesi selesai.

### 13.10 Profil, Settings, Password, dan Notifikasi Tutor

Profil tutor dapat dilihat secara read-only, lalu diedit setelah tombol Edit Profil ditekan. Email tetap ditampilkan tetapi tidak bisa diedit. Foto profil disimpan ke storage permanen yang sama dengan materi.

Snippet update profil:

```php
// app/Http/Controllers/Tutor/DashboardController.php
public function updateProfile(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'phone' => ['nullable', 'string', 'max:20', 'regex:/^\d+$/'],
        'gender' => ['nullable', Rule::in(['male', 'female'])],
        'expertise' => ['nullable', 'string', 'max:255'],
        'education' => ['nullable', Rule::in(['SMA', 'S1', 'S2', 'S3'])],
        'bio' => ['nullable', 'string', 'max:1000'],
        'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
    ]);

    $user->update([
        'name' => $validated['name'],
        'phone' => $validated['phone'] ?? null,
        'gender' => $validated['gender'] ?? null,
        'tutor_profile' => array_merge($profile, [
            'phone' => $validated['phone'] ?? null,
            'education' => $validated['education'] ?? null,
            'expertise' => $validated['expertise'] ?? null,
            'bio' => $validated['bio'] ?? null,
        ]),
    ]);
}
```

Penjelasan: data profil disimpan ke tabel `users` dan kolom `tutor_profile`. Nomor telepon divalidasi angka saja agar formatnya rapi saat dibaca dari database.

Screenshot yang diambil: halaman profil tutor mode read-only, mode edit aktif, dropdown pendidikan, dropdown gender, dan upload foto.

Snippet settings dan password:

```php
// app/Http/Controllers/Tutor/DashboardController.php
public function updateSettings(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'notifications.materialReview' => ['required', 'boolean'],
        'teaching.showProgressWarnings' => ['required', 'boolean'],
        'privacy.showEmailToStudents' => ['required', 'boolean'],
    ]);

    $request->user()->update([
        'tutor_settings' => array_replace_recursive(TutorSettings::defaults(), $validated),
    ]);
}

public function updatePassword(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'current_password' => ['required', 'current_password'],
        'password' => ['required', 'confirmed', Password::defaults()],
    ]);

    $request->user()->update(['password' => Hash::make($validated['password'])]);
}
```

Penjelasan: settings disimpan jika tutor menekan Simpan Perubahan. Password tutor diubah melalui halaman khusus tutor, bukan halaman password siswa.

Screenshot yang diambil: halaman settings sebelum dan sesudah toggle, tombol Simpan Perubahan, halaman Ubah Password Tutor.

### 13.11 Fitur Sidebar Siswa

| Menu | Route / Halaman | Controller / File | Proses Utama | Screenshot yang Diambil |
| --- | --- | --- | --- | --- |
| Beranda | `/dashboard?tab=beranda` | route `/dashboard`, `StudentDashboard.jsx` | Ringkasan paket aktif, course aktif, jadwal, notifikasi | Dashboard siswa tab Beranda |
| Lihat Katalog | `/dashboard?tab=katalog` dan landing catalog | route `/dashboard`, `LandingPage.jsx`, `Checkout.jsx` | Melihat paket/course yang tersedia dan lanjut checkout | Tab katalog paket dan tombol beli paket |
| Subtes UTBK | `/course/{course}/learn` | route `course.learn`, `CourseLearn.jsx` | Akses video, modul, bank soal, preview, download | Halaman belajar course, embed YouTube/PDF/DOC/PPT |
| Jadwal | `/dashboard?tab=jadwal` dan `/student/schedules` | helper `studentScheduleWeekPayload`, `StudentSchedules.jsx` | Jadwal minggu berjalan dari course aktif | Week selector dan tombol Join Meeting |
| Profil | `/dashboard?tab=profil` dan modal profil | `ProfileController@update`, `Profile/Edit.jsx` | Melihat dan mengubah nama, gender, telepon, sekolah | Tab profil siswa dan modal edit profil |
| Notifikasi | Topbar dashboard siswa | `notifications` dari route dashboard | Menampilkan notifikasi materi, jadwal, pembayaran | Dropdown notifikasi siswa |
| Keluar | `/logout` | `AuthenticatedSessionController@destroy` | Logout siswa dan kembali ke login siswa | Tombol Keluar siswa |
| Transaksi | Checkout dan payment status | route `/checkout/package/{package}`, `/checkout`, `PaymentController` | Membuat transaksi, membayar, mengaktifkan enrollment | Checkout, Payment Status, transaksi pending/success |

Snippet sidebar siswa:

```jsx
// resources/js/Pages/StudentDashboard.jsx
<SidebarMenuButton
  active={activeTab === 'beranda'}
  icon={Home}
  label="Beranda"
  onClick={() => changeTab('beranda')}
/>

<SidebarMenuButton
  active={activeTab === 'katalog'}
  icon={Star}
  label="Lihat Katalog"
  onClick={() => changeTab('katalog')}
/>

<button type="button" onClick={toggleSubtesMenu}>
  <BookOpen className="h-4 w-4" />
  <span>Subtes UTBK</span>
</button>

<SidebarMenuButton
  active={activeTab === 'jadwal'}
  icon={CalendarDays}
  label="Jadwal"
  onClick={() => changeTab('jadwal')}
/>
```

Penjelasan: dashboard siswa memakai tab internal, sehingga beberapa menu sidebar tidak berpindah route tetapi mengganti isi halaman dengan state `activeTab`.

Screenshot yang diambil: sidebar siswa dengan menu Beranda, Lihat Katalog, Subtes UTBK, Jadwal, Profil, dan Keluar.

### 13.12 Transaksi Siswa dari Katalog sampai Enrollment Aktif

Transaksi siswa dimulai dari katalog paket. Setelah siswa memilih paket dan checkout, sistem membuat transaksi dengan status `pending`. Ketika Midtrans mengirim status sukses, sistem mengaktifkan enrollment untuk seluruh course dalam paket.

Business process transaksi siswa:

1. Siswa login.
2. Siswa membuka `Lihat Katalog`.
3. Siswa memilih paket belajar.
4. Sistem membuka halaman checkout.
5. Siswa memilih metode pembayaran.
6. Sistem membuat transaksi `pending`.
7. Sistem meminta token pembayaran ke Midtrans.
8. Siswa menyelesaikan pembayaran.
9. Callback Midtrans memperbarui status transaksi.
10. Jika sukses, sistem membuat enrollment course dari paket.
11. Course muncul di sidebar `Subtes UTBK`.
12. Siswa dapat membuka materi dan jadwal course tersebut.

Snippet route checkout paket:

```php
// routes/web.php
Route::get('/checkout/package/{package}', function (Package $package) {
    $package->load([
        'courses' => fn ($query) => $query
            ->with('category')
            ->where('status', 'active')
            ->orderBy('title'),
    ]);

    return Inertia::render('Checkout', [
        'learningPackage' => $package,
    ]);
})->middleware('auth')->name('checkout.package');

Route::post('/checkout', function (Request $request, MidtransService $midtrans) {
    $transaction = Transaction::create([
        'user_id' => Auth::id(),
        'package_id' => $package->id,
        'invoice_number' => sprintf('INV-%s-%04d', now()->format('YmdHis'), random_int(0, 9999)),
        'amount' => $package->price,
        'payment_method' => $request->payment_method,
        'payment_status' => 'pending',
    ]);

    $snap = $midtrans->createSnapTransaction($transaction);
    $transaction->update(['payment_gateway_ref' => $snap['token'] ?? null]);

    return redirect()->route('payment.status', ['transaction' => $transaction, 'pay' => 1]);
})->middleware('auth')->name('checkout');
```

Penjelasan: transaksi paket dibuat dari route checkout. Token Midtrans disimpan di `payment_gateway_ref` untuk dipakai halaman Payment Status.

Screenshot yang diambil:

1. Katalog paket.
2. Halaman checkout.
3. Payment Status pending.
4. Payment Status success.

Snippet aktivasi enrollment:

```php
// app/Http/Controllers/PaymentController.php
private function applyMidtransStatus(Transaction $transaction, array $payload): void
{
    $newStatus = match ($payload['transaction_status'] ?? null) {
        'settlement' => 'success',
        'pending' => 'pending',
        'expire' => 'expired',
        'deny', 'cancel', 'failure' => 'failed',
        default => $transaction->payment_status,
    };

    DB::transaction(function () use ($transaction, $newStatus) {
        $transaction->update([
            'payment_status' => $newStatus,
            'paid_at' => $newStatus === 'success' ? now() : $transaction->paid_at,
        ]);

        if ($newStatus === 'success' && $transaction->package_id) {
            app(PackageEnrollmentService::class)
                ->enroll($transaction->user_id, $transaction->package_id);
        }
    });
}
```

Penjelasan: saat pembayaran sukses, service enrollment membuat akses siswa ke course yang ada di paket. Inilah yang membuat daftar course siswa sinkron dengan tutor dan admin.

Screenshot yang diambil:

1. Database/tabel transaksi dengan status success.
2. Dashboard siswa setelah paket aktif.
3. Sidebar Subtes UTBK berisi course yang aktif.

### 13.13 Jadwal Siswa dan Join Meeting

Jadwal siswa diambil dari tabel `schedules` berdasarkan course aktif dan scope `visibleToStudent()`. Siswa hanya membaca jadwal dengan audiens `shared` atau `student`: live class, konsultasi, deadline tugas, dan tryout.

Snippet kode:

```php
// app/Models/Schedule.php
public function scopeVisibleToStudent(Builder $query): Builder
{
    return $query->whereIn('audience', [
        self::AUDIENCE_SHARED,
        self::AUDIENCE_STUDENT,
    ]);
}
```

Penjelasan: siswa tidak membuat jadwal sendiri. Live class dan konsultasi memiliki tombol join meeting. Deadline tugas memiliki tombol kumpulkan tugas menuju form. Tryout memiliki tombol menuju platform pihak ketiga. Tombol menjadi nonaktif setelah `end_time` terlewati.

Screenshot yang diambil:

1. Admin membuat jadwal live class.
2. Tutor melihat jadwal yang sama.
3. Siswa melihat jadwal yang sama.
4. Tombol Join Meeting aktif jika link sudah tersedia.
5. Deadline siswa dengan tombol Kumpulkan Tugas sebelum jam berakhir.
6. Deadline siswa dengan tombol nonaktif setelah jam berakhir.
7. Tryout dengan tombol Buka Tryout.

### 13.14 Course Learn, Preview Materi, dan Progress Siswa

Siswa hanya bisa membuka course yang sudah aktif di enrollment. Materi yang tampil hanya materi yang sudah disetujui admin.

Snippet query course learn:

```php
// routes/web.php
$enrollment = Enrollment::where('user_id', $user->id)
    ->where('course_id', $course->id)
    ->where('status', 'active')
    ->first();

if (! $enrollment) {
    return redirect()
        ->to('/course/'.$course->id)
        ->withErrors(['course' => 'Kamu belum memiliki akses aktif ke course ini.']);
}

$materials = Material::where('course_id', $course->id)
    ->where('approval_status', 'approved')
    ->orderBy('created_at')
    ->get();
```

Penjelasan: pengecekan enrollment mencegah siswa mengakses course yang belum dibeli. Filter `approved` mencegah materi pending/rejected muncul ke siswa.

Screenshot yang diambil: halaman course learn yang menampilkan video, modul, bank soal, tombol preview, dan tombol download.

Snippet embed materi:

```jsx
// resources/js/Pages/CourseLearn.jsx
{activeMaterial?.file_url && isPdfUrl(activeMaterial.file_url) ? (
  <iframe
    src={activeMaterial.file_url}
    title={activeMaterial.title}
    className="h-full w-full border-0 bg-white"
  />
) : activeMaterial?.file_url && isOfficeUrl(activeMaterial.file_url) ? (
  <iframe
    src={officePreviewUrl(activeMaterial.file_url)}
    title={activeMaterial.title}
    className="h-full w-full border-0 bg-white"
  />
) : activeMaterial?.type === 'video' && youtubeEmbedUrl(activeMaterial?.content) ? (
  <iframe src={youtubeEmbedUrl(activeMaterial.content)} title={activeMaterial.title} />
) : null}
```

Penjelasan: PDF ditampilkan langsung, sedangkan DOC/DOCX/PPT/PPTX memakai office preview selama file memiliki URL publik.

Screenshot yang diambil:

1. Preview PDF di halaman siswa.
2. Preview DOC/PPT.
3. Embed video YouTube.
4. Tombol download materi.

Snippet progress:

```php
// app/Http/Controllers/Student/ProgressController.php
public function store(Request $request)
{
    $record = ProgressRecord::updateOrCreate(
        [
            'user_id' => $request->user()->id,
            'course_id' => $validated['course_id'],
            'material_id' => $validated['material_id'] ?? null,
        ],
        [
            'percent' => $validated['percent'] ?? 0,
            'status' => $validated['status'] ?? 'started',
        ]
    );

    return response()->json($record, 201);
}
```

Penjelasan: progress siswa disimpan per course dan material, lalu dipakai dashboard siswa dan monitor kelas tutor.

Screenshot yang diambil: progress belajar di sidebar siswa dan progress siswa di halaman Monitor Kelas tutor.

### 13.15 Profil dan Notifikasi Siswa

Profil siswa dapat diubah dari dashboard atau halaman profil. Data seperti nama, gender, nomor telepon, dan sekolah asal disimpan ke tabel `users`.

Snippet kode:

```php
// app/Http/Controllers/ProfileController.php
public function update(ProfileUpdateRequest $request): RedirectResponse
{
    $request->user()->fill($request->validated());

    if ($request->user()->isDirty('email')) {
        $request->user()->email_verified_at = null;
    }

    $request->user()->save();

    return Redirect::back();
}
```

Penjelasan: form profil siswa mengirim PATCH ke route `profile.update`. Setelah berhasil, halaman kembali ke dashboard atau halaman profil.

Screenshot yang diambil:

1. Modal edit profil siswa.
2. Tab profil siswa.
3. Dropdown gender dan input nomor telepon.
4. Notifikasi siswa di dashboard.

### 13.16 Integrasi Storage Materi

Materi dan foto profil tutor memakai disk storage dari konfigurasi `MATERIALS_FILESYSTEM_DISK`. Jika `.env` diarahkan ke R2, file akan disimpan permanen di bucket R2 dan URL publiknya dipakai admin, tutor, dan siswa.

Snippet konfigurasi:

```php
// config/filesystems.php
'materials_disk' => env('MATERIALS_FILESYSTEM_DISK', 'public'),

's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env('AWS_URL'),
    'endpoint' => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
],
```

Snippet URL publik:

```php
// app/Models/Material.php
public static function publicUrlFor(?string $disk, ?string $path, ?string $fallback = null): ?string
{
    if ($disk && $path) {
        if ($disk === 'public') {
            return '/storage/'.ltrim($path, '/');
        }

        return self::normalizePublicUrl(Storage::disk($disk)->url($path));
    }

    return self::normalizePublicUrl($fallback);
}
```

Penjelasan: admin, tutor, dan siswa tidak membuat URL file sendiri. Semua memakai helper `Material::publicUrlFor`, sehingga lokasi storage bisa diganti dari local ke R2 tanpa mengubah UI.

Screenshot yang diambil:

1. File berhasil diupload tutor.
2. Preview file di admin.
3. Preview file yang sama di siswa.
4. Object file terlihat di bucket R2.

## 14. Checklist Screenshot Tambahan

### Admin

1. Sidebar admin lengkap.
2. Statistik Pengguna.
3. Statistik Transaksi.
4. Daftar Transaksi dan Detail Transaksi.
5. Laporan export transaksi.
6. Manajemen Pengguna dan assignment tutor.
7. Manajemen Paket.
8. Course Overview.
9. Review Materi dengan preview embed.
10. Jadwal admin dengan tipe live, konsultasi, deadline tutor, review, dan tryout.
11. Deadline siswa buatan tutor yang terlihat pada kalender admin.
12. Riwayat Tutor.
13. Notifikasi admin.

### Tutor

1. Sidebar tutor desktop, collapsed, dan mobile drawer.
2. Dashboard tutor.
3. Upload Materi.
4. Kirim Pengumuman.
5. Monitor Kelas.
6. Daftar Siswa dan Profil Siswa.
7. Jadwal Tutor.
8. Tambah link meeting.
9. Mulai sesi.
10. Sesi lewat dengan tombol Sudah Berakhir.
11. Panel Deadline Tugas Siswa.
12. Form deadline siswa dengan jam batas akhir dan link pengumpulan wajib.
13. Edit dan hapus deadline siswa.
14. Riwayat Mengajar.
15. Profil Tutor read-only.
16. Profil Tutor mode edit.
17. Settings Tutor.
18. Ubah Password Tutor.
19. Notifikasi Tutor.

### Siswa

1. Sidebar siswa.
2. Dashboard siswa tab Beranda.
3. Katalog paket.
4. Checkout paket.
5. Payment Status.
6. Course aktif setelah pembayaran sukses.
7. Course Learn.
8. Preview video YouTube.
9. Preview PDF.
10. Preview DOC/PPT.
11. Jadwal siswa dan Join Meeting.
12. Deadline tugas siswa sebelum dan sesudah jam deadline.
13. Tryout dengan link platform eksternal.
14. Profil siswa.
15. Notifikasi siswa.
16. Progress belajar.

### 14.1 Matriks Screenshot Pengujian Jadwal Lintas-Role

Gunakan course yang sama dan akun siswa yang enrolled pada course tersebut. Ambil screenshot berurutan agar perubahan dapat dibandingkan antar-role.

| Skenario | Aksi Awal | Bukti di Admin | Bukti di Tutor | Bukti di Siswa |
| --- | --- | --- | --- | --- |
| Live class | Admin atau tutor membuat live class | Jadwal muncul di kalender admin | Jadwal muncul dengan tombol tambah link atau mulai sesi | Jadwal muncul dengan tombol join jika link tersedia |
| Konsultasi | Admin atau tutor membuat konsultasi | Jadwal muncul di kalender admin | Jadwal muncul dengan warna konsultasi | Jadwal muncul dengan tombol join konsultasi |
| Deadline tutor | Admin membuat deadline upload materi | Jadwal muncul di kalender admin | Pengingat muncul pada kalender tutor | Tidak tampil |
| Review tutor | Admin membuat pengingat review | Jadwal muncul di kalender admin | Pengingat muncul pada kalender tutor | Tidak tampil |
| Deadline siswa | Tutor membuat deadline dan mengisi link form | Jadwal muncul di kalender admin | Deadline muncul di panel pengelolaan khusus | Deadline muncul dengan tombol kumpulkan tugas |
| Tryout | Admin membuat tryout dan mengisi action link | Jadwal muncul di kalender admin | Tidak tampil | Tryout muncul dengan tombol buka tryout |
| Sesi berakhir | Ubah waktu atau tunggu sampai `end_time` terlewati | Jadwal tetap dapat dimonitor | Tombol sesi menjadi `Sudah Berakhir` | Tombol aksi menjadi `Jadwal sudah berakhir` |
| Hapus jadwal | Admin menghapus salah satu agenda | Row hilang dari kalender admin | Hilang jika audiensnya tutor/shared | Hilang jika audiensnya student/shared |

Screenshot kode yang perlu diambil:

1. `app/Models/Schedule.php`: konstanta tipe, konstanta audiens, `audienceForType()`, `visibleToTutor()`, dan `visibleToStudent()`.
2. `app/Http/Controllers/Admin/ScheduleController.php`: validasi tipe admin, `buildPayload()`, dan `destroy()`.
3. `app/Http/Controllers/Tutor/ScheduleController.php`: validasi `required_if` action link, payload deadline, `updateMeetingLink()`, dan `startSession()`.
4. `routes/web.php`: helper `studentScheduleWeekPayload()` dengan scope `visibleToStudent()`.
5. `resources/js/Pages/Tutor/TutorSchedule.jsx`: panel **Deadline Tugas Siswa** dan pengecekan `completed`.
6. `resources/js/Pages/StudentSchedules.jsx`: `isScheduleCompleted()` dan pemilihan `targetLink`.
7. Migrasi `2026_05_30_000001_add_audience_and_action_link_to_schedules_table.php`.
8. Migrasi `2026_05_30_000002_normalize_student_deadline_start_times.php`.

## 15. Kesimpulan

Implementasi BRICS Education dilakukan secara incremental dengan pembagian admin, tutor, dan siswa. Admin berperan sebagai pengelola utama data, tutor sebagai pelaksana pembelajaran dan pengunggah materi, sedangkan siswa sebagai pengguna akhir yang mengakses jadwal dan materi approved.

Fitur utama sudah terhubung melalui database, terutama pada flow jadwal dan materi. Jadwal dibuat oleh admin atau tutor pada satu tabel, lalu dibaca berdasarkan audiens: `shared`, `tutor`, atau `student`. Materi dibuat oleh tutor, direview admin, lalu hanya tampil ke siswa setelah disetujui. Dengan demikian, sistem sudah memenuhi kebutuhan utama platform pembelajaran UTBK berbasis role.
