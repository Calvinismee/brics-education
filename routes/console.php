<?php

use App\Support\TutorClassReminder;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    DB::select('SELECT 1');
})->daily();

Artisan::command('tutor:send-class-reminders', function () {
    $createdCount = app(TutorClassReminder::class)->sendDueReminders();

    $this->info("{$createdCount} pengingat kelas tutor dikirim.");
})->purpose('Kirim pengingat 10 menit sebelum live class dan konsultasi tutor');

Schedule::command('tutor:send-class-reminders')
    ->everyMinute()
    ->withoutOverlapping();
