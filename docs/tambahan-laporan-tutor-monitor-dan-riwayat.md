# Tambahan Laporan Fitur Tutor

Dokumen ini berisi tambahan bagian yang perlu disisipkan ke `docs/laporan-implementasi-fitur.md`. Bagian pertama ditempatkan setelah penjelasan flow Monitor Kelas Tutor. Bagian kedua ditempatkan sebelum bagian Profil, Settings, dan Password Tutor.

## Monitor Kelas Tutor

Tutor dapat melihat daftar kelas yang diajar, siswa yang terdaftar pada course, materi kelas, dan profil siswa. Seluruh data dibaca dari database yang sama dengan dashboard siswa, upload materi tutor, dan review materi admin.

### Flow

1. Tutor membuka menu `Monitor Kelas`.
2. Sistem membaca course yang ditugaskan kepada tutor.
3. Tutor memilih course.
4. Sistem membaca siswa aktif dari tabel `enrollments`.
5. Sistem membaca materi course dari tabel `materials`.
6. Tutor dapat melihat, mengunduh, atau menghapus materi.
7. Tutor dapat membuka profil siswa yang terdaftar pada course miliknya.

### Snippet Route

```php
// routes/web.php
Route::middleware(['auth', 'verified', 'tutor'])
    ->prefix('tutor')
    ->name('tutor.')
    ->group(function () {
        Route::get('/classes', [TutorClassMonitoringController::class, 'index'])
            ->name('classes');

        Route::get('/students/{student}', [TutorClassMonitoringController::class, 'showStudent'])
            ->whereNumber('student')
            ->name('students.show');
    });
```

Penjelasan:

Route `/tutor/classes` membuka halaman Monitor Kelas. Route `/tutor/students/{student}` membuka profil siswa. Keduanya berada di dalam middleware `tutor`, sehingga hanya akun tutor yang dapat mengakses fitur tersebut.

### Snippet Controller Monitor Kelas

```php
// app/Http/Controllers/Tutor/ClassMonitoringController.php
public function index(Request $request)
{
    $user = $request->user();
    $courses = $this->tutorCourses($user);
    $selectedCourse = $courses->firstWhere('id', (int) $request->integer('course_id'))
        ?? $courses->first();

    $students = collect();
    $materials = collect();

    if ($selectedCourse) {
        $students = Enrollment::query()
            ->with('user:id,name,email')
            ->where('course_id', $selectedCourse->id)
            ->where('status', 'active')
            ->orderByDesc('enrolled_at')
            ->get()
            ->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->user?->id,
                'name' => $enrollment->user?->name ?? 'Siswa',
                'email' => $enrollment->user?->email ?? '-',
                'progress' => 0,
                'lastActive' => $enrollment->updated_at?->diffForHumans() ?? '-',
                'score' => 0,
                'attendance' => 0,
                'status' => $enrollment->status,
            ]);

        $materials = Material::query()
            ->where('course_id', $selectedCourse->id)
            ->orderByRaw("case when approval_status = 'pending' then 0 else 1 end")
            ->latest()
            ->get()
            ->map(fn (Material $material) => [
                'id' => $material->id,
                'title' => $material->title,
                'type' => $this->materialType($material->type),
                'meta' => $material->file_url ?: $material->content,
                'status' => $material->approval_status,
                'can_delete' => true,
            ]);
    }

    return Inertia::render('Tutor/TutorClassMonitoring', [
        'classes' => $courses->map(fn (Course $course) => $this->courseSummary($course, $user)),
        'selectedClassId' => $selectedCourse?->id,
        'students' => $students,
        'materials' => $materials,
    ]);
}
```

Penjelasan:

Controller memilih course berdasarkan `course_id`, lalu membaca siswa aktif dan materi untuk course tersebut. Karena query memakai tabel `enrollments` dan `materials`, data Monitor Kelas selalu sinkron dengan role admin dan siswa.

### Snippet Profil Siswa

```php
// app/Http/Controllers/Tutor/ClassMonitoringController.php
public function showStudent(Request $request, User $student)
{
    $user = $request->user();
    $courseIds = TutorCourseResolver::ids($user);

    $enrollments = Enrollment::query()
        ->with('course.category')
        ->where('user_id', $student->id)
        ->whereIn('course_id', $courseIds)
        ->orderByDesc('enrolled_at')
        ->get();

    abort_if($enrollments->isEmpty(), 403);

    return Inertia::render('Tutor/TutorStudentProfile', [
        'student' => [
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
        ],
        'enrollments' => $enrollments,
    ]);
}
```

Penjelasan:

Tutor hanya dapat membuka profil siswa yang enroll pada course miliknya. Jika siswa tidak memiliki enrollment terkait, sistem menghentikan akses dengan status `403`.

### Snippet Tampilan

```jsx
// resources/js/Pages/Tutor/TutorClassMonitoring.jsx
{filtered.map((student) => (
  <tr key={student.id}>
    <td>{student.name}</td>
    <td>{student.progress}%</td>
    <td>{student.score}</td>
    <td>{student.attendance}%</td>
    <td>
      <Link href={`/tutor/students/${student.id}`}>
        Lihat profil siswa
      </Link>
    </td>
  </tr>
))}
```

Penjelasan:

UI menampilkan daftar siswa dari controller. Tombol `Lihat profil siswa` mengarah ke halaman profil siswa yang sudah dilindungi pengecekan enrollment.

### Screenshot yang Perlu Diambil

1. Sidebar tutor dengan menu `Monitor Kelas`.
2. Halaman Monitor Kelas setelah memilih course.
3. Daftar siswa.
4. Filter atau sort siswa.
5. Daftar materi kelas.
6. Tombol lihat, unduh, dan hapus materi.
7. Menu tiga titik dan opsi `Lihat profil siswa`.
8. Halaman profil siswa.

## Riwayat Mengajar Tutor

Tutor dapat membuka halaman `/tutor/history` untuk melihat sesi mengajar yang sudah selesai. Riwayat ini juga dipakai admin untuk memonitor kehadiran tutor.

### Flow

1. Tutor membuka menu `Riwayat Mengajar`.
2. Sistem membaca jadwal tutor dari tabel `schedules`.
3. Sistem hanya mengambil sesi yang memiliki link meeting.
4. Sistem memastikan tutor pernah menekan tombol `Mulai Sesi`, sehingga `started_at` sudah terisi.
5. Sistem memastikan waktu selesai sesi sudah lewat.
6. Riwayat ditampilkan dari sesi terbaru ke sesi lama.
7. Data yang sama dapat dilihat admin melalui halaman `Riwayat Tutor`.

### Snippet Route

```php
// routes/web.php
Route::middleware(['auth', 'verified', 'tutor'])
    ->prefix('tutor')
    ->name('tutor.')
    ->group(function () {
        Route::get('/history', [TutorDashboardController::class, 'history'])
            ->name('history');
    });
```

Penjelasan:

Route `/tutor/history` memanggil method `history()` pada `Tutor/DashboardController`.

### Snippet Controller

```php
// app/Http/Controllers/Tutor/DashboardController.php
public function history(Request $request)
{
    $user = $request->user()->load('mentorCourse.category');
    $courseIds = $this->tutorCourseIds($user);
    $history = $this->teachingHistoryQuery($user, $courseIds)
        ->paginate(12)
        ->withQueryString();

    $history->getCollection()->transform(
        fn (Schedule $schedule) => $this->teachingHistoryItem($schedule)
    );

    return Inertia::render('Tutor/TutorHistory', [
        'user' => $user,
        'tutorClasses' => $this->courseSummaries($user),
        'history' => $history,
        'stats' => [
            'totalSessions' => $this->teachingHistoryQuery($user, $courseIds)->count(),
            'totalStudents' => Enrollment::query()
                ->whereIn('course_id', $courseIds)
                ->where('status', 'active')
                ->distinct('user_id')
                ->count('user_id'),
            'courses' => $courseIds->count(),
            'lastTaught' => $this->teachingHistoryQuery($user, $courseIds)
                ->value('start_time'),
        ],
    ]);
}
```

Penjelasan:

Controller mengirim daftar sesi dan statistik tutor ke halaman riwayat. Pagination membatasi daftar menjadi 12 sesi per halaman.

### Snippet Business Rule Riwayat

```php
// app/Http/Controllers/Tutor/DashboardController.php
private function teachingHistoryQuery($user, $courseIds)
{
    return Schedule::query()
        ->with('course:id,title')
        ->where('mentor_id', $user->id)
        ->whereIn('course_id', $courseIds)
        ->whereNotNull('meeting_link')
        ->whereNotNull('started_at')
        ->whereColumn('started_at', '<=', 'end_time')
        ->where('end_time', '<=', Carbon::now('Asia/Jakarta')->format('Y-m-d H:i:s'))
        ->orderByDesc('end_time');
}
```

Penjelasan:

Jadwal tidak otomatis menjadi riwayat hanya karena waktunya sudah lewat. Sesi baru dicatat sebagai riwayat mengajar jika tutor memiliki meeting link, menekan tombol `Mulai Sesi`, dan waktu sesi telah selesai.

### Snippet Tampilan

```jsx
// resources/js/Pages/Tutor/TutorHistory.jsx
{historyItems.length === 0 ? (
  <div className="p-10 text-center">
    <p>Belum ada riwayat mengajar.</p>
    <p>Sesi akan masuk ke halaman ini setelah waktu jadwal selesai.</p>
  </div>
) : (
  historyItems.map((item) => (
    <article key={item.id}>
      <h4>{item.title}</h4>
      <p>{item.course}</p>
      <span>{item.date}</span>
      <span>{item.time}</span>
      <span>{item.students} siswa</span>
    </article>
  ))
)}
```

Penjelasan:

UI menampilkan empty state jika belum ada sesi selesai. Jika riwayat tersedia, setiap item menampilkan judul sesi, course, tanggal, waktu, dan jumlah siswa.

### Screenshot yang Perlu Diambil

1. Sidebar tutor dengan menu `Riwayat Mengajar`.
2. Halaman riwayat ketika belum ada sesi selesai.
3. Halaman riwayat dengan daftar sesi selesai.
4. Kartu statistik Sesi Selesai, Siswa Aktif, Course, dan Terakhir Mengajar.
5. Detail satu riwayat: judul sesi, course, tanggal, waktu, dan jumlah siswa.
6. Halaman admin `Riwayat Tutor` sebagai bukti sinkronisasi monitoring.
