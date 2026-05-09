<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    private const DASHBOARD_CACHE_KEY = 'admin:dashboard:overview';

    private const DASHBOARD_CACHE_TTL_SECONDS = 300;

    public function index()
    {
        $dashboardData = Cache::remember(self::DASHBOARD_CACHE_KEY, self::DASHBOARD_CACHE_TTL_SECONDS, function () {
            $totalUsers = User::count();
            $studentRoleId = User::roleIdFor('student') ?? 1;
            $tutorRoleId = User::roleIdFor('tutor') ?? 2;
            $adminRoleId = User::roleIdFor('admin') ?? 3;

            $studentCount = User::where('role_id', $studentRoleId)->count();
            $tutorCount = User::where('role_id', $tutorRoleId)->count();
            $adminCount = User::where('role_id', $adminRoleId)->count();
            $newRegistrations = User::where('created_at', '>=', now()->subMonth())->count();
            $activeUsers = User::where('updated_at', '>=', now()->subDays(7))->count();
            $inactiveUsers = $totalUsers - $activeUsers;

            $previousMonthTotal = User::where('created_at', '<', now()->subMonth())->count();
            $growthPercent = $previousMonthTotal > 0
                ? round(((($totalUsers - $previousMonthTotal) / $previousMonthTotal) * 100), 1)
                : 0;

            $growthData = [];
            for ($i = 5; $i >= 0; $i--) {
                $start = now()->subMonths($i)->startOfMonth();
                $end = now()->subMonths($i)->endOfMonth();
                $count = User::whereBetween('created_at', [$start, $end])->count();
                $growthData[] = $count ?: 0;
            }

            $recentUsers = User::query()
                ->select('id', 'name', 'role_id', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->limit(6)
                ->get()
                ->map(function ($user) {
                    $lastActivity = $user->updated_at ?? $user->created_at;

                    return [
                        'name' => $user->name,
                        'role' => ucfirst(User::roleNameFor($user->role_id)),
                        'courses' => rand(1, 5),
                        'progress' => rand(45, 97),
                        'status' => $lastActivity && $lastActivity->diffInDays(now()) <= 7 ? 'Aktif' : 'Tidak Aktif',
                    ];
                });

            return [
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
                'topUsers' => $recentUsers->values()->all(),
                'distributionData' => [
                    ['label' => 'Siswa', 'value' => $studentCount, 'pct' => round(($studentCount / $totalUsers) * 100), 'color' => '#691D1B'],
                    ['label' => 'Tutor/Mentor', 'value' => $tutorCount, 'pct' => round(($tutorCount / $totalUsers) * 100), 'color' => '#CD9B1D'],
                    ['label' => 'Admin', 'value' => $adminCount, 'pct' => round(($adminCount / $totalUsers) * 100), 'color' => '#D8D7BE'],
                ],
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            ...$dashboardData,
        ]);
    }
}
