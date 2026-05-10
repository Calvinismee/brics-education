<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transaction;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $courses = Course::with('category')
        ->where('status', 'active')
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('LandingPage', [
        'courses' => $courses,
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

Route::get('/checkout/{course}', function (Course $course) {
    $course->load('category');

    return Inertia::render('Checkout', [
        'course' => $course,
    ]);
})->name('checkout');

Route::post('/checkout', function (Request $request) {
    $request->validate([
        'course_id' => ['required', 'exists:courses,id'],
        'payment_method' => ['required', 'string'],
    ]);

    $user = Auth::user();

    if (!$user) {
        return redirect()->route('login');
    }

    $course = Course::findOrFail($request->course_id);

    $transaction = Transaction::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'amount' => $course->price,
        'payment_method' => $request->payment_method,
        'payment_status' => 'pending',
    ]);

    return redirect("/payment-status/{$transaction->id}");
})->middleware('auth');

Route::get('/payment-status/{transaction}', function (Transaction $transaction) {
    $transaction->load('course.category');

    return Inertia::render('PaymentStatus', [
        'transaction' => $transaction,
    ]);
})->name('payment.status');

Route::post('/payment-status/{transaction}/confirm', function (Transaction $transaction) {
    $transaction->load('course');

    $transaction->update([
        'payment_status' => 'success',
        'paid_at' => now(),
    ]);

    Enrollment::updateOrCreate(
        [
            'user_id' => $transaction->user_id,
            'course_id' => $transaction->course_id,
        ],
        [
            'status' => 'active',
            'enrolled_at' => now(),
        ]
    );

    return redirect()
        ->to('/payment-status/' . $transaction->id)
        ->with('success', 'Pembayaran berhasil dikonfirmasi dan course telah aktif.');
})->name('payment.confirm');

Route::get('/dashboard', function () {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();

    if ($user->role_id !== 3) {
        auth()->logout();

        return redirect()
            ->route('login')
            ->withErrors([
                'email' => 'Akun ini bukan akun siswa.',
            ]);
    }

    $enrollments = Enrollment::with('course.category')
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

    $transactions = Transaction::with('course.category')
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

    $activeCourseIds = $enrollments
        ->where('status', 'active')
        ->pluck('course_id');

    $schedules = Schedule::with(['course.category', 'mentor'])
        ->whereIn('course_id', $activeCourseIds)
        ->orderBy('start_time')
        ->take(3)
        ->get();

    return Inertia::render('StudentDashboard', [
        'user' => $user,
        'enrollments' => $enrollments,
        'transactions' => $transactions,
        'schedules' => $schedules,
    ]);
})->name('dashboard');

Route::get('/course/{course}/learn', function (Course $course) {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();

    if ($user->role_id !== 3) {
    auth()->logout();

    return redirect()
        ->route('login')
        ->withErrors([
            'email' => 'Akun ini bukan akun siswa.',
        ]);
}

    $enrollment = Enrollment::where('user_id', $user->id)
        ->where('course_id', $course->id)
        ->where('status', 'active')
        ->first();

    if (!$enrollment) {
        return redirect()
            ->to('/course/' . $course->id)
            ->withErrors([
                'course' => 'Kamu belum memiliki akses aktif ke course ini.',
            ]);
    }

    $course->load('category');

    $materials = Material::where('course_id', $course->id)
        ->where('approval_status', 'approved')
        ->orderBy('created_at')
        ->get();

    return Inertia::render('CourseLearn', [
        'user' => $user,
        'course' => $course,
        'materials' => $materials,
        'enrollment' => $enrollment,
    ]);
})->name('course.learn');

Route::get('/student/schedules', function () {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();

    if ($user->role_id !== 3) {
    auth()->logout();

    return redirect()
        ->route('login')
        ->withErrors([
            'email' => 'Akun ini bukan akun siswa.',
        ]);
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
        Route::put('/users/{user}', [UserController::class, 'update'])->whereNumber('user')->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->whereNumber('user')->name('users.destroy');
        Route::get('/users/export', [UserController::class, 'export'])->name('users.export');
        Route::get('/packages', [PackageController::class, 'index'])->name('packages');
        Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
        Route::put('/packages/{package}', [PackageController::class, 'update'])->whereNumber('package')->name('packages.update');
        Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->whereNumber('package')->name('packages.destroy');
        Route::get('/content', [ContentController::class, 'index'])->name('content');
        Route::post('/content/{content}/approve', [ContentController::class, 'approve'])->whereNumber('content')->name('content.approve');
        Route::post('/content/{content}/reject', [ContentController::class, 'reject'])->whereNumber('content')->name('content.reject');
        Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');
        Route::post('/schedule', [ScheduleController::class, 'store'])->name('schedule.store');
        Route::put('/schedule/{schedule}', [ScheduleController::class, 'update'])->whereNumber('schedule')->name('schedule.update');
        Route::delete('/schedule/{schedule}', [ScheduleController::class, 'destroy'])->whereNumber('schedule')->name('schedule.destroy');
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions');
        Route::get('/transaction-stats', [TransactionController::class, 'stats'])->name('transaction-stats');
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
        Route::post('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->whereNumber('notification')->name('notifications.mark-as-read');
        Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
        Route::get('/settings', [SettingController::class, 'index'])->name('settings');
        Route::get('/settings/notifications', fn () => Inertia::render('Admin/Settings', ['initialTab' => 'notifications']))->name('settings.notifications');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
