<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Package;
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

        // Seed core users and a few students for admin views
        foreach ([
            ['name' => 'Siswa Brics', 'email' => 'siswa@bricsedu.id', 'role_id' => $studentRole, 'role' => 'student'],
            ['name' => 'Siswa Dua', 'email' => 'siswa2@bricsedu.id', 'role_id' => $studentRole, 'role' => 'student'],
            ['name' => 'Siswa Tiga', 'email' => 'siswa3@bricsedu.id', 'role_id' => $studentRole, 'role' => 'student'],
            ['name' => 'Tutor Brics', 'email' => 'tutor@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'tutor'],
            ['name' => 'Admin Brics', 'email' => 'admin@bricsedu.id', 'role_id' => $adminRole, 'role' => 'admin'],
        ] as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password123'),
                    'role_id' => $userData['role_id'],
                    'role' => $userData['role'],
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
