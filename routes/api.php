<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductsApiController;
use App\Http\Controllers\Api\SalesOrderApiController;
use App\Http\Controllers\Api\DeliveryReceiptsApiController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Api\RequestStocksController;
use App\Http\Controllers\Api\SalesReportController;



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [RegisteredUserController::class, 'destroy'])->middleware('auth:sanctum');



Route::middleware('auth:sanctum')->group(function () {

    // For Products
    Route::post("/add-products", [ProductsApiController::class, "addProduct"]);
    Route::get("/fetch-products-by-branch", [ProductsApiController::class, "fetchProductsByBranch"]);
    Route::put("/edit-products/{id}", [ProductsApiController::class, "updateProduct"]);
    Route::delete("/delete-products/{id}", [ProductsApiController::class, "deleteProduct"]);
    
    Route::post('/add-quantity', [ProductsApiController::class, 'AddQuantity']);
    Route::post('/deduct-quantity', [ProductsApiController::class, 'deductQuantity']);
    Route::get('/search-products', [ProductsApiController::class, 'search']);
    Route::get('/get-total-products', [ProductsApiController::class, 'getTotalProducts']);

    // For Sales Order
    Route::post('/add-sales-order', [SalesOrderApiController::class, 'addSalesOrder']);
    Route::get('/fetch-sales-orders', [SalesOrderApiController::class, 'getSalesOrders']);
    Route::get('/get-monthly-sales', [SalesOrderApiController::class, 'getMonthlySales']);
    Route::get('/get-total-clients', [SalesOrderApiController::class, 'getTotalClients']);
    Route::get('/get-total-daily-sales-orders', [SalesOrderApiController::class, 'getSalesOrderItemsToday']);
    Route::get('/get-total-daily-sales', [SalesOrderApiController::class, 'getDailySales']);

    // Delivery Receipt
    Route::post('/add-delivery-receipt', [DeliveryReceiptsApiController::class, 'addDeliveryReceipt']);
    Route::get('/fetch-delivery-receipts', [DeliveryReceiptsApiController::class, 'getDeliveryReceipts']);

    // Customer Order
    Route::get('/orders', [CustomerOrderController::class, 'getAllCustomerOrders']);
    Route::put('/update-status/{id}', [CustomerOrderController::class, 'updateCustomerOrderStatus']);
    Route::put('/update-branch/{id}', [CustomerOrderController::class, 'forwardOrder']);

    // Stock Request
    Route::post('/add-stock-request', [RequestStocksController::class, 'addStockRequest']);
    Route::get('/fetch-stock-requests', [RequestStocksController::class, 'getStockRequests']);
    Route::delete('/delete-stock-request/{id}', [RequestStocksController::class, 'deleteStockRequest']);

    // Sales Report
    Route::get('/sales-report/daily', [SalesReportController::class, 'dailySalesReport']);
    Route::get('/sales-orders-by-date', [SalesReportController::class, 'getSalesOrdersByDate']);
    Route::get('/fetch-monthly-sales', [SalesReportController::class, 'fetchMonthlySales']);
    Route::get('/sales-total', [SalesReportController::class, 'getTotalSales']);
    Route::prefix('cash-breakdowns')->group(function () {
        Route::post('/', [SalesReportController::class, 'store']); // Create
        Route::get('/', [SalesReportController::class, 'index']); // List all
        Route::get('/{id}', [SalesReportController::class, 'show']); // Show one
        Route::delete('/{id}', [SalesReportController::class, 'destroy']); // Delete
    });


    // Admin
    Route::get('/sales-by-branch', [AdminController::class, 'getTotalSalesByUser']);
    Route::get('/daily-sales-by-branch', [AdminController::class, 'getDailySales']);
    Route::get('/admin-fetch-products-by-branch', [AdminController::class, 'AdminfetchProductsByBranch']);
    Route::get('/stock-history/{id}', [AdminController::class, 'getStockHistory']);
    Route::get('/admin-fetch-delivery-receipts-by-branch', [AdminController::class, 'AdminfetchDeliveryReceiptsByBranch']);
    Route::get('/admin-get-sales-orders', [AdminController::class, 'adminGetSalesOrders']);
    Route::delete('/delete-sales-order/{id}', [SalesOrderApiController::class, 'deleteSalesOrder']);
    Route::delete('/delete-delivery-receipt/{id}', [DeliveryReceiptsApiController::class, 'deleteDeliveryReceipt']);
    Route::get('/most-sold-product', [SalesOrderApiController::class, 'mostSoldProducts']);
});



// Public Routes
Route::get('/get-branches', [AdminController::class, 'getAllBranches']);
Route::get("/fetch-products", [ProductsApiController::class, "fetchProducts"]);
Route::post('/add-customer-order', [CustomerOrderController::class, 'addCustomerOrder']);



