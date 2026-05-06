<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Packages', [
            'packages' => [],
            'stats' => [
                'totalPackages' => 0,
                'activePackages' => 0,
                'revenue' => 0,
            ],
        ]);
    }
}
