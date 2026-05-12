<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $courseIds = DB::table('courses')->pluck('id', 'title');

        $schedules = [
            [
                'course' => 'Matematika Dasar',
                'mentor_email' => 'tutor.math@bricsedu.id',
                'title' => 'Kelas Matematika Dasar',
                'schedule_date' => '2026-05-11',
                'start_time' => '08:00',
                'end_time' => '10:00',
                'meeting_link' => 'https://zoom.us/j/1234567890',
            ],
            [
                'course' => 'Bahasa Indonesia',
                'mentor_email' => 'tutor.bahasa@bricsedu.id',
                'title' => 'Kelas Bahasa Indonesia',
                'schedule_date' => '2026-05-13',
                'start_time' => '13:00',
                'end_time' => '15:00',
                'meeting_link' => 'https://zoom.us/j/1234567878',
            ],
            [
                'course' => 'IPA Terpadu',
                'mentor_email' => 'tutor.ipa@bricsedu.id',
                'title' => 'Kelas IPA Terpadu',
                'schedule_date' => '2026-05-15',
                'start_time' => '15:30',
                'end_time' => '17:30',
                'meeting_link' => 'https://zoom.us/j/1234567856',
            ],
            [
                'course' => 'Matematika Dasar',
                'mentor_email' => 'tutor.math@bricsedu.id',
                'title' => 'Kelas Drill Matematika',
                'schedule_date' => '2026-05-18',
                'start_time' => '19:00',
                'end_time' => '20:30',
                'meeting_link' => 'https://zoom.us/j/1234567899',
            ],
        ];

        foreach ($schedules as $scheduleData) {
            $scheduleDate = Carbon::parse($scheduleData['schedule_date']);
            $courseId = $courseIds[$scheduleData['course']] ?? null;
            $mentorId = DB::table('users')->where('email', $scheduleData['mentor_email'])->value('id');

            if ($courseId === null || $mentorId === null) {
                // Skip schedules for unknown courses
                continue;
            }

            DB::table('users')->where('id', $mentorId)->update([
                'mentor_course_id' => $courseId,
                'updated_at' => now(),
            ]);

            $start = Carbon::createFromFormat('Y-m-d H:i', $scheduleDate->format('Y-m-d').' '.$scheduleData['start_time']);
            $end = Carbon::createFromFormat('Y-m-d H:i', $scheduleDate->format('Y-m-d').' '.$scheduleData['end_time']);

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
