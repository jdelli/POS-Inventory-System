<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('POS', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Admin Routes
Route::middleware(['checkrole:user'])->group(function () {
    Route::get('/user-dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('user-dashboard');

    Route::get('/user-sales', function () {
        return Inertia::render('SalesOrder');
    })->name('user-sales');


    Route::get('/user-manage-stocks', function () {
        return Inertia::render('ManageStocks');
    })->name('user-stocks');

    Route::get('/user-stocksentries', function () {
        return Inertia::render('StockEntries');
    })->name('user-stocksentries');

    Route::get('/user-quotation', function () {
        return Inertia::render('Quotation');
    })->name('user-quotation');



    Route::get('/user-customers', function () {
        return Inertia::render('CustomerOrders');
    })->name('user-customers');



    Route::get('/user-reports', function () {
        return Inertia::render('SalesReport');
    })->name('user-reports');


    Route::get('/user-chat', function () {
        return Inertia::render('UserChat');
    })->name('user-chat');

});





// User Routes
Route::middleware(['checkrole:admin'])->group(function () {
    Route::get('/admin-dashboard', function () {
        return Inertia::render('AdminRoutePage/Dashboard');
    })->name('admin-dashboard');

    Route::get('/admin-stocks', function () {
        return Inertia::render('AdminRoutePage/BranchStocks');
    })->name('admin-stocks');

    Route::get('/admin-entries', function () {
        return Inertia::render('AdminRoutePage/AdminStocksEntries');
    })->name('admin-entries');

    Route::get('/admin-sales', function () {
        return Inertia::render('AdminRoutePage/BranchSalesOrders');
    })->name('admin-sales');

    Route::get('/admin-stocks-request', function () {
        return Inertia::render('AdminRoutePage/StockRequest');
    })->name('admin-stocks-request');

    Route::get('/admin-reports', function () {
        return Inertia::render('AdminRoutePage/AdminReport');
    })->name('admin-reports');

    Route::get('/admin-products', function () {
        return Inertia::render('AdminRoutePage/Products');
    })->name('admin-products');

    Route::get('/admin-supplier', function () {
        return Inertia::render('AdminRoutePage/Supplier');
    })->name('admin-supplier');

    Route::get('/admin-sales-stats', function () {
        return Inertia::render('AdminRoutePage/SalesStatistics');
    })->name('admin-sales-stats');


    Route::get('/admin-chat', function () {
        return Inertia::render('AdminRoutePage/Chat');
    })->name('admin-chat');

    Route::get('/admin-announcements', function () {
        return Inertia::render('AdminRoutePage/Announcements');
    })->name('admin-announcements');

});









Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
