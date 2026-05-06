<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Notifications', [
            'notifications' => [],
            'stats' => [
                'unreadCount' => 0,
                'totalNotifications' => 0,
            ],
        ]);
    }
}
