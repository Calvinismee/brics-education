<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $mentorId = DB::table('users')->where('email', 'tutor@bricsedu.id')->value('id');
        $courseIds = DB::table('courses')->pluck('id', 'title');

        $schedules = [
            [
                'course' => 'Matematika Dasar',
                'title' => 'Kelas Matematika Dasar',
                'schedule_date' => '2026-05-11',
                'start_time' => '08:00',
                'end_time' => '10:00',
                'meeting_link' => 'https://zoom.us/j/1234567890',
            ],
            [
                'course' => 'Bahasa Indonesia',
                'title' => 'Kelas Bahasa Indonesia',
                'schedule_date' => '2026-05-13',
                'start_time' => '13:00',
                'end_time' => '15:00',
                'meeting_link' => 'https://zoom.us/j/1234567878',
            ],
            [
                'course' => 'IPA Terpadu',
                'title' => 'Kelas IPA Terpadu',
                'schedule_date' => '2026-05-15',
                'start_time' => '15:30',
                'end_time' => '17:30',
                'meeting_link' => 'https://zoom.us/j/1234567856',
            ],
        ];

        foreach ($schedules as $scheduleData) {
            $scheduleDate = Carbon::parse($scheduleData['schedule_date']);
            $courseId = $courseIds[$scheduleData['course']] ?? null;

            if ($courseId === null) {
                // Skip schedules for unknown courses
                continue;
            }

            $start = Carbon::createFromFormat('Y-m-d H:i', $scheduleDate->format('Y-m-d') . ' ' . $scheduleData['start_time']);
            $end = Carbon::createFromFormat('Y-m-d H:i', $scheduleDate->format('Y-m-d') . ' ' . $scheduleData['end_time']);

            Schedule::updateOrCreate(
                [
                    'course_id' => $courseId,
                    'start_time' => $start,
                ],
                [
                    'course_id' => $courseId,
                    'mentor_id' => $mentorId,
                    'title' => $scheduleData['title'],
                    'meeting_link' => $scheduleData['meeting_link'] ?? null,
                    'start_time' => $start,
                    'end_time' => $end,
                ]
            );
        }
    }
}
