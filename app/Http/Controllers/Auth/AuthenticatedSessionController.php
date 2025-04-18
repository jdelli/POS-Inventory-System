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
use App\Events\UserStatusUpdated;

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
    $user->is_online = true; // ✅
    $user->save();

    $token = $request->user()->createToken('token-name')->plainTextToken;

    $authUser = [
        'user' => $user,
        'token' => $token
    ];

    $request->session()->regenerate();

    broadcast(new UserStatusUpdated($user->id, true)); // ✅

    if ($user->usertype === 'admin') {
        return redirect()->intended(route('admin-dashboard'));
    }

    return redirect()->intended(route('user-dashboard'));
}


    /**
     * Destroy an authenticated session.
     */


     public function destroy(Request $request): RedirectResponse
     {
         $user = Auth::guard('web')->user();
     
         if ($user) {
            $user->is_online = false; // ✅ set offline
            $user->save();
        
            broadcast(new UserStatusUpdated($user->id, false)); // ✅ broadcast as offline
        
            $user->tokens()->delete(); // Delete all tokens
        }
        
     
         Auth::guard('web')->logout();
     
         $request->session()->invalidate();
         $request->session()->regenerateToken();
     
         return redirect('/');
     }

}
