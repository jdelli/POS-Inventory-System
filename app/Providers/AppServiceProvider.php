<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (app()->runningInConsole()) {
            return;
        }

        $configuredDomain = config('session.domain');
        $currentHost = request()->getHost();

        if (
            app()->environment('local') &&
            ! empty($configuredDomain) &&
            $configuredDomain !== $currentHost
        ) {
            config(['session.domain' => $currentHost]);
        }
    }
}
