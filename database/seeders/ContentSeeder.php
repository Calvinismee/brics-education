<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            [
                'title' => 'Video Strategi Penalaran Umum',
                'type' => 'video',
                'course_title' => 'Penalaran Umum',
                'tutor_email' => 'tutor.penalaran.umum@bricsedu.id',
                'content' => 'Video pengantar pola argumen, simpulan logis, dan teknik eliminasi jawaban.',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Modul Pengetahuan dan Pemahaman Umum',
                'type' => 'module',
                'course_title' => 'Pengetahuan dan Pemahaman Umum',
                'tutor_email' => 'tutor.ppu@bricsedu.id',
                'content' => 'Modul ringkas kosakata, ide pokok, hubungan antargagasan, dan pemahaman informasi umum.',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Latihan Pemahaman Bacaan dan Menulis',
                'type' => 'bank_soal',
                'course_title' => 'Pemahaman Bacaan dan Menulis',
                'tutor_email' => 'tutor.pbm@bricsedu.id',
                'content' => 'Latihan menyunting kalimat, memahami struktur paragraf, dan menentukan informasi penting.',
                'approval_status' => 'pending',
            ],
            [
                'title' => 'Bank Soal Pengetahuan Kuantitatif',
                'type' => 'bank_soal',
                'course_title' => 'Pengetahuan Kuantitatif',
                'tutor_email' => 'tutor.kuantitatif@bricsedu.id',
                'content' => 'Bank soal bilangan, aljabar, data, dan geometri dasar dengan tingkat kesulitan bertahap.',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Modul Literasi Bahasa Indonesia',
                'type' => 'module',
                'course_title' => 'Literasi dalam Bahasa Indonesia',
                'tutor_email' => 'tutor.literasi.indonesia@bricsedu.id',
                'content' => 'Panduan membaca kritis, mengevaluasi informasi, dan menyimpulkan gagasan dari teks panjang.',
                'approval_status' => 'pending',
            ],
            [
                'title' => 'Video Literasi Bahasa Inggris',
                'type' => 'video',
                'course_title' => 'Literasi dalam Bahasa Inggris',
                'tutor_email' => 'tutor.literasi.inggris@bricsedu.id',
                'content' => 'Video reading comprehension, vocabulary in context, inference, dan academic text analysis.',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Drill Penalaran Matematika Kontekstual',
                'type' => 'bank_soal',
                'course_title' => 'Penalaran Matematika',
                'tutor_email' => 'tutor.penalaran.matematika@bricsedu.id',
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
                    'file_url' => null,
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
}
