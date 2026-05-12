<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('packages')
            ->whereIn('name', ['Paket Dasar', 'Paket Intensif', 'Paket Premium'])
            ->delete();

        DB::table('courses')
            ->whereIn('title', ['Matematika Dasar', 'Bahasa Indonesia', 'IPA Terpadu'])
            ->delete();

        $categories = [
            'Tes Potensi Skolastik' => 'Subtes SNBT untuk mengukur kemampuan bernalar, memahami informasi, dan menggunakan konsep kuantitatif.',
            'Tes Literasi' => 'Subtes SNBT untuk mengukur kemampuan memahami, mengevaluasi, dan menggunakan teks serta penalaran matematika.',
        ];

        foreach ($categories as $name => $description) {
            DB::table('categories')->updateOrInsert(
                ['name' => $name],
                [
                    'description' => $description,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $categoryIds = DB::table('categories')
            ->whereIn('name', array_keys($categories))
            ->pluck('id', 'name');

        $courseCatalog = [
            [
                'category' => 'Tes Potensi Skolastik',
                'title' => 'Penalaran Umum',
                'description' => 'Latihan memahami pola, argumen, simpulan, dan strategi bernalar untuk soal TPS SNBT.',
            ],
            [
                'category' => 'Tes Potensi Skolastik',
                'title' => 'Pengetahuan dan Pemahaman Umum',
                'description' => 'Penguatan kosakata, ide pokok, hubungan antargagasan, dan pemahaman informasi umum.',
            ],
            [
                'category' => 'Tes Potensi Skolastik',
                'title' => 'Pemahaman Bacaan dan Menulis',
                'description' => 'Strategi membaca efektif, menyunting kalimat, dan memahami struktur teks akademik.',
            ],
            [
                'category' => 'Tes Potensi Skolastik',
                'title' => 'Pengetahuan Kuantitatif',
                'description' => 'Konsep bilangan, aljabar, data, geometri dasar, dan latihan penalaran kuantitatif.',
            ],
            [
                'category' => 'Tes Literasi',
                'title' => 'Literasi dalam Bahasa Indonesia',
                'description' => 'Pemahaman teks Bahasa Indonesia, evaluasi informasi, dan penarikan simpulan berbasis bacaan.',
            ],
            [
                'category' => 'Tes Literasi',
                'title' => 'Literasi dalam Bahasa Inggris',
                'description' => 'Reading comprehension, vocabulary in context, inference, and academic text analysis.',
            ],
            [
                'category' => 'Tes Literasi',
                'title' => 'Penalaran Matematika',
                'description' => 'Penerapan konsep matematika dalam konteks masalah, data, grafik, dan situasi sehari-hari.',
            ],
        ];

        foreach ($courseCatalog as $courseData) {
            DB::table('courses')->updateOrInsert(
                ['title' => $courseData['title']],
                [
                    'category_id' => $categoryIds[$courseData['category']] ?? null,
                    'description' => $courseData['description'],
                    'price' => 99000,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $courseIds = DB::table('courses')
            ->whereIn('title', array_column($courseCatalog, 'title'))
            ->pluck('id')
            ->all();

        $package = Package::updateOrCreate(
            ['name' => 'Paket Persiapan SNBT'],
            [
                'price' => '499000',
                'description' => 'Paket lengkap persiapan SNBT yang mencakup seluruh subtes TPS dan Literasi.',
                'features' => [
                    'Akses semua course TPS dan Literasi',
                    'Materi konsep dan strategi pengerjaan soal',
                    'Bank soal bertahap dengan pembahasan',
                    'Jadwal live class bersama tutor',
                    'Simulasi dan evaluasi progres belajar',
                ],
                'popular' => true,
            ]
        );

        $package->courses()->sync($courseIds);
    }
}
