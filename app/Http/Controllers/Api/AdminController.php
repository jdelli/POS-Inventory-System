<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller; // Add this line
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use App\Models\Products;

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



public function getAllBranches()
    {
        // Fetch all users' names
        $users = User::select('id', 'name')->get();
        
        // Return the users as a JSON response
        return response()->json($users);
    }










public function AdminfetchProductsByBranch(Request $request)
{
    // Getting the branch_id parameter from the request
    $branchId = $request->query('branch_id'); 
    \Log::info('Fetching products for branch:', ['branch_id' => $branchId]);

    // Default values for pagination
    $page = $request->query('page', 1);
    $limit = $request->query('limit', 20);

    // Debugging pagination values
    \Log::info('Pagination details:', ['page' => $page, 'limit' => $limit]);

    // Query products based on the branch_id (if provided)
    $query = Products::query(); // Start a new query

    if ($branchId) {
        // Filter by branch_id if it's provided
        \Log::info('Filtering products by branch_id:', ['branch_id' => $branchId]);
        $query->where('branch_id', $branchId);
    } else {
        \Log::info('No branch_id provided, fetching all products.');
    }

    // Get paginated results
    $products = $query->paginate($limit, ['*'], 'page', $page);

    // Debugging the result of the query
    \Log::info('Fetched products:', ['total' => $products->total(), 'data' => $products->items()]);

    // Return the paginated results in the desired format
    return response()->json([
        'data' => $products->items(),
        'current_page' => $products->currentPage(),
        'per_page' => $products->perPage(),
        'total' => $products->total(),
        'last_page' => $products->lastPage(),
    ]);
}

}





