<?php

use App\Support\AdminNotificationCache;
use App\Support\TutorClassReminder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('TC_TUTOR_SETTINGS_001 tutor menyimpan pengaturan yang digunakan monitor kelas', function () {
    [$course, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->patch(route('tutor.settings.update'), [
            'notifications' => [
                'classReminder' => false,
            ],
            'teaching' => [
                'showProgressWarnings' => false,
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($tutor->fresh()->tutor_settings)->toBe([
        'notifications' => [
            'classReminder' => false,
        ],
        'teaching' => [
            'showProgressWarnings' => false,
        ],
    ]);

    $this->actingAs($tutor)
        ->get(route('tutor.classes.show', Str::slug($course['title'])))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('settings.notifications.classReminder', false)
            ->where('settings.teaching.showProgressWarnings', false));
});

test('TC_TUTOR_REMINDER_001 pengingat kelas dibuat satu kali sepuluh menit sebelum sesi', function () {
    [$course, $tutor] = tutorCourseScenario();
    $now = Carbon::parse('2026-06-01 09:50:00', 'Asia/Jakarta');

    tutorScheduleForTest($tutor, $course, [
        'start_time' => $now->copy()->addMinutes(10)->format('Y-m-d H:i:s'),
        'end_time' => $now->copy()->addMinutes(100)->format('Y-m-d H:i:s'),
    ]);

    expect(AdminNotificationCache::sharedForUser($tutor->id))->toBe([]);

    $reminder = app(TutorClassReminder::class);

    expect($reminder->sendDueReminders($now))->toBe(1)
        ->and($reminder->sendDueReminders($now))->toBe(0)
        ->and(AdminNotificationCache::sharedForUser($tutor->id))->toHaveCount(1);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $tutor->id,
        'title' => 'Pengingat kelas 10 menit lagi',
    ]);
});

test('TC_TUTOR_REMINDER_002 pengingat kelas tidak dibuat saat tutor menonaktifkannya', function () {
    [$course, $tutor] = tutorCourseScenario();
    $now = Carbon::parse('2026-06-01 09:50:00', 'Asia/Jakarta');

    $tutor->update([
        'tutor_settings' => [
            'notifications' => [
                'classReminder' => false,
            ],
            'teaching' => [
                'showProgressWarnings' => true,
            ],
        ],
    ]);

    tutorScheduleForTest($tutor, $course, [
        'start_time' => $now->copy()->addMinutes(10)->format('Y-m-d H:i:s'),
        'end_time' => $now->copy()->addMinutes(100)->format('Y-m-d H:i:s'),
    ]);

    expect(app(TutorClassReminder::class)->sendDueReminders($now))->toBe(0);

    $this->assertDatabaseCount('notifications', 0);
});
