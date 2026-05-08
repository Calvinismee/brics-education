<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ShareNotifications
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            $notifications = DB::table('notifications')
                ->where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->toArray();

            Inertia::share([
                'notifications' => $notifications,
            ]);
        }

        return $next($request);
    }
}
