<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DeliveryReceipt;
use App\Models\DeliveryItems;

class DeliveryReceiptsApiController extends Controller
{
    public function addDeliveryReceipt(Request $request) {
        request()->validate([
            'delivery_number' => 'required|string|max:255',
            'delivered_by' => 'required|string|max:255',
            'date' => 'required|date',
            'items' => 'required|array',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
        ]);


        $deliveryReceipt = new DeliveryReceipt();
        $deliveryReceipt->delivery_number = $request->delivery_number;
        $deliveryReceipt->delivered_by = $request->delivered_by;
        $deliveryReceipt->date = $request->date;
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
            'per_page' => 'integer|min:1|max:100', // Validate 'per_page' input
        ]);
    
        $perPage = $request->input('per_page', 10); // Get items per page from the request, default to 10
    
        // Fetch delivery receipts with their items
        $deliveryReceipts = DeliveryReceipt::with('items')->paginate($perPage); // Eager load items and paginate
    
        return response()->json([
            'success' => true,
            'deliveryReceipts' => $deliveryReceipts->items(), // Get the current page items
            'current_page' => $deliveryReceipts->currentPage(), // Current page number
            'per_page' => $deliveryReceipts->perPage(), // Items per page
            'last_page' => $deliveryReceipts->lastPage(), // Last page number
            'total' => $deliveryReceipts->total(), // Total items
        ]);
    }
    


}
