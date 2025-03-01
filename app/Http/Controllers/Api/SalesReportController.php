<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SalesOrder;
use App\Models\SalesOrderItems;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    public function dailySalesReport(Request $request)
{
    $userName = $request->input('user_name');
    

    $sales = SalesOrder::with('items')
        ->selectRaw('date, SUM(items.total) as total_sales')
        ->join('sales_order_items as items', 'sales_orders.id', '=', 'items.sales_order_id')
        ->when($userName, function ($query) use ($userName) {
            return $query->where('branch_id', $userName);
        })
        ->groupBy('date')
        ->orderBy('date', 'desc')
        ->get();

    return response()->json($sales);
}



public function getSalesOrdersByDate(Request $request)
{
    $date = $request->input('date');
    $userName = $request->input('user_name');

    $salesOrders = SalesOrder::with('items')
        ->when($userName, function ($query) use ($userName) {
            return $query->where('branch_id', $userName);
        })
        ->where('date', $date)
        ->orderBy('id', 'asc')
        ->get();

    return response()->json($salesOrders);
}

public function fetchMonthlySales(Request $request)
{
    try {
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));

        // Get sales data for the specified month and year
        $monthlySales = SalesOrderItems::select(
                'product_code',
                'product_name',
                DB::raw('SUM(quantity) as total_quantity_sold'),
                DB::raw('SUM(total) as total_sales')
            )
            ->whereHas('salesOrder', function ($query) use ($month, $year) {
                $query->whereMonth('date', $month)
                      ->whereYear('date', $year);
            })
            ->groupBy('product_code', 'product_name')
            ->orderByDesc('total_quantity_sold') // Sort by quantity sold
            ->get();

        // Calculate the Grand Total (sum of total_sales)
        $grandTotal = $monthlySales->sum('total_sales');

        return response()->json([
            'monthlySales' => $monthlySales,
            'grandTotal' => $grandTotal, // Include Grand Total in response
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch monthly sales', 'message' => $e->getMessage()], 500);
    }
}

}
