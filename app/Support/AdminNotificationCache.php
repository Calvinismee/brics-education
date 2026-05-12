<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminNotificationCache
{
    private const SHARED_CACHE_TTL_SECONDS = 60;

    private const STATS_CACHE_TTL_SECONDS = 60;

    private static function sharedCacheKey(int $userId): string
    {
        return 'notifications:shared:'.$userId;
    }

    private static function statsCacheKey(int $userId): string
    {
        return 'notifications:stats:'.$userId;
    }

    public static function sharedForUser(int $userId): array
    {
        return Cache::remember(self::sharedCacheKey($userId), self::SHARED_CACHE_TTL_SECONDS, function () use ($userId) {
            return DB::table('notifications')
                ->select('id', 'title', 'message', 'is_read', 'created_at')
                ->where('user_id', $userId)
                ->orderBy('is_read')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
                ->map(fn ($notification) => [
                    'id' => (int) $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'is_read' => (bool) $notification->is_read,
                    'created_at' => $notification->created_at,
                ])
                ->all();
        });
    }

    public static function statsForUser(int $userId): array
    {
        return Cache::remember(self::statsCacheKey($userId), self::STATS_CACHE_TTL_SECONDS, function () use ($userId) {
            $stats = DB::table('notifications')
                ->where('user_id', $userId)
                ->selectRaw('COUNT(*) as total_notifications')
                ->selectRaw('COALESCE(SUM(CASE WHEN is_read = ? THEN 1 ELSE 0 END), 0) as unread_count', [false])
                ->first();

            return [
                'unreadCount' => (int) ($stats->unread_count ?? 0),
                'totalNotifications' => (int) ($stats->total_notifications ?? 0),
            ];
        });
    }

    public static function forgetForUser(int $userId): void
    {
        Cache::forget(self::sharedCacheKey($userId));
        Cache::forget(self::statsCacheKey($userId));
    }
}
