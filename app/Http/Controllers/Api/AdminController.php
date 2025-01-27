<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller; // Add this line
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function getTotalSalesByUser()
{
    // Fetch sales by branch and include the sum of related sales order items
    $sales = SalesOrder::selectRaw('branch_id, SUM(sales_order_items.total) as total_sales')
        ->join('sales_order_items', 'sales_order_items.sales_order_id', '=', 'sales_orders.id')
        ->groupBy('sales_orders.branch_id')
        ->get();

    // Format the data to include branch name for better representation
    $formattedSales = $sales->map(function ($sale) {
        return [
            'branch_id' => $sale->branch_id,
            'total_sales' => $sale->total_sales,
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $formattedSales
    ]);
}


public function getDailySales()
{
    $today = Carbon::today();

    $sales = SalesOrder::whereDate('date', $today)
        ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.sales_order_id')
        ->selectRaw('branch_id, SUM(sales_order_items.price * sales_order_items.quantity) as total_sales')
        ->groupBy('branch_id')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $sales,
    ]);
}

}





