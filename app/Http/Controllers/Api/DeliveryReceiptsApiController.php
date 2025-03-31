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

    public function deleteDeliveryReceipt($id)
{
    DB::beginTransaction();

    try {
        // Fetch the delivery receipt with its items
        $deliveryReceipt = DeliveryReceipt::with('items')->findOrFail($id);

        foreach ($deliveryReceipt->items as $item) {
            $product = Products::where('product_code', $item->product_code)->first();

            if (!$product) {
                throw new \Exception("Product not found: " . $item->product_code);
            }

            // Get the exact quantity added from this delivery receipt
            $quantityToRevert = $item->quantity;

            // Retrieve stock history where stock was added, ordered by newest first
            $stockHistories = StockHistory::where('product_id', $product->id)
                ->where('action', 'added')
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($stockHistories as $history) {
                if ($quantityToRevert <= 0) break; // Stop when enough has been reverted

                if ($history->quantity_changed <= $quantityToRevert) {
                    // If history entry is smaller than or equal to the quantity to revert
                    $product->quantity -= $history->quantity_changed;
                    $quantityToRevert -= $history->quantity_changed;
                    $history->delete(); // Delete only this specific stock history entry
                } else {
                    // If history entry is larger than the quantity to revert
                    $product->quantity -= $quantityToRevert;
                    $history->quantity_changed -= $quantityToRevert; // Adjust remaining history
                    $history->save();
                    $quantityToRevert = 0; // All quantity has been reverted
                }
            }

            // Save the updated product quantity
            $product->save();
        }

        // Delete the delivery receipt items
        DeliveryItems::where('delivery_receipt_id', $id)->delete();

        // Delete the delivery receipt
        $deliveryReceipt->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Delivery receipt deleted successfully'
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete delivery receipt',
            'error' => $e->getMessage()
        ], 500);
    }
}



}
    
    
    
    



