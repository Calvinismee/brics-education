<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Support\AdminNotificationCache;
use App\Support\DatabaseBoolean;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Notifications', [
            'notifications' => $notifications,
            'stats' => AdminNotificationCache::statsForUser((int) $userId),
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);

        $userId = auth()->id();

        if ($notification->user_id !== $userId) {
            abort(403);
        }

        $notification->update(['is_read' => DatabaseBoolean::value(true)]);
        AdminNotificationCache::forgetForUser((int) $userId);

        return back();
    }

    public function markAllAsRead()
    {
        $userId = auth()->id();

        Notification::where('user_id', $userId)
            ->where('is_read', DatabaseBoolean::value(false))
            ->update(['is_read' => DatabaseBoolean::value(true)]);

        AdminNotificationCache::forgetForUser((int) $userId);

        return back();
    }
}
