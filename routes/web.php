<?php

use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\TutorHistoryController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Tutor\ClassMonitoringController as TutorClassMonitoringController;
use App\Http\Controllers\Tutor\DashboardController as TutorDashboardController;
use App\Http\Controllers\Tutor\MaterialController as TutorMaterialController;
use App\Http\Controllers\Tutor\NotificationController as TutorNotificationController;
use App\Http\Controllers\Tutor\ScheduleController as TutorScheduleController;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Package;
use App\Models\Schedule;
use App\Models\Transaction;
use App\Models\User;
use App\Services\PackageEnrollmentService;
use App\Support\AdminNotifier;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $packages = Package::with([
        'courses' => fn ($query) => $query
            ->with('category')
            ->where('status', 'active')
            ->orderBy('title'),
    ])
        ->whereHas('courses', fn ($query) => $query->where('status', 'active'))
        ->orderByDesc('popular')
        ->orderBy('name')
        ->get();

    return Inertia::render('LandingPage', [
        'packages' => $packages,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/course/{course}', function (Course $course) {
    $course->load('category');

    return Inertia::render('CourseDetail', [
        'course' => $course,
    ]);
})->name('course.detail');

Route::get('/checkout/package/{package}', function (Package $package) {
    $package->load([
        'courses' => fn ($query) => $query
            ->with('category')
            ->where('status', 'active')
            ->orderBy('title'),
    ]);

    return Inertia::render('Checkout', [
        'learningPackage' => $package,
    ]);
})->middleware('auth')->name('checkout.package');

Route::get('/checkout/{course}', fn () => redirect('/#katalog'))
    ->whereNumber('course');

Route::post('/checkout', function (Request $request) {
    $request->validate([
        'package_id' => ['required', 'exists:packages,id'],
        'payment_method' => ['required', 'string'],
    ]);

    $user = Auth::user();

    if (! $user) {
        return redirect()->route('login');
    }

    $package = Package::withCount([
        'courses as active_courses_count' => fn ($query) => $query->where('status', 'active'),
    ])->findOrFail($request->package_id);

    if ($package->active_courses_count < 1) {
        return back()->withErrors([
            'package_id' => 'Paket ini belum memiliki course aktif.',
        ]);
    }

    $transaction = Transaction::create([
        'user_id' => $user->id,
        'course_id' => null,
        'package_id' => $package->id,
        'invoice_number' => sprintf('INV-%s-%04d', now()->format('YmdHis'), random_int(0, 9999)),
        'amount' => $package->price,
        'payment_method' => $request->payment_method,
        'payment_status' => 'pending',
    ]);

    AdminNotifier::transactionPending($user, 'Paket: '.$package->name, $transaction->invoice_number);

    return redirect("/payment-status/{$transaction->id}");
})->middleware('auth')->name('checkout');

Route::get('/payment-status/{transaction}', function (Transaction $transaction) {
    $transaction->load([
        'course.category',
        'package.courses.category',
    ]);

    return Inertia::render('PaymentStatus', [
        'transaction' => $transaction,
    ]);
})->name('payment.status');

Route::post('/payment-status/{transaction}/confirm', function (Transaction $transaction) {
    $transaction->load(['course', 'package']);
    $previousStatus = $transaction->payment_status;

    $transaction->update([
        'payment_status' => 'success',
        'paid_at' => now(),
    ]);

    if ($transaction->package_id) {
        $enrollments = app(PackageEnrollmentService::class)->enroll($transaction->user_id, $transaction->package_id);
        $transaction->update([
            'enrollment_id' => $enrollments->first()->id ?? null,
        ]);
    } elseif ($transaction->course_id) {
        $enrollment = Enrollment::updateOrCreate(
            [
                'user_id' => $transaction->user_id,
                'course_id' => $transaction->course_id,
            ],
            [
                'status' => 'active',
                'enrolled_at' => now(),
            ]
        );

        $transaction->update([
            'enrollment_id' => $enrollment->id,
        ]);
    }

    $student = User::find($transaction->user_id);

    if ($student && ! in_array($previousStatus, ['paid', 'success'], true)) {
        AdminNotifier::transactionSucceeded(
            $student,
            $transaction->package ? 'Paket: '.$transaction->package->name : ($transaction->course?->title ?? 'course terkait'),
            $transaction->invoice_number
        );
    }

    return redirect()
        ->to('/payment-status/'.$transaction->id)
        ->with('success', 'Pembayaran berhasil dikonfirmasi dan paket telah aktif.');
})->name('payment.confirm');

Route::get('/dashboard', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();

    $role = strtolower((string) User::roleNameFor($user->role_id));

    if ($role !== 'student') {
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if (in_array($role, ['tutor', 'mentor'], true)) {
            return redirect()->route('tutor.dashboard');
        }

        return redirect()->route('login');
    }

    $enrollments = Enrollment::with([
        'package:id,name',
        'course' => function ($courseQuery) {
            $courseQuery
                ->with('category')
                ->withCount([
                    'materials as approved_materials_count' => function ($materialQuery) {
                        $materialQuery->where('approval_status', 'approved');
                    },
                ]);
        },
    ])
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

    $transactions = Transaction::with(['course.category', 'package.courses.category'])
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

    $availablePackages = Package::with([
        'courses' => fn ($query) => $query
            ->with('category')
            ->where('status', 'active')
            ->orderBy('title'),
    ])
        ->whereHas('courses', fn ($query) => $query->where('status', 'active'))
        ->orderByDesc('popular')
        ->orderBy('name')
        ->get();

    $activeCourseIds = $enrollments
        ->where('status', 'active')
        ->whereNotNull('package_id')
        ->pluck('course_id');

    $schedules = Schedule::with(['course.category', 'mentor'])
        ->whereIn('course_id', $activeCourseIds)
        ->orderBy('start_time')
        ->take(3)
        ->get();

    $materials = Material::with('course:id,title')
        ->whereIn('course_id', $activeCourseIds)
        ->where('approval_status', 'approved')
        ->latest()
        ->take(5)
        ->get(['id', 'course_id', 'title', 'type', 'file_url', 'content', 'created_at']);

    return Inertia::render('StudentDashboard', [
        'user' => $user,
        'enrollments' => $enrollments,
        'transactions' => $transactions,
        'availablePackages' => $availablePackages,
        'schedules' => $schedules,
        'materials' => $materials,
        'notifications' => Notification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'message', 'is_read', 'created_at']),
    ]);
})->name('dashboard');

Route::get('/course/{course}/learn', function (Course $course) {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();

    $role = strtolower((string) User::roleNameFor($user->role_id));

    if ($role !== 'student') {
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if (in_array($role, ['tutor', 'mentor'], true)) {
            return redirect()->route('tutor.dashboard');
        }

        return redirect()->route('login');
    }

    $enrollment = Enrollment::where('user_id', $user->id)
        ->where('course_id', $course->id)
        ->where('status', 'active')
        ->first();

    if (! $enrollment) {
        return redirect()
            ->to('/course/'.$course->id)
            ->withErrors([
                'course' => 'Kamu belum memiliki akses aktif ke course ini.',
            ]);
    }

    $course->load('category');

    $materials = Material::where('course_id', $course->id)
        ->where('approval_status', 'approved')
        ->orderBy('created_at')
        ->get();

    $enrollments = Enrollment::with([
        'package:id,name',
        'course' => function ($courseQuery) {
            $courseQuery
                ->with('category')
                ->withCount([
                    'materials as approved_materials_count' => function ($materialQuery) {
                        $materialQuery->where('approval_status', 'approved');
                    },
                ]);
        },
    ])
        ->where('user_id', $user->id)
        ->where('status', 'active')
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('CourseLearn', [
        'user' => $user,
        'course' => $course,
        'materials' => $materials,
        'enrollment' => $enrollment,
        'enrollments' => $enrollments,
    ]);
})->name('course.learn');

Route::get('/student/schedules', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();

    $role = strtolower((string) User::roleNameFor($user->role_id));

    if ($role !== 'student') {
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if (in_array($role, ['tutor', 'mentor'], true)) {
            return redirect()->route('tutor.dashboard');
        }

        return redirect()->route('login');
    }

    $activeCourseIds = Enrollment::where('user_id', $user->id)
        ->where('status', 'active')
        ->pluck('course_id');

    $schedules = Schedule::with(['course.category', 'mentor'])
        ->whereIn('course_id', $activeCourseIds)
        ->orderBy('start_time')
        ->get();

    return Inertia::render('StudentSchedules', [
        'user' => $user,
        'schedules' => $schedules,
    ]);
})->name('student.schedules');

Route::get('/login', fn () => Inertia::render('Auth/LoginSiswa'))->name('login');
Route::get('/login/tutor', fn () => Inertia::render('Auth/LoginTutor'))->name('login.tutor');
Route::get('/login/admin', fn () => Inertia::render('Auth/LoginAdmin'))->name('login.admin');

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', function () {
            return redirect()->route('admin.dashboard');
        })->name('home');

        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::match(['post', 'put'], '/users/{user}', [UserController::class, 'update'])->whereNumber('user')->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->whereNumber('user')->name('users.destroy');
        Route::get('/users/export', [UserController::class, 'export'])->name('users.export');
        Route::get('/packages', [PackageController::class, 'index'])->name('packages');
        Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
        Route::put('/packages/{package}', [PackageController::class, 'update'])->whereNumber('package')->name('packages.update');
        Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->whereNumber('package')->name('packages.destroy');
        Route::get('/courses', [CourseController::class, 'index'])->name('courses');
        Route::get('/content', [ContentController::class, 'index'])->name('content');
        Route::post('/content', [ContentController::class, 'store'])->name('content.store');
        Route::match(['post', 'put'], '/content/{content}', [ContentController::class, 'update'])->whereNumber('content')->name('content.update');
        Route::delete('/content/{content}', [ContentController::class, 'destroy'])->whereNumber('content')->name('content.destroy');
        Route::post('/content/{content}/approve', [ContentController::class, 'approve'])->whereNumber('content')->name('content.approve');
        Route::post('/content/{content}/reject', [ContentController::class, 'reject'])->whereNumber('content')->name('content.reject');
        Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');
        Route::post('/schedule', [ScheduleController::class, 'store'])->name('schedule.store');
        Route::put('/schedule/{schedule}', [ScheduleController::class, 'update'])->whereNumber('schedule')->name('schedule.update');
        Route::delete('/schedule/{schedule}', [ScheduleController::class, 'destroy'])->whereNumber('schedule')->name('schedule.destroy');
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions');
        Route::get('/tutor-history', [TutorHistoryController::class, 'index'])->name('tutor-history');
        Route::get('/transactions/export', [TransactionController::class, 'export'])->name('transactions.export');
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->whereNumber('transaction')->name('transactions.show');
        Route::get('/transaction-stats', [TransactionController::class, 'stats'])->name('transaction-stats');
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
        Route::post('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->whereNumber('notification')->name('notifications.mark-as-read');
        Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
        Route::get('/settings', [SettingController::class, 'index'])->name('settings');
        Route::get('/settings/notifications', fn () => Inertia::render('Admin/Settings', ['initialTab' => 'notifications']))->name('settings.notifications');
    });

Route::middleware(['auth', 'verified', 'tutor'])
    ->prefix('tutor')
    ->name('tutor.')
    ->group(function () {
        Route::get('/', function () {
            return redirect()->route('tutor.dashboard');
        })->name('home');

        Route::get('/dashboard', [TutorDashboardController::class, 'index'])->name('dashboard');
        Route::get('/history', [TutorDashboardController::class, 'history'])->name('history');
        Route::get('/profile', [TutorDashboardController::class, 'profile'])->name('profile');
        Route::patch('/profile', [TutorDashboardController::class, 'updateProfile'])->name('profile.update');
        Route::get('/settings', [TutorDashboardController::class, 'settings'])->name('settings');
        Route::patch('/settings', [TutorDashboardController::class, 'updateSettings'])->name('settings.update');
        Route::get('/password', [TutorDashboardController::class, 'password'])->name('password');
        Route::patch('/password', [TutorDashboardController::class, 'updatePassword'])->name('password.update');
        Route::get('/notifications', [TutorNotificationController::class, 'index'])->name('notifications');
        Route::post('/notifications/{notification}/mark-as-read', [TutorNotificationController::class, 'markAsRead'])->whereNumber('notification')->name('notifications.mark-as-read');
        Route::post('/notifications/mark-all-as-read', [TutorNotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');

        Route::get('/upload', [TutorMaterialController::class, 'index'])->name('upload');
        Route::get('/material', [TutorMaterialController::class, 'index'])->name('material');
        Route::get('/materials', [TutorMaterialController::class, 'index'])->name('materials');
        Route::post('/upload', [TutorMaterialController::class, 'store'])->name('materials.store');
        Route::post('/announcements', [TutorMaterialController::class, 'announce'])->name('announcements.store');
        Route::delete('/materials/{material}', [TutorMaterialController::class, 'destroy'])->whereNumber('material')->name('materials.destroy');

        Route::get('/classes', [TutorClassMonitoringController::class, 'index'])->name('classes');
        Route::get('/class', [TutorClassMonitoringController::class, 'index'])->name('class');
        Route::get('/students/{student}', [TutorClassMonitoringController::class, 'showStudent'])->whereNumber('student')->name('students.show');

        Route::get('/schedule', [TutorScheduleController::class, 'index'])->name('schedule');
        Route::post('/schedule', [TutorScheduleController::class, 'store'])->name('schedule.store');
        Route::get('/schedule/{schedule}/start', [TutorScheduleController::class, 'startSession'])->whereNumber('schedule')->name('schedule.start');
        Route::patch('/schedule/{schedule}/meeting-link', [TutorScheduleController::class, 'updateMeetingLink'])->whereNumber('schedule')->name('schedule.meeting-link');
        Route::put('/schedule/{schedule}', [TutorScheduleController::class, 'update'])->whereNumber('schedule')->name('schedule.update');
        Route::delete('/schedule/{schedule}', [TutorScheduleController::class, 'destroy'])->whereNumber('schedule')->name('schedule.destroy');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
