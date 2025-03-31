<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SalesOrder;
use App\Models\SalesOrderItems;
use App\Models\Remittance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SalesReportController extends Controller
{
    public function dailySalesReport(Request $request)
{
    $userName = $request->input('user_name');
    
    // Paginate the results (10 items per page, adjust as needed)
    $sales = SalesOrder::with('items')
        ->selectRaw('date, SUM(items.total) as total_sales')
        ->join('sales_order_items as items', 'sales_orders.id', '=', 'items.sales_order_id')
        ->when($userName, function ($query) use ($userName) {
            return $query->where('branch_id', $userName);
        })
        ->groupBy('date')
        ->orderBy('date', 'desc')
        ->paginate(10);  // Paginate results (10 per page)

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
        $branchId = $request->input('user_name'); // Changed variable name for clarity

        // Get sales data for the specified month and year
        $monthlySales = SalesOrderItems::select(
                'product_code',
                'product_name',
                DB::raw('SUM(quantity) as total_quantity_sold'),
                DB::raw('SUM(total) as total_sales')
            )
            ->whereHas('salesOrder', function ($query) use ($month, $year, $branchId) {
                $query->where('branch_id', $branchId) // Ensure branch filtering
                      ->whereMonth('date', $month)
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


public function getTotalSales(Request $request)
{
    try {
        $branchId = $request->input('user_name');

        // Log request data
        Log::info('Fetching total sales', [
            'branch_id' => $branchId,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date
        ]);

        // Validate date range input
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Define online payment methods
        $onlinePayments = ['Gcash', 'Bank Transfer', 'Others'];

        // Query for cash sales
        $cashOrders = SalesOrder::where('branch_id', $branchId)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->where('payment_method', 'Cash')
            ->pluck('id'); // Get only the sales order IDs

        $cashSales = SalesOrderItems::whereIn('sales_order_id', $cashOrders)->sum('total');

        Log::info('Cash sales total:', ['cash_sales' => $cashSales]);

        // Query for online payments
        $onlineOrders = SalesOrder::where('branch_id', $branchId)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->whereIn('payment_method', $onlinePayments)
            ->pluck('id'); // Get only the sales order IDs

        $onlineSales = SalesOrderItems::whereIn('sales_order_id', $onlineOrders)->sum('total');

        Log::info('Online sales total:', ['online_sales' => $onlineSales]);

        return response()->json([
            'cash_sales' => $cashSales,
            'online_sales' => $onlineSales,
            'total_sales' => $cashSales + $onlineSales,
        ]);
    } catch (\Exception $e) {
        Log::error('Failed to fetch total sales', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to fetch total sales', 'message' => $e->getMessage()], 500);
    }
}





public function store(Request $request)
    {
        // Validate input data
        $request->validate([
            'date_start'      => 'required|date',
            'date_end'        => 'required|date|after_or_equal:date_start',
            'total_sales'     => 'required|numeric|min:0',
            'expenses'        => 'nullable|array',
            'total_expenses'  => 'required|numeric|min:0',
            'remaining_cash'  => 'required|numeric|min:0',
            'user_name'       => 'required|string',
        ]);

        // Create a new Cash Breakdown entry
        $cashBreakdown = Remittance::create([
            'date_start'      => $request->date_start,
            'date_end'        => $request->date_end,
            'branch_id'       => $request->user_name, // Corrected this
            'total_sales'     => $request->total_sales,
            'cash_breakdown'  => json_encode($request->cash_breakdown), // Store as JSON
            'total_cash'      => $request->total_cash,
            'expenses'        => json_encode($request->expenses), // Store as JSON
            'total_expenses'  => $request->total_expenses,
            'remaining_cash'  => $request->remaining_cash,
            'online_payments'  => $request->online_payments,
            'status'          => false, // Default to "pending"
            
        ]);

        return response()->json([
            'message' => 'Cash breakdown created successfully!',
            'data'    => $cashBreakdown
        ], 201);
    }

    /**
     * Retrieve all cash breakdowns.
     */
    public function index(Request $request)
{
    // Validate that branch_id is provided
    $request->validate([
        'branch_id' => 'required|string',
        'page' => 'nullable|integer|min:1', // Handle page parameter
    ]);

    $branchId = $request->query('branch_id');
    $page = $request->query('page', 1); // Default to page 1 if not provided

    // Fetch remittances for the specific branch with pagination
    $cashBreakdowns = Remittance::where('branch_id', $branchId)
        ->orderBy('created_at', 'desc')
        ->paginate(10, ['*'], 'page', $page); // Paginate 10 items per page

    return response()->json([
        'success' => true,
        'data' => $cashBreakdowns->items(),
        'current_page' => $cashBreakdowns->currentPage(),
        'last_page' => $cashBreakdowns->lastPage(),
        'total' => $cashBreakdowns->total(),
    ]);
}



    /**
     * Get a specific cash breakdown by ID.
     */
    public function show(Request $request, $id)
    {
        // Validate that branch_id is provided in the request
        $request->validate([
            'branch_id' => 'required|string',
        ]);
    
        // Get branch_id from query parameters
        $branchId = $request->query('branch_id');
    
        // Fetch remittance data while ensuring the branch matches
        $cashBreakdown = Remittance::where('id', $id)
            ->where('branch_id', $branchId)
            ->first();
    
        // Check if remittance was found
        if (!$cashBreakdown) {
            return response()->json([
                'success' => false,
                'message' => 'No remittance found for this branch.',
            ], 404);
        }
    
        return response()->json([
            'success' => true,
            'data' => $cashBreakdown,
        ]);
    }
    

    /**
     * Delete a cash breakdown entry.
     */
    public function destroy($id)
    {
        $cashBreakdown = Remittance::findOrFail($id);
        $cashBreakdown->delete();
    
        return response()->json([
            'success' => true,  // Add this field
            'message' => 'Cash breakdown deleted successfully.'
        ]);
    }
    





}
