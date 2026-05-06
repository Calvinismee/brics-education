<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Schedule', [
            'schedules' => [],
            'stats' => [
                'totalClasses' => 0,
                'upcomingClasses' => 0,
                'activeInstructors' => 0,
            ],
        ]);
    }
}
