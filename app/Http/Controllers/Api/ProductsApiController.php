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
        'product_code' => 'required|string|unique:products,product_code',
        'branch_id' => 'required|string|max:255', // Ensure branch_id is provided
        'name' => 'required|string|max:255',
        'description' => 'required|string|max:1000',
        'price' => 'required|numeric|min:0',
        'category' => 'required|string|max:255',
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Create a new Product instance
    $product = new Products();
    $product->branch_id = $request->branch_id; // Assign branch_id from the request
    $product->product_code = $request->product_code; // Assign product_code from the request
    $product->name = $request->name;
    $product->description = $request->description;
    $product->price = $request->price;
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
    $userName = $request->query('user_name');
    $page = $request->query('page', 1);
    $limit = $request->query('limit', 20);

    // Fetch products with full image URL
    $products = Products::where('branch_id', $userName)
                        ->paginate($limit)
                        ->through(function ($product) {
                            return [
                                'id' => $product->id,
                                'product_code' => $product->product_code,
                                'name' => $product->name,
                                'category' => $product->category,
                                'price' => $product->price,
                                'quantity' => $product->quantity,
                                'image_url' => asset('storage/products/' . basename($product->image)), // Correct URL
                            ];
                        });
                        
    // Fetch warehouse products
    $warehouse = Products::where('branch_id', 'warehouse')
                        ->paginate($limit)
                        ->through(function ($product) {
                            return [
                                'id' => $product->id,
                                'product_code' => $product->product_code,
                                'name' => $product->name,
                                'category' => $product->category,
                                'price' => $product->price,
                                'quantity' => $product->quantity,
                                'image_url' => asset('storage/products/' . basename($product->image)), // Correct URL
                            ];
                        });

            return response()->json([
                'branch' => $products,
                'warehouse' => $warehouse,
            ]);
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


        
}
