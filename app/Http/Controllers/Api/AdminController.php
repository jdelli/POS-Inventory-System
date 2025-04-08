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
use App\Models\DeliveryReceipt;
use App\Models\Supplier;
use App\Models\SupplierStocks;
use Illuminate\Support\Facades\Log;

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



    public function getDailySalesAllBranch(Request $request)
{
    // Get today's date in 'YY/MM/DD' format for matching database records
    $date = Carbon::now()->setTimezone('Asia/Manila')->format('y/m/d');

    // Log the date being queried
    \Log::info("Querying daily sales for date: " . $date);

    // Query sales orders using exact match (VARCHAR column)
    $sales = SalesOrder::where('date', $date)
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



    public function AdminfetchDeliveryReceiptsByBranch(Request $request)
    {
        $branchName = $request->query('branch_name');
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 20);
        $month = $request->query('month');  // Get the month parameter
    
        // Start the query with necessary eager loading
        $query = DeliveryReceipt::with('items');
    
        // Apply the branch filter if branchName is provided
        if ($branchName) {
            $query->where('branch_id', $branchName);
        }
    
        // Apply the month filter if the month is provided
        if ($month) {
            $query->whereMonth('date', $month); // Filter by month
        }
    
        // Paginate the results
        $deliveryReceipts = $query->paginate($limit, ['*'], 'page', $page);
    
        // Return the paginated results as JSON
        return response()->json([
            'data' => $deliveryReceipts->items(),
            'current_page' => $deliveryReceipts->currentPage(),
            'per_page' => $deliveryReceipts->perPage(),
            'total' => $deliveryReceipts->total(),
            'last_page' => $deliveryReceipts->lastPage(),
        ]);
    }
    



    public function adminGetSalesOrders(Request $request)
{
    $branchName = $request->query('branch_name');
    $page = $request->query('page', 1);
    $limit = $request->query('limit', 20);
    $month = $request->query('month');
    $year = $request->query('year');

    $query = SalesOrder::with('items');

    if ($branchName) {
        $query->where('branch_id', $branchName);
    }

    if ($month && $year) {
        $query->whereMonth('date', $month)->whereYear('date', $year);
    } elseif ($month) {
        $query->whereMonth('date', $month);
    } elseif ($year) {
        $query->whereYear('date', $year);
    }

    $salesOrders = $query->paginate($limit, ['*'], 'page', $page);

    return response()->json([
        'data' => $salesOrders->items(),
        'current_page' => $salesOrders->currentPage(),
        'per_page' => $salesOrders->perPage(),
        'total' => $salesOrders->total(),
        'last_page' => $salesOrders->lastPage(),
    ]);
}


public function dailySalesReportAllBranch(Request $request)
    {
        $sales = SalesOrder::with('items')
            ->selectRaw('date, SUM(items.total) as total_sales')
            ->join('sales_order_items as items', 'sales_orders.id', '=', 'items.sales_order_id')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($sales);
    }
    


    public function getStockHistory($productId)
{
    $history = StockHistory::where('product_id', $productId)
                ->orderBy('created_at', 'desc')
                ->get();

    return response()->json($history);
}




public function addSupplierStocks(Request $request)
{
    $request->validate([
        'supplier_name' => 'required|string|max:255',
        'delivery_number' => 'required|string|max:255',
        'date' => 'required|date',
        'product_category' => 'required|string|max:255',
        'items' => 'required|array',
        'items.*.product_code' => 'required|string|max:255',
        'items.*.product_name' => 'required|string|max:255',
        'items.*.quantity' => 'required|integer',
        'items.*.price' => 'required|numeric',
    ]);

    // Create the supplier
    $supplier = Supplier::create([
        'supplier_name' => $request->supplier_name,
        'delivery_number' => $request->delivery_number,
        'product_category' => $request->product_category,
        'date' => $request->date,
    ]);

    // Loop through each item
    foreach ($request->items as $item) {

        // Find product in warehouse
        $product = Products::where('product_code', $item['product_code'])
            ->where('branch_id', 'warehouse')
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product with code ' . $item['product_code'] . ' not found in warehouse.'], 404);
        }

        // Update product quantity
        $product->quantity += $item['quantity'];
        $product->save();

        // Create supplier stock
        SupplierStocks::create([
            'supplier_id' => $supplier->id,
            'product_code' => $item['product_code'],
            'product_name' => $item['product_name'],
            'quantity' => $item['quantity'],
            'price' => $item['price'],
        ]);

        // Create stock history
        StockHistory::create([
            'product_id' => $product->id,
            'name' =>  $request->supplier_name,
            'receipt_number' => $request->delivery_number,
            'date' => $request->date,
            'quantity_changed' => $item['quantity'],
            'remaining_stock' => $product->quantity,
            'action' => 'added',
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => 'Supplier and items added successfully!',
        'data' => $supplier->load('supplierStocks'),
    ], 201);
}



public function getAllSuppliers()
{
    $suppliers = Supplier::with('supplierStocks')->get();

    // Log the fetched suppliers for debugging
    Log::info('Fetched Suppliers: ', $suppliers->toArray());

    return response()->json([
        'success' => true,
        'data' => $suppliers
    ]);
}



}





