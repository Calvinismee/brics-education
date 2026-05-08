<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class TransactionController extends Controller
{
    public function index()
    {
        $rows = DB::table('transactions')
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
            ->get();

        $transactions = $rows->map(function ($t) {
            $status = $t->payment_status;
            $mapped = in_array($status, ['paid', 'success'], true) ? 'success' : ($status === 'failed' ? 'failed' : 'pending');

            return [
                'id' => $t->invoice_number ?? (string) $t->id,
                'student' => $t->student ?? '-',
                'course' => $t->course ?? '-',
                'amount' => 'Rp ' . number_format((float) $t->amount, 0, ',', '.'),
                'method' => $t->payment_method ?? '-',
                'status' => $mapped,
                'date' => Carbon::parse($t->created_at)->format('Y-m-d H:i'),
            ];
        })->toArray();

        $totalTransactions = count($transactions);
        $totalRevenue = $rows->where('payment_status', 'paid')->sum('amount');
        $pendingPayments = $rows->where('payment_status', 'pending')->count();

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions,
            'stats' => [
                'totalTransactions' => $totalTransactions,
                'totalRevenue' => $totalRevenue,
                'pendingPayments' => $pendingPayments,
            ],
        ]);
    }

    public function stats()
    {
        $now = Carbon::now();

        // Build list of last 6 months (oldest -> newest)
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $months[] = $m;
        }

        $start = $now->copy()->subMonths(5)->startOfMonth();

        // Monthly revenue data
        $rows = DB::table('transactions')
            ->selectRaw("date_trunc('month', created_at) as month, COALESCE(SUM(amount),0) as total")
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
                'period' => $m->format('M Y'),
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
        $allTransactions = DB::table('transactions')->get();
        $methodBreakdown = [];
        if (count($allTransactions) > 0) {
            $grouped = $allTransactions->groupBy('payment_method');
            foreach ($grouped as $method => $items) {
                $amount = $items->sum('amount');
                $methodBreakdown[] = [
                    'method' => ucwords(str_replace('_', ' ', $method ?? 'Unknown')),
                    'amount' => (float) $amount,
                    'count' => count($items),
                ];
            }
            // Sort by amount descending
            usort($methodBreakdown, fn ($a, $b) => $b['amount'] <=> $a['amount']);
        }

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
        $successCount = $allTransactions->where('payment_status', 'success')->count();
        $totalCount = count($allTransactions);
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
