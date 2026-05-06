<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminDashboardController;
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

        Route::get('/users', fn () => Inertia::render('Admin/Users'))->name('users');
        Route::get('/packages', fn () => Inertia::render('Admin/Packages'))->name('packages');
        Route::get('/content', fn () => Inertia::render('Admin/Content'))->name('content');
        Route::get('/schedule', fn () => Inertia::render('Admin/Schedule'))->name('schedule');
        Route::get('/transactions', fn () => Inertia::render('Admin/Transactions'))->name('transactions');
        Route::get('/transaction-stats', fn () => Inertia::render('Admin/TransactionStats'))->name('transaction-stats');
        Route::get('/notifications', fn () => Inertia::render('Admin/Notifications'))->name('notifications');
        Route::get('/reports/export', fn () => Inertia::render('Admin/ReportsExport'))->name('reports.export');
        Route::get('/settings', fn () => Inertia::render('Admin/Settings'))->name('settings');
        Route::get('/settings/notifications', fn () => Inertia::render('Admin/Settings', ['initialTab' => 'notifications']))->name('settings.notifications');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
