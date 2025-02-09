<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SalesOrder;
use App\Models\SalesOrderItems;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Products;
use App\Models\StockHistory;


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
    $salesOrder->branch_id = $request->branch_id; // Add this line to set branch_id
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
    $year = $request->input('year');
    $userName = $request->query('user_name');

    // Start the query
    $query = SalesOrder::with('items')->where('branch_id', $userName);

    // Apply month filter if provided
    if ($month) {
        $query->whereMonth('date', $month);
    }

    // Apply year filter if provided
    if ($year) {
        $query->whereYear('date', $year);
    }

    // Paginate the results
    $salesOrders = $query->paginate($perPage);

    // Return the paginated response
    return response()->json([
        'salesOrders' => $salesOrders->items(),
        'last_page' => $salesOrders->lastPage(),
        'current_page' => $salesOrders->currentPage(),
        'total' => $salesOrders->total(),
    ]);
}



    public function getMonthlySales(Request $request)
{
    try {
        $userName = $request->query('user_name');
        $currentYear = Carbon::now()->year;

        // Fetch monthly sales data for the current year
        $salesData = SalesOrder::selectRaw('MONTH(date) as month, SUM(SalesOrderItems.total) as sales')
            ->join('sales_order_items as SalesOrderItems', 'sales_orders.id', '=', 'SalesOrderItems.sales_order_id')
            ->whereYear('date', $currentYear) // Ensures only sales from the current year are fetched
            ->where('branch_id', $userName)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::create()->month($item->month)->format('M'),
                    'sales' => round((float) $item->sales, 2)
                ];
            });

        // Fill in missing months with zero sales
        $allMonths = collect(range(1, 12))->map(function ($month) {
            return [
                'month' => Carbon::create()->month($month)->format('M'),
                'sales' => 0
            ];
        });

        // Merge sales data with all months, ensuring no missing months
        $mergedData = $allMonths->map(function ($monthData) use ($salesData) {
            $matchingMonth = $salesData->firstWhere('month', $monthData['month']);
            return $matchingMonth ?? $monthData;
        });

        return response()->json([
            'success' => true,
            'data' => $mergedData->values()->all()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch monthly sales.',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function getTotalClients(Request $request)
{
    try {
        $userName = $request->query('user_name');
        $totalSalesOrders = SalesOrder::where('branch_id', $userName)->count();

        return response()->json([
            'success' => true,
            'data' => $totalSalesOrders
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch total sales orders.',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function getSalesOrderItemsToday(Request $request)
{
        $userName = $request->query('user_name');
        $today = Carbon::today();
        $salesOrders = SalesOrder::where('branch_id', $userName)
            ->whereDate('date', $today)
            ->with('items')
            ->count();

        return response()->json([
            'success' => true,
            'data' => $salesOrders
        ]);
    }


    

public function getDailySales(Request $request)
{
    $userName = $request->query('user_name');
    $today = Carbon::today();

    $totalSales = SalesOrder::where('branch_id', $userName)
        ->whereDate('date', $today)
        ->with('items')
        ->get()
        ->flatMap(fn($order) => $order->items)
        ->sum(fn($item) => $item->total); // Replace 'total' with the actual column name if different.

    return response()->json([
        'success' => true,
        'data' => $totalSales,
    ]);
}


public function deleteSalesOrder($orderId)
{
    DB::beginTransaction();

    try {
        // Fetch the sales order
        $salesOrder = SalesOrder::with('items')->findOrFail($orderId);

        // Revert the quantity of each product
        foreach ($salesOrder->items as $item) {
            $product = Products::where('name', $item->product_name)->first();

            // Ensure product exists
            if (!$product) {
                throw new \Exception("Product not found: " . $item->product_name);
            }

            // Retrieve the stock history for this product in reverse order (latest first)
            $stockHistories = StockHistory::where('product_id', $product->id)
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($stockHistories as $latestHistory) {
                // Revert stock deducted during the sales order
                if ($latestHistory->action === 'deducted') {
                    // If stock was deducted, we need to add it back (increase quantity)
                    // Ensure you're adding a positive value to the product's quantity
                    $product->quantity += abs($latestHistory->quantity_changed); // Use abs() to ensure positivity
                    // Delete the stock history entry after undoing the action
                    $latestHistory->delete();
                } 
                // If stock was added, do nothing to the stock history
            }

            // Save the updated product quantity
            $product->save();
        }

        // Delete the sales order items
        SalesOrderItems::where('sales_order_id', $orderId)->delete();

        // Delete the sales order
        $salesOrder->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Sales order deleted successfully',
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete sales order',
            'error' => $e->getMessage()
        ], 500);
    }
}




}






    


