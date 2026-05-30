<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->updateOrInsert(
            ['name' => 'admin'],
            [
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $adminRoleId = DB::table('roles')->where('name', 'admin')->value('id') ?? 3;

        User::updateOrCreate(
            ['email' => 'admin@bricsedu.id'],
            [
                'name' => 'Admin Brics',
                'password' => bcrypt('password123'),
                'role_id' => $adminRoleId,
            ]
        );

        DB::table('users')->where('email', 'admin@bricsedu.id')->update([
            'role' => 'admin',
            'updated_at' => now(),
        ]);
    }
}
