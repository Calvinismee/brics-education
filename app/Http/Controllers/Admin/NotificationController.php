<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class NotificationController extends Controller
{
    private const STATS_CACHE_TTL_SECONDS = 60;

    private static function sharedCacheKey(int $userId): string
    {
        return 'notifications:shared:' . $userId;
    }

    private static function statsCacheKey(int $userId): string
    {
        return 'notifications:stats:' . $userId;
    }

    private static function clearCaches(int $userId): void
    {
        Cache::forget(self::sharedCacheKey($userId));
        Cache::forget(self::statsCacheKey($userId));
    }

    public function index()
    {
        $userId = auth()->id();
        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $stats = Cache::remember(self::statsCacheKey($userId), self::STATS_CACHE_TTL_SECONDS, function () use ($userId) {
            return [
                'unreadCount' => Notification::where('user_id', $userId)
                    ->where('is_read', false)
                    ->count(),
                'totalNotifications' => Notification::where('user_id', $userId)
                    ->count(),
            ];
        });

        return Inertia::render('Admin/Notifications', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);

        $userId = auth()->id();

        if ($notification->user_id !== $userId) {
            abort(403);
        }

        $notification->update(['is_read' => true]);
        self::clearCaches($userId);

        return back();
    }

    public function markAllAsRead()
    {
        $userId = auth()->id();

        Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        self::clearCaches($userId);

        return back();
    }
}
