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
            ->whereYear('date', $currentYear)
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

public function getDailySales(Request $request)
{
    try {
        $userName = $request->query('user_name');
        $startDate = $request->input('start_date', Carbon::today()->startOfWeek()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        $dailySales = SalesOrder::selectRaw('DATE(date) as day, SUM(SalesOrderItems.total) as sales')
            ->join('sales_order_items as SalesOrderItems', 'sales_orders.id', '=', 'SalesOrderItems.sales_order_id')
            ->where('branch_id', $userName)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->day)->format('Y-m-d'),
                    'sales' => round((float) $item->sales, 2)
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $dailySales
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch daily sales.',
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

}
