<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RequestStocks;
use App\Models\RequestStocksItems;
use App\Models\Products; // Make sure to import this

class RequestStocksController extends Controller
{
   public function addStockRequest(Request $request)
{
    // Validate request
    $request->validate([
        'branch_id' => 'required|string|max:255',
        'date' => 'required|date',
        'items.*.name' => [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) {
                if (!\App\Models\Products::where('name', $value)->exists()) {
                    $fail("The product '$value' does not exist in the database.");
                }
            }
        ],
        'items.*.quantity' => 'required|integer|min:1',
    ]);

    // Create a new RequestStock
    $requestStock = new RequestStocks();
    $requestStock->branch_id = $request->branch_id;
    $requestStock->date = $request->date;
    $requestStock->save();

    // Save request stock items
    foreach ($request->items as $item) {
        $requestStockItem = new RequestStocksItems();
        $requestStockItem->request_stocks_id = $requestStock->id;
        $requestStockItem->product_name = $item['name'];
        $requestStockItem->quantity = $item['quantity'];
        $requestStockItem->save();
    }

    // Return a success response
    return response()->json(['message' => 'Stock request added successfully'], 201);
}


    public function getStockRequests()
    {
        $stockRequests = RequestStocks::with('items')->get();
        return response()->json($stockRequests);
    }


    public function deleteStockRequest($id)
{
    $stockRequest = RequestStocks::with('items')->find($id);

    if (!$stockRequest) {
        return response()->json(['message' => 'Stock request not found'], 404);
    }

    // Delete all related stock request items
    $stockRequest->items()->delete();

    // Now delete the stock request itself
    $stockRequest->delete();

    return response()->json(['message' => 'Stock request deleted successfully'], 200);
}

}
