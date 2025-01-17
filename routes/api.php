<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductsApiController;
use App\Http\Controllers\Api\SalesOrderApiController;
use App\Http\Controllers\Api\DeliveryReceiptsApiController;
use App\Http\Controllers\Api\CustomerOrderController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



// For Products
Route::post("/add-products", [ProductsApiController::class, "addProduct"]);
Route::get("/fetch-products", [ProductsApiController::class, "fetchProducts"]);
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
Route::get('/get-total-daily-sales', [SalesOrderApiController::class, 'getDailySales']);



//Delivery Receipt
Route::post('/add-delivery-receipt', [DeliveryReceiptsApiController::class, 'addDeliveryReceipt']);
Route::get('/fetch-delivery-receipts', [DeliveryReceiptsApiController::class, 'getDeliveryReceipts']);




//Customer Order
Route::post('/add-customer-order', [CustomerOrderController::class, 'addCustomerOrder']);
Route::get('/orders', [CustomerOrderController::class, 'getAllCustomerOrders']);
Route::put('/update-status/{id}', [CustomerOrderController::class, 'updateCustomerOrderStatus']);


