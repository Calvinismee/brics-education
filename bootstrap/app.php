<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

// 1. Setup aplikasi dan paksa jalur public
$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\ShareNotifications::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'midtrans/notification',
        ]);

        // 2. Definisi Redirect tamu yang terpusat dan rapi
        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('tutor') || $request->is('tutor/*')) {
                return route('login.tutor');
            }
            if ($request->is('admin') || $request->is('admin/*')) {
                return route('login.admin');
            }
            return route('login');
        });

        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            'tutor' => \App\Http\Middleware\IsTutor::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, Request $request) {
            if ($request->expectsJson() || $response->getStatusCode() !== 404) {
                return $response;
            }

            return \Inertia\Inertia::render('Errors/NotFound')
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })->create();

// 3. KUNCI AGAR PUBLIC PATH MENGARAH KE FOLDER PUBLIC
$app->usePublicPath($app->basePath() . '/public');

return $app;
