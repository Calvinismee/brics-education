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
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return redirect('/');
})->name('dashboard');

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
