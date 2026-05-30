<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TutorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->updateOrInsert(
            ['name' => 'mentor'],
            [
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $tutorRoleId = DB::table('roles')->where('name', 'mentor')->value('id') ?? 2;
        $devTutorCourseId = DB::table('courses')->where('title', 'Penalaran Umum')->value('id');

        foreach ($this->tutors($devTutorCourseId) as $tutor) {
            $values = [
                'name' => $tutor['name'],
                'password' => bcrypt('password123'),
                'role_id' => $tutorRoleId,
            ];

            if (! empty($tutor['mentor_course_id'])) {
                $values['mentor_course_id'] = $tutor['mentor_course_id'];
            }

            User::updateOrCreate(
                ['email' => $tutor['email']],
                $values
            );

            DB::table('users')->where('email', $tutor['email'])->update([
                'role' => 'mentor',
                'updated_at' => now(),
            ]);
        }
    }

    public static function devTutorEmails(): array
    {
        return ['tutor@bricsedu.id', 'tutor@brics.com'];
    }

    private function tutors(?int $devTutorCourseId): array
    {
        return [
            ['name' => 'Tutor Penalaran Umum', 'email' => 'tutor.penalaran.umum@bricsedu.id'],
            ['name' => 'Tutor Pengetahuan Umum', 'email' => 'tutor.ppu@bricsedu.id'],
            ['name' => 'Tutor Bacaan dan Menulis', 'email' => 'tutor.pbm@bricsedu.id'],
            ['name' => 'Tutor Kuantitatif', 'email' => 'tutor.kuantitatif@bricsedu.id'],
            ['name' => 'Tutor Literasi Indonesia', 'email' => 'tutor.literasi.indonesia@bricsedu.id'],
            ['name' => 'Tutor Literasi Inggris', 'email' => 'tutor.literasi.inggris@bricsedu.id'],
            ['name' => 'Tutor Penalaran Matematika', 'email' => 'tutor.penalaran.matematika@bricsedu.id'],
            ['name' => 'Tutor Dev', 'email' => 'tutor@bricsedu.id', 'mentor_course_id' => $devTutorCourseId],
            ['name' => 'Tutor Dev Alias', 'email' => 'tutor@brics.com', 'mentor_course_id' => $devTutorCourseId],
        ];
    }
}
