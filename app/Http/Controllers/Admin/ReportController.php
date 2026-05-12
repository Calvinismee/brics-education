<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function export(Request $request)
    {
        $dateFrom = $request->date('dateFrom');
        $dateTo = $request->date('dateTo');

        $baseQuery = DB::table('report_exports')
            ->leftJoin('users', 'report_exports.user_id', '=', 'users.id')
            ->when($dateFrom, fn ($query) => $query->where('report_exports.created_at', '>=', $dateFrom->copy()->startOfDay()))
            ->when($dateTo, fn ($query) => $query->where('report_exports.created_at', '<=', $dateTo->copy()->endOfDay()));

        $reports = (clone $baseQuery)
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

        $lastExport = (clone $baseQuery)
            ->latest('report_exports.created_at')
            ->value('report_exports.created_at');

        return Inertia::render('Admin/ReportsExport', [
            'reports' => $reports,
            'filters' => [
                'dateFrom' => $dateFrom?->toDateString() ?? '',
                'dateTo' => $dateTo?->toDateString() ?? '',
            ],
            'stats' => [
                'lastExport' => $lastExport
                    ? Carbon::parse($lastExport)->format('d M Y H:i')
                    : null,
                'availableReports' => (clone $baseQuery)->count('report_exports.id'),
            ],
        ]);
    }
}
