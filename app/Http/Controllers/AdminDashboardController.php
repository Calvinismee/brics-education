<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    private const DASHBOARD_CACHE_KEY = 'admin:dashboard:overview:v3';

    private const DASHBOARD_CACHE_TTL_SECONDS = 300;

    public function index()
    {
        $dashboardData = Cache::remember(
            self::DASHBOARD_CACHE_KEY,
            self::DASHBOARD_CACHE_TTL_SECONDS,
            fn () => $this->dashboardData(),
        );

        return Inertia::render('Admin/Dashboard', [
            ...$dashboardData,
        ]);
    }

    private function dashboardData(): array
    {
        $now = CarbonImmutable::now();
        $oneMonthAgo = $now->subMonthNoOverflow();
        $oneWeekAgo = $now->subDays(7);
        $roleIds = User::adminRoleIds();
        $metrics = $this->userMetrics($roleIds, $now, $oneMonthAgo, $oneWeekAgo);

        $totalUsers = (int) ($metrics->total_users ?? 0);
        $studentCount = (int) ($metrics->student_count ?? 0);
        $tutorCount = (int) ($metrics->tutor_count ?? 0);
        $adminCount = (int) ($metrics->admin_count ?? 0);
        $newRegistrations = (int) ($metrics->new_registrations ?? 0);
        $activeUsers = (int) ($metrics->active_users ?? 0);
        $previousMonthTotal = (int) ($metrics->previous_month_total ?? 0);

        $growthPercent = $previousMonthTotal > 0
            ? round(((($totalUsers - $previousMonthTotal) / $previousMonthTotal) * 100), 1)
            : 0;

        $growthData = array_map(
            fn (int $index) => (int) ($metrics->{'growth_month_'.$index} ?? 0),
            range(0, 5),
        );
        $growthLabels = $this->monthLabels($now);

        $recentUsers = User::query()
            ->select('id', 'name', 'role_id', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($user) use ($now) {
                $lastActivity = $user->updated_at ?? $user->created_at;

                return [
                    'name' => $user->name,
                    'role' => ucfirst(User::roleNameFor($user->role_id)),
                    'courses' => rand(1, 5),
                    'progress' => rand(45, 97),
                    'status' => $lastActivity && $lastActivity->diffInDays($now) <= 7 ? 'Aktif' : 'Tidak Aktif',
                ];
            });

        return [
            'userStats' => [
                [
                    'label' => 'Total Pengguna',
                    'value' => number_format($totalUsers),
                    'change' => '+'.$growthPercent.'%',
                ],
                [
                    'label' => 'Registrasi Baru',
                    'value' => number_format($newRegistrations),
                    'change' => '+12.5%',
                ],
            ],
            'growthData' => $growthData,
            'growthLabels' => $growthLabels,
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
                ['label' => 'Siswa', 'value' => $studentCount, 'pct' => $this->percentage($studentCount, $totalUsers), 'color' => '#691D1B'],
                ['label' => 'Tutor/Mentor', 'value' => $tutorCount, 'pct' => $this->percentage($tutorCount, $totalUsers), 'color' => '#CD9B1D'],
                ['label' => 'Admin', 'value' => $adminCount, 'pct' => $this->percentage($adminCount, $totalUsers), 'color' => '#D8D7BE'],
            ],
        ];
    }

    private function userMetrics(array $roleIds, CarbonImmutable $now, CarbonImmutable $oneMonthAgo, CarbonImmutable $oneWeekAgo): object
    {
        $query = DB::table('users')
            ->selectRaw('COUNT(*) as total_users')
            ->selectRaw('COALESCE(SUM(CASE WHEN role_id = ? THEN 1 ELSE 0 END), 0) as student_count', [$roleIds['student']])
            ->selectRaw('COALESCE(SUM(CASE WHEN role_id = ? THEN 1 ELSE 0 END), 0) as tutor_count', [$roleIds['tutor']])
            ->selectRaw('COALESCE(SUM(CASE WHEN role_id = ? THEN 1 ELSE 0 END), 0) as admin_count', [$roleIds['admin']])
            ->selectRaw('COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) as new_registrations', [$oneMonthAgo])
            ->selectRaw('COALESCE(SUM(CASE WHEN updated_at >= ? THEN 1 ELSE 0 END), 0) as active_users', [$oneWeekAgo])
            ->selectRaw('COALESCE(SUM(CASE WHEN created_at < ? THEN 1 ELSE 0 END), 0) as previous_month_total', [$oneMonthAgo]);

        foreach (range(0, 5) as $index) {
            $monthStart = $now->subMonthsNoOverflow(5 - $index)->startOfMonth();
            $nextMonthStart = $monthStart->addMonth();

            $query->selectRaw(
                "COALESCE(SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END), 0) as growth_month_{$index}",
                [$monthStart, $nextMonthStart],
            );
        }

        return $query->first();
    }

    private function monthLabels(CarbonImmutable $now): array
    {
        return array_map(
            fn (int $index) => $now
                ->subMonthsNoOverflow(5 - $index)
                ->locale('id')
                ->translatedFormat('M'),
            range(0, 5),
        );
    }

    private function percentage(int $value, int $total): int
    {
        if ($total <= 0) {
            return 0;
        }

        return (int) round(($value / $total) * 100);
    }
}
