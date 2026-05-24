<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ContentSeeder extends Seeder
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

        foreach ([
            [
                'title' => 'Video Strategi Penalaran Umum',
                'type' => 'video',
                'course_title' => 'Penalaran Umum',
                'tutor_email' => 'tutor.penalaran.umum@bricsedu.id',
                'content' => self::DEMO_YOUTUBE_URL,
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Modul Pengetahuan dan Pemahaman Umum',
                'type' => 'module',
                'course_title' => 'Pengetahuan dan Pemahaman Umum',
                'tutor_email' => 'tutor.ppu@bricsedu.id',
                'file_url' => $materiPdfUrl,
                'content' => 'Modul ringkas kosakata, ide pokok, hubungan antargagasan, dan pemahaman informasi umum.',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Latihan Pemahaman Bacaan dan Menulis',
                'type' => 'bank_soal',
                'course_title' => 'Pemahaman Bacaan dan Menulis',
                'tutor_email' => 'tutor.pbm@bricsedu.id',
                'file_url' => $latihanSoalPdfUrl,
                'content' => 'Latihan menyunting kalimat, memahami struktur paragraf, dan menentukan informasi penting.',
                'approval_status' => 'pending',
            ],
            [
                'title' => 'Bank Soal Pengetahuan Kuantitatif',
                'type' => 'bank_soal',
                'course_title' => 'Pengetahuan Kuantitatif',
                'tutor_email' => 'tutor.kuantitatif@bricsedu.id',
                'file_url' => $latihanSoalPdfUrl,
                'content' => 'Bank soal bilangan, aljabar, data, dan geometri dasar dengan tingkat kesulitan bertahap.',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Modul Literasi Bahasa Indonesia',
                'type' => 'module',
                'course_title' => 'Literasi dalam Bahasa Indonesia',
                'tutor_email' => 'tutor.literasi.indonesia@bricsedu.id',
                'file_url' => $materiPdfUrl,
                'content' => 'Panduan membaca kritis, mengevaluasi informasi, dan menyimpulkan gagasan dari teks panjang.',
                'approval_status' => 'pending',
            ],
            [
                'title' => 'Video Literasi Bahasa Inggris',
                'type' => 'video',
                'course_title' => 'Literasi dalam Bahasa Inggris',
                'tutor_email' => 'tutor.literasi.inggris@bricsedu.id',
                'content' => self::DEMO_YOUTUBE_URL,
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Drill Penalaran Matematika Kontekstual',
                'type' => 'bank_soal',
                'course_title' => 'Penalaran Matematika',
                'tutor_email' => 'tutor.penalaran.matematika@bricsedu.id',
                'file_url' => $latihanSoalPdfUrl,
                'content' => 'Drill soal grafik, tabel, peluang, dan penerapan matematika pada situasi sehari-hari.',
                'approval_status' => 'rejected',
                'rejection_comment' => 'Tambahkan pembahasan pada soal grafik dan perjelas sumber data pada stimulus.',
            ],
        ] as $contentData) {
            $tutorId = DB::table('users')->where('email', $contentData['tutor_email'])->value('id');
            $courseId = DB::table('courses')->where('title', $contentData['course_title'])->value('id');

            if (! $courseId || ! $tutorId) {
                continue;
            }

            DB::table('materials')->updateOrInsert(
                ['title' => $contentData['title']],
                [
                    'course_id' => $courseId,
                    'uploaded_by' => $tutorId,
                    'title' => $contentData['title'],
                    'type' => $contentData['type'],
                    'file_url' => $contentData['file_url'] ?? null,
                    'content' => $contentData['content'],
                    'approval_status' => $contentData['approval_status'],
                    'rejection_comment' => $contentData['rejection_comment'] ?? null,
                    'approved_by' => $contentData['approval_status'] === 'approved'
                        ? DB::table('users')->where('email', 'admin@bricsedu.id')->value('id')
                        : null,
                    'approved_at' => $contentData['approval_status'] === 'approved' ? now() : null,
                    'created_at' => now(),
                    'updated_at' => now(),
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
}
