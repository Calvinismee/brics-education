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
                'course' => 'Penalaran Umum',
                'mentor_email' => 'tutor.penalaran.umum@bricsedu.id',
                'title' => 'Kelas Strategi Penalaran Umum',
                'schedule_date' => '2026-05-14',
                'start_time' => '08:00',
                'end_time' => '09:30',
                'meeting_link' => 'https://zoom.us/j/1234567101',
            ],
            [
                'course' => 'Pengetahuan dan Pemahaman Umum',
                'mentor_email' => 'tutor.ppu@bricsedu.id',
                'title' => 'Kelas Pengetahuan dan Pemahaman Umum',
                'schedule_date' => '2026-05-15',
                'start_time' => '10:00',
                'end_time' => '11:30',
                'meeting_link' => 'https://zoom.us/j/1234567102',
            ],
            [
                'course' => 'Pemahaman Bacaan dan Menulis',
                'mentor_email' => 'tutor.pbm@bricsedu.id',
                'title' => 'Kelas Pemahaman Bacaan dan Menulis',
                'schedule_date' => '2026-05-18',
                'start_time' => '13:00',
                'end_time' => '14:30',
                'meeting_link' => 'https://zoom.us/j/1234567103',
            ],
            [
                'course' => 'Pengetahuan Kuantitatif',
                'mentor_email' => 'tutor.kuantitatif@bricsedu.id',
                'title' => 'Kelas Pengetahuan Kuantitatif',
                'schedule_date' => '2026-05-19',
                'start_time' => '15:30',
                'end_time' => '17:00',
                'meeting_link' => 'https://zoom.us/j/1234567104',
            ],
            [
                'course' => 'Literasi dalam Bahasa Indonesia',
                'mentor_email' => 'tutor.literasi.indonesia@bricsedu.id',
                'title' => 'Kelas Literasi Bahasa Indonesia',
                'schedule_date' => '2026-05-20',
                'start_time' => '08:00',
                'end_time' => '09:30',
                'meeting_link' => 'https://zoom.us/j/1234567105',
            ],
            [
                'course' => 'Literasi dalam Bahasa Inggris',
                'mentor_email' => 'tutor.literasi.inggris@bricsedu.id',
                'title' => 'Kelas Literasi Bahasa Inggris',
                'schedule_date' => '2026-05-21',
                'start_time' => '10:00',
                'end_time' => '11:30',
                'meeting_link' => 'https://zoom.us/j/1234567106',
            ],
            [
                'course' => 'Penalaran Matematika',
                'mentor_email' => 'tutor.penalaran.matematika@bricsedu.id',
                'title' => 'Kelas Penalaran Matematika',
                'schedule_date' => '2026-05-22',
                'start_time' => '19:00',
                'end_time' => '20:30',
                'meeting_link' => 'https://zoom.us/j/1234567107',
            ],
        ];

        foreach ($schedules as $scheduleData) {
            $scheduleDate = Carbon::parse($scheduleData['schedule_date']);
            $courseId = $courseIds[$scheduleData['course']] ?? null;
            $mentorId = DB::table('users')->where('email', $scheduleData['mentor_email'])->value('id');

            if ($courseId === null || $mentorId === null) {
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
