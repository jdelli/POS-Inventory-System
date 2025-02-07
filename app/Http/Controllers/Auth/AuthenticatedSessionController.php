<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();
        $token = $request->user()->createToken('token-name')->plainTextToken;
        
        $authUser=[
            'user' => $user,
            'token' => $token
        ];

        $request->session()->regenerate();

        if ($request->user()->usertype === 'admin') {
            return redirect()->intended(route('admin-dashboard'));
        }

        return redirect()->intended(route('user-dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */


public function destroy(Request $request): RedirectResponse
{
    $user = Auth::guard('sanctum')->user();

    if ($user) {
        $user->tokens()->delete(); // Delete all tokens
    }

    Auth::guard('web')->logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
}

}
