<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get role IDs
        $studentRole = DB::table('roles')->where('name', 'student')->value('id') ?? 1;
        $tutorRole = DB::table('roles')->where('name', 'mentor')->value('id') ?? 2;
        $adminRole = DB::table('roles')->where('name', 'admin')->value('id') ?? 3;

        // Seed core users for admin, students, and mentors mapped to courses.
        foreach ([
            ['name' => 'Siswa Brics', 'email' => 'siswa@bricsedu.id', 'role_id' => $studentRole],
            ['name' => 'Siswa Dua', 'email' => 'siswa2@bricsedu.id', 'role_id' => $studentRole],
            ['name' => 'Siswa Tiga', 'email' => 'siswa3@bricsedu.id', 'role_id' => $studentRole],
            ['name' => 'Tutor Matematika', 'email' => 'tutor.math@bricsedu.id', 'role_id' => $tutorRole],
            ['name' => 'Tutor Bahasa', 'email' => 'tutor.bahasa@bricsedu.id', 'role_id' => $tutorRole],
            ['name' => 'Tutor IPA', 'email' => 'tutor.ipa@bricsedu.id', 'role_id' => $tutorRole],
            ['name' => 'Tutor Umum', 'email' => 'tutor@bricsedu.id', 'role_id' => $tutorRole],
            ['name' => 'Admin Brics', 'email' => 'admin@bricsedu.id', 'role_id' => $adminRole],
        ] as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password123'),
                    'role_id' => $userData['role_id'],
                ]
            );
        }

        $this->call([
            PackageSeeder::class,
            ContentSeeder::class,
            ScheduleSeeder::class,
            TransactionSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
