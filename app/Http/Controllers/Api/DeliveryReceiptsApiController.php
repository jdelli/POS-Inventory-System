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
    public function addDeliveryReceipt(Request $request) {
        $request->validate([
            'branch_id' => 'required|string|max:255',
            'delivery_number' => 'required|string|max:255',
            'delivered_by' => 'required|string|max:255',
            'date' => 'required|date',
            'items' => 'required|array',
            'items.*.product_name' => [
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


        $deliveryReceipt = new DeliveryReceipt();
        $deliveryReceipt->delivery_number = $request->delivery_number;
        $deliveryReceipt->delivered_by = $request->delivered_by;
        $deliveryReceipt->date = $request->date;
        $deliveryReceipt->branch_id = $request->branch_id;
        $deliveryReceipt->save();



        foreach ($request->items as $item) {
            $deliveryItems = new DeliveryItems();
            $deliveryItems->delivery_receipt_id = $deliveryReceipt->id; // FK to DeliveryReceipt
            $deliveryItems->product_name = $item['product_name'];
            $deliveryItems->quantity = $item['quantity'];
            $deliveryItems->save();
        }

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
        // Fetch the delivery receipt
        $deliveryReceipt = DeliveryReceipt::with('items')->findOrFail($id);

        // Revert the quantity of each product
        foreach ($deliveryReceipt->items as $item) {
            $product = Products::where('name', $item->product_name)->first();

            // Ensure product exists
            if (!$product) {
                throw new \Exception("Product not found: " . $item->product_name);
            }

            // Retrieve the stock history for this product in reverse order (latest first)
            $stockHistories = StockHistory::where('product_id', $product->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Revert the stock based on the stock history
            foreach ($stockHistories as $latestHistory) {
                if ($latestHistory->action === 'added') {
                    // If stock was added, we should delete the stock history entry for this addition
                    $latestHistory->delete();
                    // Decrease the quantity of the product
                    $product->quantity -= $latestHistory->quantity_changed;
                } 
                // If it's deducted, we should leave the history intact
            }

            // Save the updated product quantity
            $product->save();
        }

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
    
    
    
    



