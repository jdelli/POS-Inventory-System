<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Products;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\StockHistory;
use App\Models\DeliveryReceipt;
use App\Models\SalesOrder;
use App\Models\SalesOrderItems;
use Illuminate\Support\Facades\DB;



class ProductsApiController extends Controller
{
    public function addProduct(Request $request)
{
    // Validate the request input
    $request->validate([
        'branch_id' => 'required|string|max:255', // Ensure branch_id is provided
        'name' => 'required|string|max:255',
        'description' => 'required|string|max:1000',
        'price' => 'required|numeric|min:0',
        'quantity' => 'required|integer|min:0',
        'category' => 'required|string|max:255',
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Create a new Product instance
    $product = new Products();
    $product->branch_id = $request->branch_id; // Assign branch_id from the request
    $product->name = $request->name;
    $product->description = $request->description;
    $product->price = $request->price;
    $product->quantity = $request->quantity;
    $product->category = $request->category;

    // Store the image and save its path
    $product->image = $request->file('image')->store('products', 'public'); // 'products' is the folder name

    // Save the product to the database
    $product->save();

    // Return a success response
    return response()->json([
        'success' => true,
        'message' => 'Product created successfully',
        'data' => $product
    ]);
}


 public function fetchProducts(Request $request)
{
    // Validate category input
    $request->validate([
        'category' => 'nullable|string|max:255'
    ]);

    $category = $request->query('category', null);
    $perPage = $request->query('per_page', 20); // Default: 20 items per page

    try {
        // Subquery to get the latest product ID per name
        $subQuery = Products::selectRaw('MIN(id) as id')
            ->groupBy('name');

        if ($category) {
            $subQuery->where('category', $category);
        }

        // Fetch only unique products by joining with the subquery
        $products = Products::whereIn('id', $subQuery)
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(), // Paginated items
            'count' => $products->total(), // Total number of products
            'current_page' => $products->currentPage(), // Current page
            'last_page' => $products->lastPage(), // Last page
            'per_page' => $products->perPage(), // Items per page
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching products: ' . $e->getMessage()
        ], 500);
    }
}




public function fetchProductsByBranch(Request $request)
{
    // Get the user name from the request
    $userName = $request->query('user_name');
    $page = $request->query('page', 1);
    $limit = $request->query('limit', 20);

    // Fetch products where branch_id matches the user name
    $products = Products::where('branch_id', $userName)
                        ->paginate($limit, ['*'], 'page', $page);

    // Return the products as a JSON response
    return response()->json($products);
}




    public function updateProduct(Request $request, $id)
    {
        $product = new Products();

        $product = $product->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }


         $product->update($request->all());
        return response()->json(['message' => 'Employee updated successfully', 'product' => $product], 200);
      
    }



    public function deleteProduct($id)
    {
        $product = new Products();
        $product = $product->find($id);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully'], 200);
    }   




   public function deductQuantity(Request $request)
{
    $validatedData = $request->validate([
        'id' => 'required|integer|exists:products,id',
        'quantity' => 'required|integer|min:1',
        'name' => 'required|string|max:255',
        'receipt_number' => 'required|string|max:255',
        'date' => 'required|date',
    ]);

    $product = Products::find($validatedData['id']);

    if ($validatedData['quantity'] > $product->quantity) {
        return response()->json([
            'message' => 'Error: Inputted quantity exceeds current stock',
            'current_stock' => $product->quantity
        ], 400);
    }

    $product->quantity -= $validatedData['quantity'];
    $product->save();

    // Log to history
    StockHistory::create([
        'product_id' => $product->id,
        'name' => $validatedData['name'],
        'receipt_number' => $validatedData['receipt_number'], 
        'date' => $validatedData['date'],
        'quantity_changed' => -$validatedData['quantity'], // Use negative for deduction
        'remaining_stock' => $product->quantity,
        'action' => 'deducted',
    ]);

    return response()->json([
        'message' => 'Quantity deducted successfully',
        'product' => $product
    ], 200);
}



public function addQuantity(Request $request)
{
    $validatedData = $request->validate([
        'id' => 'required|integer|exists:products,id',
        'quantity' => 'required|integer|min:1',
        'name' => 'required|string|max:255',
        'receipt_number' => 'required|string|max:255',
        'date' => 'required|date',
    ]);

    $product = Products::find($validatedData['id']);

    if ($product) {
        $product->quantity += $validatedData['quantity'];
        $product->save();

        // Log to history
        StockHistory::create([
            'product_id' => $product->id,
            'name' => $validatedData['name'],
            'receipt_number' => $validatedData['receipt_number'],
            'date' => $validatedData['date'],
            'quantity_changed' => $validatedData['quantity'],
            'remaining_stock' => $product->quantity,
            'action' => 'added',
        ]);

        return response()->json(['message' => 'Stocks Added successfully', 'product' => $product], 200);
    }

    return response()->json(['message' => 'Product not found'], 404);
}




    public function search(Request $request)
{
    $searchTerm = $request->query('q');
    $userName = $request->query('user_name');

    // Validate required parameters
    if (!$searchTerm || !$userName) {
        return response()->json(['error' => 'Missing required parameters.'], 400);
    }

  
    $products = Products::where('branch_id', $userName)
        ->where('name', 'like', '%' . $searchTerm . '%')
        ->get();
    
    return response()->json($products);
}



    public function getTotalProducts()
    {
        try {
            // Count the total number of clients in the database
            $totalProducts = Products::count();

            return response()->json([
                'success' => true,
                'totalProducts' => $totalProducts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch total products.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function undoStockChange(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|integer|exists:products,id'
        ]);

        DB::beginTransaction();

        try {
            // Retrieve the latest stock history for the given product
            $latestHistory = StockHistory::where('product_id', $validatedData['product_id'])
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestHistory) {
                return response()->json(['message' => 'No stock change history found for this product'], 404);
            }

            $product = Products::find($validatedData['product_id']);

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            if ($latestHistory->action === 'added') {
                // If stock was added, decrease quantity
                $product->quantity -= $latestHistory->quantity_changed;

                // Delete the related delivery receipt
                DeliveryReceipt::where('delivery_number', $latestHistory->receipt_number)->delete();
            } elseif ($latestHistory->action === 'deducted') {
                // If stock was deducted, increase quantity
                $product->quantity += abs($latestHistory->quantity_changed);

                // Delete the related sales order
                SalesOrder::where('receipt_number', $latestHistory->receipt_number)->delete();
            }

            // Save the updated product quantity
            $product->save();

            // Delete the stock history entry after undoing
            $latestHistory->delete();

            DB::commit();

            return response()->json([
                'message' => 'Stock change undone successfully',
                'product' => $product
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to undo stock change', 'message' => $e->getMessage()], 500);
        }
    }




        
}
