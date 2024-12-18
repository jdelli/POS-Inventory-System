<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');



Route::get('/sales', function () {
    return Inertia::render('SalesOrder');
})->middleware(['auth', 'verified'])->name('sales');



Route::get('/products', function () {
    return Inertia::render('Products');
})->middleware(['auth', 'verified'])->name('products');




Route::get('/manage-stocks', function () {
    return Inertia::render('ManageStocks');
})->middleware(['auth', 'verified'])->name('stocks');





Route::get('/stocksentries', function () {
    return Inertia::render('StockEntries');
})->name('stocksentries');




Route::get('/quotation', function () {
    return Inertia::render('Quotation');
})->name('quotation');













Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
