<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class TutorDemoDataSeeder extends Seeder
{
    private const MATERI_PDF_SOURCE = '/home/juliussy/Downloads/Interpretasi Data 31125.pdf';
    private const MATERI_PDF_STORAGE_PATH = 'materials/demo/interpretasi-data-31125.pdf';
    private const MATERI_PDF_URL = '/storage/'.self::MATERI_PDF_STORAGE_PATH;
    private const LATIHAN_SOAL_PDF_SOURCE = '/home/juliussy/Downloads/_Soal Latihan PU 004 (1).pdf';
    private const LATIHAN_SOAL_PDF_STORAGE_PATH = 'materials/demo/soal-latihan-pu-004.pdf';
    private const LATIHAN_SOAL_PDF_URL = '/storage/'.self::LATIHAN_SOAL_PDF_STORAGE_PATH;
    private const DEMO_YOUTUBE_URL = 'https://youtu.be/QgjpEI8FqIQ?si=20LXx336dzY8oWw5';

    public function run(): void
    {
        $now = now();
        $categoryId = $this->ensureCategory($now);
        $courseIds = $this->ensureCourses($categoryId, $now);
        $this->ensureUsersAndEnrollments($courseIds, $now);
        $this->ensureCurrentWeekSchedules($courseIds);
        $this->ensurePastTeachingHistory($courseIds);
        $this->ensureMaterials($courseIds, $now);
    }

    private function ensureCategory($now): int
    {
        DB::table('categories')->updateOrInsert(
            ['name' => 'Tes Potensi Skolastik'],
            [
                'description' => 'Subtes UTBK untuk kemampuan bernalar, memahami bacaan, dan mengolah informasi.',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        return (int) DB::table('categories')->where('name', 'Tes Potensi Skolastik')->value('id');
    }

    private function ensureCourses(int $categoryId, $now)
    {
        $courses = [
            'Penalaran Umum' => 'Latihan pola argumen, simpulan, dan strategi penalaran UTBK.',
            'Pengetahuan dan Pemahaman Umum' => 'Penguatan ide pokok, kosakata, dan pemahaman informasi umum.',
            'Pemahaman Bacaan dan Menulis' => 'Strategi membaca efektif, struktur paragraf, dan penyuntingan kalimat.',
        ];

        foreach ($courses as $title => $description) {
            DB::table('courses')->updateOrInsert(
                ['title' => $title],
                [
                    'category_id' => $categoryId,
                    'description' => $description,
                    'price' => 99000,
                    'status' => 'active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        return DB::table('courses')->whereIn('title', array_keys($courses))->pluck('id', 'title');
    }

    private function ensureUsersAndEnrollments($courseIds, $now): void
    {
        $studentRoleId = User::roleIdFor('student') ?? 1;
        $tutorRoleId = User::roleIdFor('mentor') ?? User::roleIdFor('tutor') ?? 2;

        foreach ([
            ['name' => 'Tutor Dev', 'email' => 'tutor@bricsedu.id'],
            ['name' => 'Tutor Dev Alias', 'email' => 'tutor@brics.com'],
        ] as $tutor) {
            $tutorUser = User::updateOrCreate(
                ['email' => $tutor['email']],
                [
                    'name' => $tutor['name'],
                    'password' => bcrypt('password123'),
                    'role_id' => $tutorRoleId,
                    'mentor_course_id' => $courseIds['Penalaran Umum'] ?? null,
                ]
            );

            if (! $tutorUser->tutor_profile) {
                $tutorUser->update([
                    'tutor_profile' => [
                        'phone' => '0821-9876-5432',
                        'expertise' => 'UTBK TPS dan Literasi',
                        'education' => 'Tutor Persiapan UTBK',
                        'bio' => 'Tutor persiapan UTBK untuk subtes TPS, literasi, dan pemahaman bacaan.',
                    ],
                ]);
            }

            DB::table('users')->where('email', $tutor['email'])->update(['role' => 'mentor', 'updated_at' => $now]);
            $this->syncTutorCourses($tutor['email'], $courseIds->values()->all(), $now);
        }

        foreach ([
            ['name' => 'Siswa Brics', 'email' => 'siswa@bricsedu.id'],
            ['name' => 'Siswa Dua', 'email' => 'siswa2@bricsedu.id'],
            ['name' => 'Siswa Tiga', 'email' => 'siswa3@bricsedu.id'],
        ] as $student) {
            User::updateOrCreate(
                ['email' => $student['email']],
                [
                    'name' => $student['name'],
                    'password' => bcrypt('password123'),
                    'role_id' => $studentRoleId,
                ]
            );

            DB::table('users')->where('email', $student['email'])->update(['role' => 'student', 'updated_at' => $now]);
        }

        $studentIds = DB::table('users')
            ->whereIn('email', ['siswa@bricsedu.id', 'siswa2@bricsedu.id', 'siswa3@bricsedu.id'])
            ->pluck('id');

        foreach ($studentIds as $studentId) {
            foreach ($courseIds as $courseId) {
                DB::table('enrollments')->updateOrInsert(
                    ['user_id' => $studentId, 'course_id' => $courseId],
                    [
                        'status' => 'active',
                        'enrolled_at' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }
    }

    private function ensureMaterials($courseIds, $now): void
    {
        $tutorId = DB::table('users')->where('email', 'tutor@bricsedu.id')->value('id');

        if (! $tutorId) {
            return;
        }

        $materiPdfUrl = $this->ensurePdf(
            self::MATERI_PDF_SOURCE,
            self::MATERI_PDF_STORAGE_PATH,
            self::MATERI_PDF_URL
        );
        $latihanSoalPdfUrl = $this->ensurePdf(
            self::LATIHAN_SOAL_PDF_SOURCE,
            self::LATIHAN_SOAL_PDF_STORAGE_PATH,
            self::LATIHAN_SOAL_PDF_URL
        );
        $adminId = DB::table('users')->where('role_id', User::roleIdFor('admin'))->value('id');
        $rows = [
            [
                'course' => 'Penalaran Umum',
                'title' => 'Video Strategi Penalaran Umum',
                'type' => 'video',
                'file_url' => null,
                'content' => self::DEMO_YOUTUBE_URL,
                'approval_status' => 'approved',
            ],
            [
                'course' => 'Penalaran Umum',
                'title' => 'Bank Soal Penalaran Umum',
                'type' => 'quiz',
                'file_url' => $latihanSoalPdfUrl,
                'content' => 'Latihan pola argumen, simpulan logis, dan analisis data.',
                'approval_status' => 'approved',
            ],
            [
                'course' => 'Pengetahuan dan Pemahaman Umum',
                'title' => 'Modul Pengetahuan dan Pemahaman Umum',
                'type' => 'module',
                'file_url' => $materiPdfUrl,
                'content' => 'Ide pokok, kosakata, dan pemahaman informasi umum.',
                'approval_status' => 'pending',
            ],
            [
                'course' => 'Pemahaman Bacaan dan Menulis',
                'title' => 'Latihan Pemahaman Bacaan dan Menulis',
                'type' => 'quiz',
                'file_url' => $latihanSoalPdfUrl,
                'content' => 'Latihan menyunting kalimat, memahami struktur paragraf, dan kohesi teks.',
                'approval_status' => 'rejected',
                'rejection_comment' => 'Tambahkan pembahasan jawaban sebelum diupload ulang.',
            ],
        ];

        foreach ($rows as $row) {
            $courseId = $courseIds[$row['course']] ?? null;

            if (! $courseId) {
                continue;
            }

            Material::query()->updateOrCreate(
                [
                    'course_id' => $courseId,
                    'uploaded_by' => $tutorId,
                    'title' => $row['title'],
                ],
                [
                    'type' => $row['type'],
                    'file_url' => $row['file_url'],
                    'content' => $row['content'],
                    'approval_status' => $row['approval_status'],
                    'approved_by' => $row['approval_status'] === 'approved' ? $adminId : null,
                    'approved_at' => $row['approval_status'] === 'approved' ? $now : null,
                    'rejection_comment' => $row['rejection_comment'] ?? null,
                ]
            );
        }
    }

    private function ensurePdf(string $source, string $storagePath, string $url): string
    {
        $target = storage_path('app/public/'.$storagePath);

        if (File::exists($source)) {
            File::ensureDirectoryExists(dirname($target));
            File::copy($source, $target);
        }

        return $url;
    }

    private function ensureCurrentWeekSchedules($courseIds): void
    {
        $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $rows = [
            ['course' => 'Penalaran Umum', 'title' => 'Live Class: Strategi Penalaran Umum', 'day' => 0, 'start' => '08:00', 'end' => '09:30'],
            ['course' => 'Pengetahuan dan Pemahaman Umum', 'title' => 'Live Class: Pengetahuan dan Pemahaman Umum', 'day' => 2, 'start' => '10:00', 'end' => '11:30'],
            ['course' => 'Pemahaman Bacaan dan Menulis', 'title' => 'Live Class: Pemahaman Bacaan dan Menulis', 'day' => 4, 'start' => '13:00', 'end' => '14:30'],
        ];

        $tutorIds = DB::table('users')->whereIn('email', ['tutor@bricsedu.id', 'tutor@brics.com'])->pluck('id');

        foreach ($tutorIds as $tutorId) {
            foreach ($rows as $row) {
                $date = $weekStart->copy()->addDays($row['day'])->format('Y-m-d');
                $start = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$row['start']);
                $end = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$row['end']);

                Schedule::updateOrCreate(
                    ['mentor_id' => $tutorId, 'course_id' => $courseIds[$row['course']] ?? null, 'start_time' => $start],
                    [
                        'title' => $row['title'],
                        'type' => 'live',
                        'audience' => 'shared',
                        'meeting_link' => null,
                        'started_at' => null,
                        'end_time' => $end,
                    ]
                );
            }
        }
    }

    private function ensurePastTeachingHistory($courseIds): void
    {
        $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay()->subWeeks(2);
        $rows = [
            ['course' => 'Penalaran Umum', 'title' => 'Review Penalaran Umum: Simpulan Logis', 'day' => 0, 'week' => 0, 'start' => '08:00', 'end' => '09:30', 'link' => 'https://zoom.us/j/2234567101'],
            ['course' => 'Pengetahuan dan Pemahaman Umum', 'title' => 'Review PPU: Ide Pokok dan Kosakata', 'day' => 2, 'week' => 0, 'start' => '10:00', 'end' => '11:30', 'link' => 'https://zoom.us/j/2234567102'],
            ['course' => 'Pemahaman Bacaan dan Menulis', 'title' => 'Review PBM: Struktur Paragraf', 'day' => 4, 'week' => 0, 'start' => '13:00', 'end' => '14:30', 'link' => 'https://zoom.us/j/2234567103'],
            ['course' => 'Penalaran Umum', 'title' => 'Latihan Penalaran Umum: Pola Argumen', 'day' => 0, 'week' => 1, 'start' => '08:00', 'end' => '09:30', 'link' => 'https://zoom.us/j/2234567104'],
            ['course' => 'Pengetahuan dan Pemahaman Umum', 'title' => 'Latihan PPU: Pemahaman Informasi', 'day' => 2, 'week' => 1, 'start' => '10:00', 'end' => '11:30', 'link' => 'https://zoom.us/j/2234567105'],
        ];

        $tutorIds = DB::table('users')->whereIn('email', ['tutor@bricsedu.id', 'tutor@brics.com'])->pluck('id');

        foreach ($tutorIds as $tutorId) {
            foreach ($rows as $row) {
                $date = $weekStart->copy()->addWeeks($row['week'])->addDays($row['day'])->format('Y-m-d');
                $start = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$row['start']);
                $end = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$row['end']);

                Schedule::updateOrCreate(
                    ['mentor_id' => $tutorId, 'course_id' => $courseIds[$row['course']] ?? null, 'start_time' => $start],
                    [
                        'title' => $row['title'],
                        'type' => 'live',
                        'audience' => 'shared',
                        'meeting_link' => $row['link'],
                        'started_at' => $start->copy()->addMinutes(5),
                        'end_time' => $end,
                    ]
                );
            }
        }
    }

    private function syncTutorCourses(string $email, array $courseIds, $now): void
    {
        $tutorId = DB::table('users')->where('email', $email)->value('id');

        if (! $tutorId) {
            return;
        }

        foreach ($courseIds as $courseId) {
            DB::table('course_tutor')->updateOrInsert(
                [
                    'course_id' => $courseId,
                    'tutor_id' => $tutorId,
                ],
                [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
