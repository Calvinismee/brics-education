<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProgressRecord;
use App\Models\User;
use App\Models\Course;

class ProgressSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();
        if (!$user) return;

        $courses = Course::limit(2)->get();
        foreach ($courses as $i => $course) {
            ProgressRecord::updateOrCreate(
                ['user_id' => $user->id, 'course_id' => $course->id],
                ['percent' => [25, 50][$i] ?? 0, 'status' => 'started']
            );
        }
    }
}
