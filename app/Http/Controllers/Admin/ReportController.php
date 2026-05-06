<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function export()
    {
        return Inertia::render('Admin/ReportsExport', [
            'reports' => [],
            'stats' => [
                'lastExport' => null,
                'availableReports' => 0,
            ],
        ]);
    }
}
