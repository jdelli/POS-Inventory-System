<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoles
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $role): Response
{
    $user = auth()->user();
    if (!$user) {
        abort(403, 'Unauthorized');
    }

    if ($role === 'admin' && $user->usertype !== 'admin') {
        abort(403, 'Forbidden');
    }
    if ($role === 'user' && $user->usertype !== 'user') {
        abort(403, 'Forbidden');
    }

    return $next($request);
}
}