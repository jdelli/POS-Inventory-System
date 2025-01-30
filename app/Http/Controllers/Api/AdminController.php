<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller; // Add this line
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use App\Models\Products;
use App\Models\StockHistory;

class AdminController extends Controller
{
    public function getTotalSalesByUser(Request $request)
    {
        $year = $request->query('year', Carbon::now()->year);

        // Fetch sales by branch and include the sum of related sales order items
        $sales = SalesOrder::selectRaw('branch_id, SUM(sales_order_items.total) as total_sales')
            ->join('sales_order_items', 'sales_order_items.sales_order_id', '=', 'sales_orders.id')
            ->whereYear('sales_orders.date', $year) // Filter by the specified year
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



public function getDailySales(Request $request)
{
    $date = $request->query('date', Carbon::today());

    $sales = SalesOrder::whereDate('date', $date)
        ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.sales_order_id')
        ->selectRaw('branch_id, SUM(sales_order_items.price * sales_order_items.quantity) as total_sales')
        ->groupBy('branch_id')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $sales,
    ]);
}


public function getAllBranches()
{
    // Fetch all users' names excluding the ones named "Admin"
    $users = User::where('name', '!=', 'Admin')
                 ->select('id', 'name')
                 ->get();
    
    // Return the users as a JSON response
    return response()->json($users);
}








    public function AdminfetchProductsByBranch(Request $request)
    {
        $branchName = $request->query('branch_name');
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 20);
    

        $query = Products::query(); // Start a new query
    
        if ($branchName) {
            $query->where('branch_id', $branchName);
        } 
    
        $products = $query->paginate($limit, ['*'], 'page', $page);
    
        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'last_page' => $products->lastPage(),
        ]);
    }
    


    public function getStockHistory($productId)
{
    $history = StockHistory::where('product_id', $productId)
                ->orderBy('created_at', 'desc')
                ->get();

    return response()->json($history);
}


}





