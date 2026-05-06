<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get role IDs
        $studentRole = \Illuminate\Support\Facades\DB::table('roles')->where('name', 'student')->first()?->id ?? 1;
        $tutorRole = \Illuminate\Support\Facades\DB::table('roles')->where('name', 'tutor')->first()?->id ?? 2;
        $adminRole = \Illuminate\Support\Facades\DB::table('roles')->where('name', 'admin')->first()?->id ?? 3;

        // Create 3 users: student, tutor, and admin
        User::create([
            'name' => 'Siswa Brics',
            'email' => 'siswa@bricsedu.id',
            'password' => bcrypt('password123'),
            'role_id' => $studentRole,
            'role' => 'student',
        ]);

        User::create([
            'name' => 'Tutor Brics',
            'email' => 'tutor@bricsedu.id',
            'password' => bcrypt('password123'),
            'role_id' => $tutorRole,
            'role' => 'tutor',
        ]);

        User::create([
            'name' => 'Admin Brics',
            'email' => 'admin@bricsedu.id',
            'password' => bcrypt('password123'),
            'role_id' => $adminRole,
            'role' => 'admin',
        ]);
    }
}
