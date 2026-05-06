<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ContentController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Content', [
            'contents' => [],
            'stats' => [
                'totalContent' => 0,
                'pendingReview' => 0,
                'published' => 0,
            ],
        ]);
    }
}
