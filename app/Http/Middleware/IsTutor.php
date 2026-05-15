<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsTutor
{
    public function handle(Request $request, Closure $next): Response
    {
        $role = strtolower((string) User::roleNameFor($request->user()?->role_id));

        if (in_array($role, ['tutor', 'mentor'], true)) {
            return $next($request);
        }

        return redirect('/')->with('error', 'Unauthorized access');
    }
}
