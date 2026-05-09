<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ShareNotifications
{
    private const CACHE_TTL_SECONDS = 60;

    private static function cacheKey(int $userId): string
    {
        return 'notifications:shared:' . $userId;
    }

    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            $userId = auth()->id();
            $notifications = Cache::remember(self::cacheKey($userId), self::CACHE_TTL_SECONDS, function () use ($userId) {
                return DB::table('notifications')
                    ->where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get()
                    ->toArray();
            });

            Inertia::share([
                'notifications' => $notifications,
            ]);
        }

        return $next($request);
    }
}
