<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\ShareNotifications::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'midtrans/notification',
        ]);

        $middleware->redirectGuestsTo(function ($request) {
            return $request->is('admin') || $request->is('admin/*')
                ? route('login.admin')
                : route('login');
        });

        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            'tutor' => \App\Http\Middleware\IsTutor::class,
        ]);

        $middleware->redirectGuestsTo(function (\Illuminate\Http\Request $request): string {
            if ($request->is('tutor') || $request->is('tutor/*')) {
                return route('login.tutor');
            }

            if ($request->is('admin') || $request->is('admin/*')) {
                return route('login.admin');
            }

            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, \Illuminate\Http\Request $request) {
            if ($request->expectsJson() || $response->getStatusCode() !== 404) {
                return $response;
            }

            return \Inertia\Inertia::render('Errors/NotFound')
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })->create();
