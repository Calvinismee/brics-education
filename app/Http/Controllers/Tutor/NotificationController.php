<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Schedule;
use App\Support\AdminNotificationCache;
use App\Support\DatabaseBoolean;
use App\Support\TutorCourseResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $notifications = Notification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Tutor/TutorNotifications', [
            'user' => $user,
            'tutorClasses' => $this->courseSummaries($user),
            'notifications' => $notifications,
            'stats' => [
                'total' => Notification::query()->where('user_id', $user->id)->count(),
                'unread' => Notification::query()->where('user_id', $user->id)->where('is_read', DatabaseBoolean::value(false))->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless((int) $notification->user_id === (int) $request->user()->id, 403);

        $notification->update(['is_read' => DatabaseBoolean::value(true)]);
        AdminNotificationCache::forgetForUser((int) $request->user()->id);

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', DatabaseBoolean::value(false))
            ->update(['is_read' => DatabaseBoolean::value(true)]);
        AdminNotificationCache::forgetForUser((int) $request->user()->id);

        return back();
    }

    private function courseSummaries($user)
    {
        return Course::query()
            ->withCount([
                'materials',
                'materials as approved_materials_count' => fn ($query) => $query->where('approval_status', 'approved'),
            ])
            ->whereIn('id', $this->tutorCourseIds($user))
            ->orderBy('title')
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'name' => $course->title,
                'students' => Enrollment::query()
                    ->where('course_id', $course->id)
                    ->where('status', 'active')
                    ->count(),
                'weeklySchedule' => TutorCourseResolver::currentWeekScheduleLabel($user, $course->id),
            ]);
    }

    private function tutorCourseIds($user)
    {
        return TutorCourseResolver::ids($user);
    }
}
