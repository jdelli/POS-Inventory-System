<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DeliveryReceipt;
use App\Models\DeliveryItems;
use Illuminate\Support\Facades\DB;
use App\Models\Products;
use App\Models\StockHistory;

class DeliveryReceiptsApiController extends Controller
{
    public function addDeliveryReceiptWithStockUpdate(Request $request)
{
    // Validate the incoming request
    $request->validate([
        'branch_id' => 'required|string|max:255',
        'delivery_number' => 'required|string|max:255',
        'delivered_by' => 'required|string|max:255',
        'date' => 'required|date',
        'items' => 'required|array',
        'items.*.product_name' => 'required|string|max:255',
        'items.*.product_code' => 'required|string|max:255',
        'items.*.quantity' => 'required|integer|min:1',
    ]);

    // Create a new delivery receipt
    $deliveryReceipt = new DeliveryReceipt();
    $deliveryReceipt->delivery_number = $request->delivery_number;
    $deliveryReceipt->delivered_by = $request->delivered_by;
    $deliveryReceipt->date = $request->date;
    $deliveryReceipt->branch_id = $request->branch_id;
    $deliveryReceipt->save();

    // Process each item in the delivery
    foreach ($request->items as $item) {
        // Add the item to the DeliveryItems table
        $deliveryItems = new DeliveryItems();
        $deliveryItems->delivery_receipt_id = $deliveryReceipt->id; // FK to DeliveryReceipt
        $deliveryItems->product_code = $item['product_code'];
        $deliveryItems->product_name = $item['product_name'];
        $deliveryItems->quantity = $item['quantity'];
        $deliveryItems->save();

        // Update the product stock
        $product = Products::where('product_code', $item['product_code'])->first();

        if ($product) {
            // Increase the product quantity
            $product->quantity += $item['quantity'];
            $product->save();

            // Log the stock change in the StockHistory table
            StockHistory::create([
                'product_id' => $product->id,
                'name' => $item['product_name'],
                'receipt_number' => $request->delivery_number,
                'date' => $request->date,
                'quantity_changed' => $item['quantity'],
                'remaining_stock' => $product->quantity,
                'action' => 'added',
            ]);
        } else {
            return response()->json(['message' => 'Product with code ' . $item['product_code'] . ' not found'], 404);
        }
    }

    // Return the response with the created delivery receipt
    return response()->json([
        'success' => true,
        'deliveryReceipt' => $deliveryReceipt
    ]);
}


    public function getDeliveryReceipts(Request $request) {
        $request->validate([
            'user_name' => 'required|string',
            'per_page' => 'integer|min:1|max:100',
            'sort_by' => 'in:date,created_at',
            'sort_direction' => 'in:asc,desc',
            'month' => 'nullable|integer|between:1,12', // Month filter (1 to 12)
        ]);
        
        $userName = $request->query('user_name');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'date');
        $sortDirection = $request->input('sort_direction', 'asc');
        $month = $request->input('month');
    
        $query = DeliveryReceipt::with('items')->where('branch_id', $userName);
    
        if ($month) {
            // Filter by the specified month
            $query->whereMonth('date', $month);
        }
    
        $deliveryReceipts = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);
    
        return response()->json([
            'success' => true,
            'deliveryReceipts' => $deliveryReceipts->items(),
            'current_page' => $deliveryReceipts->currentPage(),
            'per_page' => $deliveryReceipts->perPage(),
            'last_page' => $deliveryReceipts->lastPage(),
            'total' => $deliveryReceipts->total(),
        ]);
    }

    public function deleteDeliveryReceipt($id, Request $request)
{
    // Start a database transaction to ensure atomicity
    DB::beginTransaction();

    try {
        // Retrieve the delivery receipt by ID
        $deliveryReceipt = DeliveryReceipt::find($id);

        if (!$deliveryReceipt) {
            return response()->json(['message' => 'Delivery receipt not found'], 404);
        }

        // Validate the branch_id parameter
        $branchId = $request->query('branch_id');
        if (!$branchId) {
            return response()->json(['message' => 'Branch ID is required'], 400);
        }

        // Retrieve all delivery items associated with this receipt
        $deliveryItems = DeliveryItems::where('delivery_receipt_id', $deliveryReceipt->id)->get();

        if ($deliveryItems->isEmpty()) {
            return response()->json(['message' => 'No items found in the delivery receipt'], 404);
        }

        foreach ($deliveryItems as $item) {
            // Find the product in the warehouse
            $warehouseProduct = Products::where('product_code', $item->product_code)
                ->where('branch_id', 'warehouse')
                ->first();

            if (!$warehouseProduct) {
                return response()->json(['message' => 'Warehouse product not found for code: ' . $item->product_code], 404);
            }

            // Revert the quantity to the warehouse
            $warehouseProduct->quantity += $item->quantity;
            $warehouseProduct->save();

            // Delete stock history entries for the warehouse product (action = 'deducted')
            StockHistory::where('receipt_number', $deliveryReceipt->delivery_number)
                ->where('action', 'deducted') // Target warehouse actions
                ->delete();

            // Find the product in the destination branch (using the provided branch_id)
            $destinationProduct = Products::where('product_code', $item->product_code)
                ->where('branch_id', $branchId) // Use the provided branch_id
                ->first();

            if ($destinationProduct) {
                // Deduct the quantity from the destination branch
                $destinationProduct->quantity -= $item->quantity;

                if ($destinationProduct->quantity < 0) {
                    return response()->json(['message' => 'Negative stock detected in branch: ' . $branchId], 400);
                }

                $destinationProduct->save();
            } else {
                // Log a warning if the product doesn't exist in the destination branch
                \Log::warning("Destination product not found for code: {$item->product_code} in branch: {$branchId}");
            }

            // Delete stock history entries for the destination branch product (action = 'added')
            StockHistory::where('receipt_number', $deliveryReceipt->delivery_number)
                ->where('action', 'added') // Target destination branch actions
                ->delete();
        }

        // Delete the delivery items
        DeliveryItems::where('delivery_receipt_id', $deliveryReceipt->id)->delete();

        // Delete the delivery receipt
        $deliveryReceipt->delete();

        // Commit the transaction
        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Delivery receipt deleted and stock reverted successfully',
        ]);
    } catch (\Exception $e) {
        // Rollback the transaction in case of an error
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'An error occurred while deleting the receipt',
            'error' => $e->getMessage(),
        ], 500);
    }
}


}
    
    
    
    



