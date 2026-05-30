<?php

namespace Database\Seeders;

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

        $this->call([
            UserSeeder::class,
            AdminSeeder::class,
        ]);

        $this->call([
            PackageSeeder::class,
            TutorSeeder::class,
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
