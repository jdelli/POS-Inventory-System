<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
}
