<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->updateOrInsert(
            ['name' => 'student'],
            [
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $studentRoleId = DB::table('roles')->where('name', 'student')->value('id') ?? 1;

        foreach ($this->students() as $student) {
            User::updateOrCreate(
                ['email' => $student['email']],
                [
                    'name' => $student['name'],
                    'password' => bcrypt('password123'),
                    'role_id' => $studentRoleId,
                ]
            );

            DB::table('users')->where('email', $student['email'])->update([
                'role' => 'student',
                'updated_at' => now(),
            ]);
        }
    }

    public static function studentEmails(): array
    {
        return array_column(self::students(), 'email');
    }

    private static function students(): array
    {
        return [
            ['name' => 'Siswa Brics', 'email' => 'siswa@bricsedu.id'],
            ['name' => 'Siswa Dua', 'email' => 'siswa2@bricsedu.id'],
            ['name' => 'Siswa Tiga', 'email' => 'siswa3@bricsedu.id'],
        ];
    }
}
