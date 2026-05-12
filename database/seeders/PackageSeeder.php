<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $courseCatalog = [
            [
                'title' => 'Matematika Dasar',
                'description' => 'Fondasi konsep numerik, aljabar dasar, dan latihan penalaran kuantitatif.',
                'price' => 149000,
                'status' => 'published',
            ],
            [
                'title' => 'Bahasa Indonesia',
                'description' => 'Pemahaman bacaan, penalaran verbal, dan strategi menjawab soal literasi.',
                'price' => 149000,
                'status' => 'published',
            ],
            [
                'title' => 'IPA Terpadu',
                'description' => 'Ringkasan materi inti IPA dengan latihan soal dan pembahasan konsep.',
                'price' => 179000,
                'status' => 'published',
            ],
        ];

        foreach ($courseCatalog as $courseData) {
            DB::table('courses')->updateOrInsert(
                ['title' => $courseData['title']],
                [
                    'description' => $courseData['description'],
                    'price' => $courseData['price'],
                    'status' => $courseData['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        foreach ([
            [
                'name' => 'Paket Dasar',
                'price' => '149000',
                'description' => 'Paket pengenalan untuk siswa yang ingin mulai dari fondasi utama.',
                'features' => ['Akses video pembelajaran', 'Latihan soal dasar', 'Forum diskusi'],
                'courses' => ['Matematika Dasar'],
                'popular' => false,
            ],
            [
                'name' => 'Paket Intensif',
                'price' => '249000',
                'description' => 'Paket kombinasi untuk siswa yang ingin belajar rutin dengan dua course inti.',
                'features' => ['Akses video pembelajaran', 'Live class mingguan', 'Konsultasi mentor'],
                'courses' => ['Matematika Dasar', 'Bahasa Indonesia'],
                'popular' => true,
            ],
            [
                'name' => 'Paket Premium',
                'price' => '399000',
                'description' => 'Paket lengkap dengan seluruh course utama untuk persiapan yang lebih menyeluruh.',
                'features' => ['Semua fitur Paket Intensif', 'Simulasi ujian', 'Prioritas review mentor'],
                'courses' => ['Matematika Dasar', 'Bahasa Indonesia', 'IPA Terpadu'],
                'popular' => false,
            ],
        ] as $packageData) {
            $courseTitles = $packageData['courses'];
            unset($packageData['courses']);

            $package = Package::updateOrCreate(
                ['name' => $packageData['name']],
                [
                    'price' => $packageData['price'],
                    'description' => $packageData['description'],
                    'features' => $packageData['features'],
                    'popular' => $packageData['popular'],
                ]
            );

            $courseIds = DB::table('courses')
                ->whereIn('title', $courseTitles)
                ->pluck('id')
                ->all();

            $package->courses()->sync($courseIds);
        }
    }
}
