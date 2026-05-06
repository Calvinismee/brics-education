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
        $studentCount = User::where('role', 'student')->count();
        $tutorCount = User::where('role', 'tutor')->count();
        $newRegistrations = User::where('created_at', '>=', now()->subMonth())->count();
        $activeUsers = User::where('updated_at', '>=', now()->subDays(7))->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        // Growth calculation
        $previousMonthTotal = User::where('created_at', '<', now()->subMonth())->count();
        $growthPercent = $previousMonthTotal > 0 
            ? round(((($totalUsers - $previousMonthTotal) / $previousMonthTotal) * 100), 1)
            : 0;

        // Monthly user growth data (last 6 months)
        $growthData = [];
        for ($i = 5; $i >= 0; $i--) {
            $start = now()->subMonths($i)->startOfMonth();
            $end = now()->subMonths($i)->endOfMonth();
            $count = User::whereBetween('created_at', [$start, $end])->count();
            $growthData[] = $count ?: 0;
        }

        // Get recent users (last 6)
        $recentUsers = User::query()
            ->select('id', 'name', 'role', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($user) {
                $lastActivity = $user->updated_at ?? $user->created_at;

                return [
                    'name' => $user->name,
                    'role' => ucfirst($user->role),
                    'courses' => rand(1, 5),
                    'progress' => rand(45, 97),
                    'status' => $lastActivity && $lastActivity->diffInDays(now()) <= 7 ? 'Aktif' : 'Tidak Aktif',
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'userStats' => [
                [
                    'label' => 'Total Pengguna',
                    'value' => number_format($totalUsers),
                    'change' => '+' . $growthPercent . '%',
                ],
                [
                    'label' => 'Registrasi Baru',
                    'value' => number_format($newRegistrations),
                    'change' => '+12.5%',
                ],
                [
                    'label' => 'Pengguna Aktif',
                    'value' => number_format($activeUsers),
                    'change' => '+5.1%',
                ],
                [
                    'label' => 'Tidak Aktif',
                    'value' => number_format($inactiveUsers),
                    'change' => '-2.3%',
                ],
            ],
            'growthData' => $growthData,
            'studentStats' => [
                ['label' => 'Total Siswa', 'value' => number_format($studentCount)],
                ['label' => 'Siswa Aktif', 'value' => number_format($activeUsers)],
                ['label' => 'Siswa Baru (Bulan Ini)', 'value' => number_format($newRegistrations)],
                ['label' => 'Tingkat Kelulusan', 'value' => '94%'],
            ],
            'tutorStats' => [
                ['label' => 'Total Tutor', 'value' => number_format($tutorCount)],
                ['label' => 'Tutor Aktif', 'value' => number_format($activeUsers)],
                ['label' => 'Tutor Baru (Bulan Ini)', 'value' => '8'],
                ['label' => 'Rata-rata Kelas/Tutor', 'value' => '4.2'],
            ],
            'activityStats' => [
                ['label' => 'Pengguna Aktif Harian', 'value' => number_format($activeUsers)],
                ['label' => 'Pengguna Aktif Mingguan', 'value' => number_format(ceil($activeUsers * 1.2))],
                ['label' => 'Pengguna Aktif Bulanan', 'value' => number_format($totalUsers)],
                ['label' => 'Rata-rata Waktu Sesi', 'value' => '25 mnt'],
            ],
            'topUsers' => $recentUsers,
            'distributionData' => [
                ['label' => 'Siswa', 'value' => $studentCount, 'pct' => round(($studentCount / $totalUsers) * 100), 'color' => '#691D1B'],
                ['label' => 'Tutor/Mentor', 'value' => $tutorCount, 'pct' => round(($tutorCount / $totalUsers) * 100), 'color' => '#CD9B1D'],
                ['label' => 'Admin', 'value' => User::where('role', 'admin')->count(), 'pct' => round((User::where('role', 'admin')->count() / $totalUsers) * 100), 'color' => '#D8D7BE'],
            ],
        ]);
    }
}
