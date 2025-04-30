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
use App\Models\Remittance;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\SalesTarget;

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
        // Validate the date parameter
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);

        $requestedDate = $validated['date'];

        // Log the date being queried
        \Log::info("Querying daily sales for date: " . $requestedDate);

        // Query sales orders using exact match (VARCHAR column)
        $sales = SalesOrder::where('date', $requestedDate)
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

    // Get the image URL for each product
    $products->getCollection()->transform(function ($product) {
        $product->image_url = asset('storage/products/' . basename($product->image)); // Correct URL
        return $product;
    });

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
        $year = $request->query('year');
    
        // Start the query with necessary eager loading
        $query = DeliveryReceipt::with('items')
                ->orderBy('date', 'desc'); 
    
        // Apply the branch filter if branchName is provided
        if ($branchName) {
            $query->where('branch_id', $branchName);
        }
    
        // Apply the month filter if the month is provided
        if ($month) {
            $query->whereMonth('date', $month); // Filter by month
        }
    
        // Apply the year filter if the year is provided
        if ($year) {
            $query->whereYear('date', $year);
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

    $query = SalesOrder::with('items')
            ->orderBy('date', 'desc'); 

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

        // Calculate total (quantity * price)
        $total = $item['quantity'] * $item['price'];

        // Create supplier stock with total field
        SupplierStocks::create([
            'supplier_id' => $supplier->id,
            'product_code' => $item['product_code'],
            'product_name' => $item['product_name'],
            'quantity' => $item['quantity'],
            'price' => $item['price'],
            'total' => $total, // Add the total field
        ]);

        // Create stock history
        StockHistory::create([
            'product_id' => $product->id,
            'name' => $request->supplier_name,
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




public function deleteSupplierStocks($id)
{
    // Start a database transaction to ensure atomicity
    DB::beginTransaction();

    try {
        // Retrieve the supplier by ID
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        // Retrieve all supplier stock items associated with this supplier
        $supplierStocks = SupplierStocks::where('supplier_id', $supplier->id)->get();

        if ($supplierStocks->isEmpty()) {
            return response()->json(['message' => 'No items found for this supplier'], 404);
        }

        foreach ($supplierStocks as $stockItem) {
            // Find the product in the warehouse
            $product = Products::where('product_code', $stockItem->product_code)
                ->where('branch_id', 'warehouse')
                ->first();

            if (!$product) {
                return response()->json(['message' => 'Product with code ' . $stockItem->product_code . ' not found in warehouse.'], 404);
            }

            // Revert the quantity in the warehouse
            $product->quantity -= $stockItem->quantity;

            if ($product->quantity < 0) {
                return response()->json(['message' => 'Negative stock detected for product: ' . $stockItem->product_code], 400);
            }

            $product->save();

            // Delete stock history entries for this item (action = 'added')
            StockHistory::where('receipt_number', $supplier->delivery_number)
                ->where('action', 'added') // Target warehouse actions
                ->delete();
        }

        // Delete the supplier stock items
        SupplierStocks::where('supplier_id', $supplier->id)->delete();

        // Delete the supplier
        $supplier->delete();

        // Commit the transaction
        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Supplier and items deleted successfully!',
        ]);
    } catch (\Exception $e) {
        // Rollback the transaction in case of an error
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'An error occurred while deleting the supplier',
            'error' => $e->getMessage(),
        ], 500);
    }
}



public function getAllSuppliers()
{
    $suppliers = Supplier::with('supplierStocks')
                ->orderBy('date', 'desc')
                ->paginate(10);
                

    // Log the fetched suppliers for debugging
    Log::info('Fetched Suppliers: ', $suppliers->toArray());

    return response()->json([
        'success' => true,
        'data' => $suppliers->items(), // Current page items
        'meta' => [
            'current_page' => $suppliers->currentPage(),
            'last_page' => $suppliers->lastPage(),
            'per_page' => $suppliers->perPage(),
            'total' => $suppliers->total(),
        ],
    ]);
}




public function salesStatistics(Request $request)
{
    // Get the selected year from the query parameter, default to the current year
    $selectedYear = $request->query('year', date('Y'));

    // Fetch sales data grouped by branch and month for the selected year
    $salesData = SalesOrder::select(
            'branch_id',
            DB::raw('YEAR(date) as year'),
            DB::raw('MONTH(date) as month'),
            DB::raw('SUM(sales_order_items.total) as total_sales')
        )
        ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.sales_order_id')
        ->whereYear('date', $selectedYear) // Filter by the selected year
        ->groupBy('branch_id', DB::raw('YEAR(date)'), DB::raw('MONTH(date)'))
        ->orderBy('year')
        ->orderBy('month')
        ->get();

    // Fetch remittance data (expenses) grouped by branch and month
    $remittanceData = Remittance::select(
            'branch_id',
            DB::raw('YEAR(date_start) as year'),
            DB::raw('MONTH(date_start) as month'),
            DB::raw('SUM(total_expenses) as total_expenses')
        )
        ->whereYear('date_start', $selectedYear)
        ->groupBy('branch_id', DB::raw('YEAR(date_start)'), DB::raw('MONTH(date_start)'))
        ->get();

    // Calculate total investment (sum of the 'total' column in supplier_stocks for the selected year)
    $rawTotalInvestment = SupplierStocks::whereYear('created_at', $selectedYear)->sum('total');
    $formattedTotalInvestment = number_format($rawTotalInvestment, 0); // Format total investment

    // Transform the data into the desired format
    $branchSalesData = [];
    foreach ($salesData as $record) {
        $branch = $record->branch_id;
        $year = $record->year;
        $month = $record->month - 1; // Adjust month index to match JavaScript's 0-based months
        $totalSales = $record->total_sales;

        if (!isset($branchSalesData[$branch])) {
            $branchSalesData[$branch] = [
                'branch' => $branch,
                'monthlySales' => array_fill(0, 12, 0),
                'yearlySales' => 0,
                'monthlyExpenses' => array_fill(0, 12, 0), // Initialize monthly expenses
                'yearlyExpenses' => 0, // Initialize yearly expenses
            ];
        }

        $branchSalesData[$branch]['monthlySales'][$month] += $totalSales;
        $branchSalesData[$branch]['yearlySales'] += $totalSales;
    }

    // Add expenses to the branch data
    foreach ($remittanceData as $record) {
        $branch = $record->branch_id;
        $month = $record->month - 1; // Adjust month index
        $totalExpenses = $record->total_expenses;

        if (isset($branchSalesData[$branch])) {
            $branchSalesData[$branch]['monthlyExpenses'][$month] += $totalExpenses;
            $branchSalesData[$branch]['yearlyExpenses'] += $totalExpenses;
        }
    }

    // Convert associative array to indexed array
    $result = array_values($branchSalesData);

    // Include total investment in the response
    return response()->json([
        'branchSalesData' => $result,
        'totalInvestment' => $formattedTotalInvestment, // Add formatted total investment here
    ]);
}

public function perBranchSalesStatistics(Request $request)
{
    $branchId = $request->query('branch');
    $year = $request->query('year');

    // Monthly sales data (unchanged)
    $monthlySales = SalesOrder::select(
            DB::raw('MONTH(date) as month'),
            DB::raw('SUM(sales_order_items.total) as sales')
        )
        ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.sales_order_id')
        ->where('branch_id', $branchId)
        ->whereYear('date', $year) // Filter by 'date' column for sales
        ->groupBy(DB::raw('MONTH(date)'))
        ->orderBy('month')
        ->get();

    // Total remittance expenses (updated to use 'created_at')
    $remittanceExpenses = Remittance::where('branch_id', $branchId)
        ->whereYear('created_at', $year) // Use 'created_at' instead of 'date'
        ->sum('total_expenses'); // Assuming 'total_expenses' is the column for remittance expenses

    return response()->json([
        'monthly_sales' => $monthlySales,
        'total_remittance_expenses' => $remittanceExpenses,
    ]);
}





// GET sales target by branch_id
public function getSalesTarget(Request $request)
{
    $branchId = $request->query('user_name');

    $salesTarget = SalesTarget::where('branch_id', $branchId)->first();

    return response()->json([
        'success' => true,
        'data' => $salesTarget ? $salesTarget->target_sales : 0,
    ]);
}

// POST or UPDATE sales target
public function saveSalesTarget(Request $request)
{
    $request->validate([
        'branch_id' => 'required|string',
        'target_sales' => 'required|numeric|min:0',
    ]);

    $branchId = $request->input('branch_id');
    $targetSales = $request->input('target_sales');

    $salesTarget = SalesTarget::updateOrCreate(
        ['branch_id' => $branchId],
        ['target_sales' => $targetSales]
    );

    return response()->json([
        'success' => true,
        'message' => 'Sales target saved successfully.',
    ]);
}





}





