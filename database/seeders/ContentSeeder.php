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
                'title' => 'Video Pembelajaran Matematika Dasar',
                'type' => 'video',
                'course_title' => 'Matematika Dasar',
                'tutor_email' => 'tutor.math@bricsedu.id',
                'content' => 'Video pengantar konsep bilangan dan operasi dasar.',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Modul Bahasa Indonesia: Teks Eksplanasi',
                'type' => 'module',
                'course_title' => 'Bahasa Indonesia',
                'tutor_email' => 'tutor.bahasa@bricsedu.id',
                'content' => 'Modul ringkas untuk memahami struktur dan contoh teks eksplanasi.',
                'approval_status' => 'pending',
            ],
            [
                'title' => 'Bank Soal IPA - Sistem Pencernaan',
                'type' => 'bank_soal',
                'course_title' => 'IPA Terpadu',
                'tutor_email' => 'tutor.ipa@bricsedu.id',
                'content' => 'Bank soal evaluasi pemahaman materi sistem pencernaan manusia.',
                'approval_status' => 'rejected',
                'rejection_comment' => 'Tambahkan pembahasan jawaban dan perbaiki beberapa pertanyaan yang ambigu.',
            ],
            [
                'title' => 'Ringkasan Numerasi Lanjutan',
                'type' => 'module',
                'course_title' => 'Matematika Dasar',
                'tutor_email' => 'tutor.math@bricsedu.id',
                'content' => 'Ringkasan konsep numerasi lanjutan dengan latihan bertahap.',
                'approval_status' => 'pending',
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
