<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            [
                'name' => 'Paket Dasar',
                'price' => '149000',
                'description' => 'Cocok untuk siswa yang ingin mulai belajar dengan materi inti dan pendampingan dasar.',
                'features' => ['Akses video pembelajaran', 'Latihan soal dasar', 'Forum diskusi'],
                'popular' => false,
            ],
            [
                'name' => 'Paket Intensif',
                'price' => '249000',
                'description' => 'Pilihan untuk siswa yang ingin jadwal belajar lebih padat dengan pendampingan mentor.',
                'features' => ['Akses video pembelajaran', 'Live class mingguan', 'Konsultasi mentor'],
                'popular' => true,
            ],
            [
                'name' => 'Paket Premium',
                'price' => '399000',
                'description' => 'Paket lengkap untuk persiapan ujian dengan akses materi, kelas, dan review progres.',
                'features' => ['Semua fitur Paket Intensif', 'Simulasi ujian', 'Prioritas review mentor'],
                'popular' => false,
            ],
        ] as $packageData) {
            Package::updateOrCreate(
                ['name' => $packageData['name']],
                [
                    'price' => $packageData['price'],
                    'description' => $packageData['description'],
                    'features' => $packageData['features'],
                    'popular' => $packageData['popular'],
                ]
            );
        }
    }
}
