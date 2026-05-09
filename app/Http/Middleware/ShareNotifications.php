<?php

namespace App\Http\Middleware;

use App\Support\AdminNotificationCache;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShareNotifications
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {
            $userId = (int) $request->user()->id;

            Inertia::share([
                'notifications' => fn () => AdminNotificationCache::sharedForUser($userId),
            ]);
        }

        return $next($request);
    }
}
