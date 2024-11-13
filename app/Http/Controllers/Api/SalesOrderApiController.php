<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SalesOrder;
use App\Models\SalesOrderItems;
use Carbon\Carbon;


class SalesOrderApiController extends Controller
{
    public function addSalesOrder(Request $request)
    {
        // Validate the request input
        $request->validate([
            'receipt_number' => 'required|string|max:255',
            'customer_name' => 'required|string|max:255',
            'date' => 'required|date',
            'items' => 'required|array',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
        ]);

        // Create a new SalesOrder instance
        $salesOrder = new SalesOrder();
        $salesOrder->receipt_number = $request->receipt_number;
        $salesOrder->customer_name = $request->customer_name;
        $salesOrder->date = $request->date;
        $salesOrder->save();

        // Save the individual items
        foreach ($request->items as $item) {
            $salesOrderItem = new SalesOrderItems();
            $salesOrderItem->sales_order_id = $salesOrder->id; // FK to SalesOrder
            $salesOrderItem->product_name = $item['product_name'];
            $salesOrderItem->quantity = $item['quantity'];
            $salesOrderItem->price = $item['price'];
            $salesOrderItem->total = $item['total'];
            $salesOrderItem->save();
        }

        // Return a success response
        return response()->json([
            'success' => true,
            'message' => 'Sales Order created successfully',
            'salesOrder' => $salesOrder
        ]);
    }




    public function getSalesOrders(Request $request)
{
    $perPage = $request->input('per_page', 10); // Get items per page from the request, default to 10
    $month = $request->input('month');
    
    // Start the query
    $query = SalesOrder::with('items');

    // Apply month filter if provided
    if ($month) {
        $query->whereMonth('date', $month);
    }

    // Get paginated sales orders
    $salesOrders = $query->paginate($perPage);

    return response()->json([
        'success' => true,
        'salesOrders' => $salesOrders->items(), // Get the current page items
        'current_page' => $salesOrders->currentPage(), // Current page number
        'per_page' => $salesOrders->perPage(), // Items per page
        'last_page' => $salesOrders->lastPage(), // Last page number
        'total' => $salesOrders->total(), // Total items
    ]);
}



    public function getMonthlySales()
    {
        // Fetch monthly sales data based on the date from SalesOrder
        $salesData = SalesOrder::selectRaw('MONTH(date) as month, SUM(SalesOrderItems.total) as sales')
            ->join('sales_order_items as SalesOrderItems', 'sales_orders.id', '=', 'SalesOrderItems.sales_order_id')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::create()->month($item->month)->format('M'), // Formats month as Jan, Feb, etc.
                    'sales' => (float) $item->sales, // Cast sales to float for frontend compatibility
                ];
            });

        return response()->json([
            'success' => true,
            'monthlySales' => $salesData
        ]);

    }

    
    public function getTotalClients()
    {
        try {
            // Count the total number of clients in the database
            $totalClients = SalesOrder::count();

            return response()->json([
                'success' => true,
                'totalSalesOrders' => $totalClients,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch total clients.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


}
