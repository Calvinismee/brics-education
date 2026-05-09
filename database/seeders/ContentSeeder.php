<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $tutorId = DB::table('users')->where('email', 'tutor@bricsedu.id')->value('id');

        if (! $tutorId) {
            return;
        }

        foreach ([
            [
                'title' => 'Video Pembelajaran Matematika Dasar',
                'type' => 'video',
                'course_title' => 'Matematika Dasar',
                'content' => '<p>Video pengantar konsep bilangan dan operasi dasar.</p>',
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Modul Bahasa Indonesia: Teks Eksplanasi',
                'type' => 'module',
                'course_title' => 'Bahasa Indonesia',
                'content' => '<p>Modul ringkas untuk memahami struktur dan contoh teks eksplanasi.</p>',
                'approval_status' => 'pending',
            ],
            [
                'title' => 'Bank Soal IPA - Sistem Pencernaan',
                'type' => 'bank_soal',
                'course_title' => 'IPA Terpadu',
                'content' => '<p>Bank soal evaluasi pemahaman materi sistem pencernaan manusia.</p>',
                'approval_status' => 'rejected',
            ],
        ] as $contentData) {
            DB::table('courses')->updateOrInsert(
                ['title' => $contentData['course_title']],
                [
                    'title' => $contentData['course_title'],
                    'description' => 'Kelas demo untuk kebutuhan seed data.',
                    'price' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $courseId = DB::table('courses')->where('title', $contentData['course_title'])->value('id');

            if (! $courseId) {
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
                    'approved_by' => $contentData['approval_status'] === 'approved' ? $tutorId : null,
                    'approved_at' => $contentData['approval_status'] === 'approved' ? now() : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
