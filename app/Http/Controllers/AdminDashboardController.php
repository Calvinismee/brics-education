<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Get user statistics with optimized queries
        $totalUsers = User::count();
        $newRegistrations = User::where('created_at', '>=', now()->subMonth())->count();
        $activeUsers = User::where('updated_at', '>=', now()->subDays(7))->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        return Inertia::render('Admin/Dashboard', [
            'summaryCards' => [
                ['label' => 'Total siswa', 'value' => number_format($totalUsers), 'note' => '+12% vs bulan lalu'],
                ['label' => 'Mentor aktif', 'value' => number_format($activeUsers), 'note' => '8 mentor sedang online'],
                ['label' => 'Transaksi hari ini', 'value' => 'Rp 24,8 jt', 'note' => '92% settled'],
                ['label' => 'Konten menunggu review', 'value' => '18', 'note' => '6 item urgent'],
            ],
            'activityFeed' => [
                ['title' => 'Pembayaran paket intensif berhasil', 'meta' => '2 menit lalu', 'tone' => 'success'],
                ['title' => '3 konten baru menunggu validasi', 'meta' => '15 menit lalu', 'tone' => 'warning'],
                ['title' => 'Jadwal mentor diperbarui', 'meta' => '1 jam lalu', 'tone' => 'neutral'],
                ['title' => 'Laporan bulanan siap diekspor', 'meta' => '3 jam lalu', 'tone' => 'neutral'],
            ],
            'taskQueue' => [
                ['label' => 'Validasi materi matematika', 'status' => 'Urgent'],
                ['label' => 'Tinjau transaksi pending', 'status' => 'Pending'],
                ['label' => 'Update notifikasi sistem', 'status' => 'Pending'],
            ],
        ]);
    }
}
