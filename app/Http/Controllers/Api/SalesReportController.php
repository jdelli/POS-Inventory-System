<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SalesOrder;
use App\Models\SalesOrderItems;
use App\Models\Remittance;
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

        // Validate date range input
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Get total sales within the specified date range and branch
        $totalSales = SalesOrderItems::whereHas('salesOrder', function ($query) use ($request, $branchId) {
            $query->where('branch_id', $branchId) // Ensure branch filtering
                  ->whereBetween('date', [$request->start_date, $request->end_date]);
        })->sum('total');

        return response()->json([
            'total_sales' => $totalSales,
        ]);
    } catch (\Exception $e) {
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
            'cash_breakdown'  => 'required|array',
            'total_cash'      => 'required|numeric|min:0',
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
    ]);

    // Get the branch_id from the request
    $branchId = $request->query('branch_id');

    // Fetch remittances for the specific branch
    $cashBreakdowns = Remittance::where('branch_id', $branchId)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $cashBreakdowns,
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

        return response()->json(['message' => 'Cash breakdown deleted successfully.']);
    }





}
