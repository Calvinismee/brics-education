<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = DB::table('transactions')
            ->select(
                'transactions.id',
                'transactions.invoice_number',
                'transactions.amount',
                'transactions.payment_method',
                'transactions.payment_status',
                'transactions.paid_at',
                'transactions.created_at',
                'users.name as student',
                'courses.title as course'
            )
            ->leftJoin('users', 'transactions.user_id', 'users.id')
            ->leftJoin('courses', 'transactions.course_id', 'courses.id')
            ->orderByDesc('transactions.created_at')
            ->paginate(20)
            ->withQueryString();

        $transactions->getCollection()->transform(function ($t) {
            $status = $t->payment_status;
            $mapped = in_array($status, ['paid', 'success'], true) ? 'success' : ($status === 'failed' ? 'failed' : 'pending');

            return [
                'id' => $t->invoice_number ?? (string) $t->id,
                'student' => $t->student ?? '-',
                'course' => $t->course ?? '-',
                'amount' => 'Rp '.number_format((float) $t->amount, 0, ',', '.'),
                'method' => $t->payment_method ?? '-',
                'status' => $mapped,
                'date' => Carbon::parse($t->created_at)->format('Y-m-d H:i'),
            ];
        });

        $totalTransactions = DB::table('transactions')->count();
        $totalRevenue = (float) DB::table('transactions')
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status::text IN ('paid', 'success') THEN amount ELSE 0 END), 0) as total_revenue")
            ->value('total_revenue');
        $successToday = DB::table('transactions')
            ->whereRaw("payment_status::text IN ('paid', 'success')")
            ->count();
        $pendingToday = DB::table('transactions')
            ->where('payment_status', 'pending')
            ->count();
        $failedToday = DB::table('transactions')
            ->where('payment_status', 'failed')
            ->count();
        $pendingPayments = DB::table('transactions')->where('payment_status', 'pending')->count();

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions,
            'stats' => [
                'totalTransactions' => $totalTransactions,
                'totalRevenue' => $totalRevenue,
                'pendingPayments' => $pendingPayments,
                'successToday' => $successToday,
                'pendingToday' => $pendingToday,
                'failedToday' => $failedToday,
            ],
        ]);
    }

    public function stats()
    {
        $now = Carbon::now();

        // Build list of last 6 months (oldest -> newest)
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $now->copy()->subMonthsNoOverflow($i)->startOfMonth();
            $months[] = $m;
        }

        $start = $now->copy()->subMonthsNoOverflow(5)->startOfMonth();

        // Monthly revenue data
        $rows = DB::table('transactions')
            ->selectRaw("date_trunc('month', created_at) as month, COALESCE(SUM(CASE WHEN payment_status::text IN ('paid', 'success') THEN amount ELSE 0 END), 0) as total")
            ->where('created_at', '>=', $start)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy(function ($r) {
                return Carbon::parse($r->month)->format('Y-m');
            });

        $stats = [];
        foreach ($months as $m) {
            $key = $m->format('Y-m');
            $amount = isset($rows[$key]) ? (float) $rows[$key]->total : 0;
            $stats[] = [
                'period' => $m->copy()->locale('id')->translatedFormat('M Y'),
                'periodKey' => $key,
                'amount' => $amount,
            ];
        }

        $totalRevenue = array_sum(array_column($stats, 'amount'));
        $monthsWithTransactions = count(array_filter($stats, fn ($s) => $s['amount'] > 0));
        $averageTransaction = $monthsWithTransactions ? $totalRevenue / max(1, $monthsWithTransactions) : 0;

        // Calculate growth comparing last month to previous month
        $latest = end($stats);
        $prev = prev($stats) ?: ['amount' => 0];
        $growth = 0;
        if ($prev['amount'] > 0) {
            $growth = ($latest['amount'] - $prev['amount']) / $prev['amount'] * 100;
        } elseif ($latest['amount'] > 0) {
            $growth = 100;
        }

        // Payment methods breakdown
        $methodBreakdown = DB::table('transactions')
            ->selectRaw('payment_method, COALESCE(SUM(amount), 0) as amount, COUNT(*) as count')
            ->groupBy('payment_method')
            ->orderByDesc('amount')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => ucwords(str_replace('_', ' ', $item->payment_method ?? 'Unknown')),
                    'amount' => (float) $item->amount,
                    'count' => (int) $item->count,
                ];
            })
            ->toArray();

        // Calculate percentages
        $totalAmount = array_sum(array_column($methodBreakdown, 'amount')) ?: 1;
        $paymentMethods = array_map(function ($m) use ($totalAmount) {
            return [
                'method' => $m['method'],
                'amount' => $m['amount'],
                'pct' => round(($m['amount'] / $totalAmount) * 100),
                'count' => $m['count'],
            ];
        }, $methodBreakdown);

        // Success rate calculation
        $successCount = DB::table('transactions')->where('payment_status', 'success')->count();
        $totalCount = DB::table('transactions')->count();
        $successRate = $totalCount > 0 ? ($successCount / $totalCount) * 100 : 0;

        // Recent transactions
        $recentTx = DB::table('transactions')
            ->select('transactions.id', 'transactions.invoice_number', 'transactions.amount', 'transactions.payment_method', 'transactions.payment_status', 'transactions.created_at', 'users.name as student', 'courses.title as course')
            ->leftJoin('users', 'transactions.user_id', 'users.id')
            ->leftJoin('courses', 'transactions.course_id', 'courses.id')
            ->orderByDesc('transactions.created_at')
            ->limit(5)
            ->get();

        $recentTransactions = $recentTx->map(function ($t) {
            $status = $t->payment_status;
            $mapped = in_array($status, ['paid', 'success'], true) ? 'success' : ($status === 'failed' ? 'failed' : 'pending');

            return [
                'id' => $t->invoice_number ?? (string) $t->id,
                'student' => $t->student ?? '-',
                'course' => $t->course ?? '-',
                'amount' => (float) $t->amount,
                'method' => ucwords(str_replace('_', ' ', $t->payment_method ?? '-')),
                'status' => $mapped,
                'date' => Carbon::parse($t->created_at)->format('d M Y'),
            ];
        })->toArray();

        return Inertia::render('Admin/TransactionStats', [
            'stats' => $stats,
            'summary' => [
                'monthlyRevenue' => $stats,
                'averageTransaction' => round($averageTransaction, 2),
                'transactionGrowth' => round($growth, 2),
                'totalRevenue' => $totalRevenue,
            ],
            'paymentMethods' => $paymentMethods,
            'successRate' => round($successRate, 1),
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
