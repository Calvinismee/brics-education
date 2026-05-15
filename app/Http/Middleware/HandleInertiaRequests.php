<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $role = $user ? strtolower((string) User::roleNameFor($user->role_id)) : null;
        $isTutor = in_array($role, ['tutor', 'mentor'], true);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'tutorNotifications' => $isTutor
                ? fn () => [
                    'latest' => Notification::query()
                        ->where('user_id', $user->id)
                        ->latest()
                        ->take(5)
                        ->get(['id', 'title', 'message', 'is_read', 'created_at']),
                    'unreadCount' => Notification::query()
                        ->where('user_id', $user->id)
                        ->where('is_read', false)
                        ->count(),
                ]
                : null,
        ];
    }
}
