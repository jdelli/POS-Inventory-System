<?php

namespace App\Http\Controllers\Auth;

use App\Events\UserStatusUpdated;
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
        $user->is_online = true;
        $user->save();

        // Create a Sanctum token and store the plain-text value in the session
        // so the front-end can use it for authenticated API requests.
        $token = $request->user()->createToken('token-name')->plainTextToken;
        $request->session()->put('api_token', $token);

        $request->session()->regenerate();

        broadcast(new UserStatusUpdated($user->id, true));

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
            $user->is_online = false;
            $user->save();

            broadcast(new UserStatusUpdated($user->id, false));

            // Delete all personal access tokens for this user.
            $user->tokens()->delete();
        }

        // Forget the stored API token from the session.
        $request->session()->forget('api_token');

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

