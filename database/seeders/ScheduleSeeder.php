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
        $tutorId = DB::table('users')->where('email', 'tutor@bricsedu.id')->value('id');
        $courseIds = DB::table('courses')->pluck('id', 'title');

        foreach ([
            [
                'course' => 'Matematika Dasar',
                'title' => 'Kelas Matematika Dasar',
                'day' => 'Senin',
                'schedule_date' => '2026-05-11',
                'start_time' => '08:00',
                'end_time' => '10:00',
                'students_count' => 24,
                'meeting_link' => 'https://zoom.us/j/1234567890',
                'status' => 'scheduled',
            ],
            [
                'course' => 'Bahasa Indonesia',
                'title' => 'Kelas Bahasa Indonesia',
                'day' => 'Rabu',
                'schedule_date' => '2026-05-13',
                'start_time' => '13:00',
                'end_time' => '15:00',
                'students_count' => 18,
                'meeting_link' => 'https://zoom.us/j/1234567878',
                'status' => 'ongoing',
            ],
            [
                'course' => 'IPA Terpadu',
                'title' => 'Kelas IPA Terpadu',
                'day' => 'Jumat',
                'schedule_date' => '2026-05-15',
                'start_time' => '15:30',
                'end_time' => '17:30',
                'students_count' => 20,
                'meeting_link' => 'https://zoom.us/j/1234567856',
                'status' => 'completed',
            ],
        ] as $scheduleData) {
            $scheduleDate = Carbon::parse($scheduleData['schedule_date']);
            $courseId = $courseIds[$scheduleData['course']] ?? null;

            Schedule::updateOrCreate(
                [
                    'course' => $scheduleData['course'],
                    'schedule_date' => $scheduleData['schedule_date'],
                ],
                [
                    'course_id' => $courseId,
                    'tutor_id' => $tutorId,
                    'mentor_id' => $tutorId,
                    'title' => $scheduleData['title'],
                    'meeting_link' => $scheduleData['meeting_link'] ?? null,
                    'day' => $scheduleData['day'],
                    'start_time' => Carbon::createFromFormat('Y-m-d H:i', $scheduleDate->format('Y-m-d') . ' ' . $scheduleData['start_time']),
                    'end_time' => Carbon::createFromFormat('Y-m-d H:i', $scheduleDate->format('Y-m-d') . ' ' . $scheduleData['end_time']),
                    'students_count' => $scheduleData['students_count'],
                    
                    'status' => $scheduleData['status'],
                ]
            );
        }
    }
}
