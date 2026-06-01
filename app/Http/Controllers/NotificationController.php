<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Support\DatabaseBoolean;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAllAsRead(Request $request): RedirectResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', DatabaseBoolean::value(false))
            ->update(['is_read' => DatabaseBoolean::value(true)]);

        return back();
    }
}
