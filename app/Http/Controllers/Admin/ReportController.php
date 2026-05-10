<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function export()
    {
        $reports = DB::table('report_exports')
            ->leftJoin('users', 'report_exports.user_id', '=', 'users.id')
            ->orderByDesc('report_exports.created_at')
            ->limit(50)
            ->get([
                'report_exports.id',
                'report_exports.type',
                'report_exports.title',
                'report_exports.file_name',
                'report_exports.row_count',
                'report_exports.created_at',
                'users.name as created_by',
            ])
            ->map(fn ($report) => [
                'id' => $report->id,
                'title' => $report->title,
                'type' => $report->type,
                'createdBy' => $report->created_by ?? 'Admin',
                'createdAt' => Carbon::parse($report->created_at)->format('d M Y H:i'),
                'fileName' => $report->file_name,
                'rowCount' => (int) $report->row_count,
                'status' => 'Selesai',
            ]);

        $lastExport = DB::table('report_exports')->latest('created_at')->value('created_at');

        return Inertia::render('Admin/ReportsExport', [
            'reports' => $reports,
            'stats' => [
                'lastExport' => $lastExport
                    ? Carbon::parse($lastExport)->format('d M Y H:i')
                    : null,
                'availableReports' => DB::table('report_exports')->count(),
            ],
        ]);
    }
}
