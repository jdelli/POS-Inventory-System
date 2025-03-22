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
    // Validate the request input with custom rule for product_name existence
    $request->validate([
        'receipt_number' => 'required|string|max:255',
        'customer_name' => 'required|string|max:255',
        'date' => 'required|date',
        'branch_id' => 'required|string|max:255', // Ensure branch_id is required
        'payment_option' => 'required|string|max:255', 
        'items' => 'required|array',
        'items.*.product_code' => 'required|string|max:255',
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
    $salesOrder->branch_id = $request->branch_id;
    $salesOrder->payment_method = $request->payment_option; // Assign payment option
    $salesOrder->save();

    // Save the individual items
    foreach ($request->items as $item) {
        $salesOrderItem = new SalesOrderItems();
        $salesOrderItem->sales_order_id = $salesOrder->id; // FK to SalesOrder
        $salesOrderItem->product_code = $item['product_code'];
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
        $today = Carbon::now()->setTimezone('Asia/Manila')->format('y/m/d'); // Adjust as needed
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
    $today = Carbon::now()->setTimezone('Asia/Manila')->format('y/m/d'); // Adjust as needed

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
        // Fetch the sales order with its items
        $salesOrder = SalesOrder::with('items')->findOrFail($orderId);

        foreach ($salesOrder->items as $item) {
            $product = Products::where('product_code', $item->product_code)->first();

            if (!$product) {
                throw new \Exception("Product not found: " . $item->product_code);
            }

            // Get the exact quantity deducted for this sales order
            $quantityToRevert = $item->quantity;

            // Retrieve stock history where stock was deducted, ordered by newest first
            $stockHistories = StockHistory::where('product_id', $product->id)
                ->where('action', 'deducted')
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($stockHistories as $history) {
                if ($quantityToRevert <= 0) break; // Stop when we've reverted enough

                if ($history->quantity_changed <= $quantityToRevert) {
                    // If history entry is smaller than or equal to the quantity to revert
                    $product->quantity -= $history->quantity_changed;
                    $quantityToRevert += $history->quantity_changed;
                    $history->delete(); // Delete only this specific stock history entry
                } else {
                    // If history entry is larger than the quantity to revert
                    $product->quantity -= $quantityToRevert;
                    $history->quantity_changed += $quantityToRevert; // Adjust the remaining history
                    $history->save();
                    $quantityToRevert = 0; // All quantity has been reverted
                }
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




 public function mostSoldProducts(Request $request)
{
    $branch_id = $request->branch_id;

    // Fetch sales orders with items for the specified branch
    $sales = SalesOrder::where('branch_id', $branch_id)
        ->with('items') // Eager load items to avoid N+1 issue
        ->get()
        ->flatMap(fn($order) => $order->items)
        ->groupBy('product_name')
        ->map(fn($items, $productName) => [
            'product_name' => $productName,
            'total_quantity' => $items->sum('quantity'), // ✅ Changed key name
            'total_amount' => $items->sum(fn($item) => $item->quantity * $item->price), // Calculate total amount
        ])
        ->sortByDesc('total_quantity')
        ->take(5)
        ->values(); // Reset the keys

    return response()->json([
        'success' => true,
        'data' => $sales
    ]);
}



}



    


