<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductsApiController;
use App\Http\Controllers\Api\SalesOrderApiController;
use App\Http\Controllers\Api\DeliveryReceiptsApiController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\AdminController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



// For Products
Route::post("/add-products", [ProductsApiController::class, "addProduct"]);
Route::get("/fetch-products-by-branch", [ProductsApiController::class, "fetchProductsByBranch"]);
Route::put("/edit-products/{id}", [ProductsApiController::class, "updateProduct"]);
Route::delete("/delete-products/{id}", [ProductsApiController::class, "deleteProduct"]);
Route::get("/fetch-products", [ProductsApiController::class, "fetchProducts"]);


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




//Delivery Receipt
Route::post('/add-delivery-receipt', [DeliveryReceiptsApiController::class, 'addDeliveryReceipt']);
Route::get('/fetch-delivery-receipts', [DeliveryReceiptsApiController::class, 'getDeliveryReceipts']);




//Customer Order
Route::post('/add-customer-order', [CustomerOrderController::class, 'addCustomerOrder']);
Route::get('/orders', [CustomerOrderController::class, 'getAllCustomerOrders']);
Route::put('/update-status/{id}', [CustomerOrderController::class, 'updateCustomerOrderStatus']);
Route::put('/update-branch/{id}', [CustomerOrderController::class, 'forwardOrder']);






//Admin
Route::get('/sales-by-branch', [AdminController::class, 'getTotalSalesByUser']);
Route::get('/daily-sales-by-branch', [AdminController::class, 'getDailySales']);
Route::get('/admin-fetch-products-by-branch', [AdminController::class, 'AdminfetchProductsByBranch']);
Route::get('/get-branches', [AdminController::class, 'getAllBranches']);
Route::get('/stock-history/{id}', [AdminController::class, 'getStockHistory']);
Route::get('/admin-fetch-delivery-receipts-by-branch', [AdminController::class, 'AdminfetchDeliveryReceiptsByBranch']);
Route::get('/admin-get-sales-orders', [AdminController::class, 'adminGetSalesOrders']);