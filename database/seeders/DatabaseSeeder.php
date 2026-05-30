<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Cache::forget('roles:map');
        Cache::forget('roles:id-map');

        foreach (['student', 'mentor', 'admin'] as $roleName) {
            DB::table('roles')->updateOrInsert(
                ['name' => $roleName],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Get role IDs
        $tutorRole = DB::table('roles')->where('name', 'mentor')->value('id') ?? 2;
        $adminRole = DB::table('roles')->where('name', 'admin')->value('id') ?? 3;

        $this->call([
            UserSeeder::class,
        ]);

        // Seed core users for admin and SNBT mentors mapped to courses.
        foreach ([
            ['name' => 'Tutor Penalaran Umum', 'email' => 'tutor.penalaran.umum@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'mentor'],
            ['name' => 'Tutor Pengetahuan Umum', 'email' => 'tutor.ppu@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'mentor'],
            ['name' => 'Tutor Bacaan dan Menulis', 'email' => 'tutor.pbm@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'mentor'],
            ['name' => 'Tutor Kuantitatif', 'email' => 'tutor.kuantitatif@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'mentor'],
            ['name' => 'Tutor Literasi Indonesia', 'email' => 'tutor.literasi.indonesia@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'mentor'],
            ['name' => 'Tutor Literasi Inggris', 'email' => 'tutor.literasi.inggris@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'mentor'],
            ['name' => 'Tutor Penalaran Matematika', 'email' => 'tutor.penalaran.matematika@bricsedu.id', 'role_id' => $tutorRole, 'role' => 'mentor'],
            ['name' => 'Admin Brics', 'email' => 'admin@bricsedu.id', 'role_id' => $adminRole, 'role' => 'admin'],
        ] as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password123'),
                    'role_id' => $userData['role_id'],
                ]
            );

            DB::table('users')
                ->where('email', $userData['email'])
                ->update([
                    'role' => $userData['role'],
                    'updated_at' => now(),
                ]);
        }

        $this->call([
            PackageSeeder::class,
        ]);

        $devTutorCourseId = DB::table('courses')->where('title', 'Penalaran Umum')->value('id');

        User::updateOrCreate(
            ['email' => 'tutor@bricsedu.id'],
            [
                'name' => 'Tutor Dev',
                'password' => bcrypt('password123'),
                'role_id' => $tutorRole,
                'mentor_course_id' => $devTutorCourseId,
            ]
        );

        DB::table('users')
            ->where('email', 'tutor@bricsedu.id')
            ->update([
                'role' => 'mentor',
                'updated_at' => now(),
            ]);

        User::updateOrCreate(
            ['email' => 'tutor@brics.com'],
            [
                'name' => 'Tutor Dev Alias',
                'password' => bcrypt('password123'),
                'role_id' => $tutorRole,
                'mentor_course_id' => $devTutorCourseId,
            ]
        );

        DB::table('users')
            ->where('email', 'tutor@brics.com')
            ->update([
                'role' => 'mentor',
                'updated_at' => now(),
            ]);

        $this->call([
            ContentSeeder::class,
            ScheduleSeeder::class,
            TutorDemoDataSeeder::class,
            TransactionSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
