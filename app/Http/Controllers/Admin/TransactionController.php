<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Transactions', [
            'transactions' => [],
            'stats' => [
                'totalTransactions' => 0,
                'totalRevenue' => 0,
                'pendingPayments' => 0,
            ],
        ]);
    }

    public function stats()
    {
        return Inertia::render('Admin/TransactionStats', [
            'data' => [],
            'stats' => [
                'monthlyRevenue' => 0,
                'averageTransaction' => 0,
                'transactionGrowth' => 0,
            ],
        ]);
    }
}
