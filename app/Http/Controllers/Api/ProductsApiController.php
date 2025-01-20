<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Products;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


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
        // Validate that category is a string if it's provided
        $request->validate([
            'category' => 'nullable|string|max:255'
        ]);
        $category = $request->query('category', null);
        $perPage = $request->query('per_page', 20); // Default to 20 items per page

        try {
            if ($category) {
                $products = Products::where('category', $category)->paginate($perPage);
            } else {
                $products = Products::paginate($perPage);
            }

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
            'name' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Products::where('name', $validatedData['name'])->first();

        if ($product) {
            // Deduct the quantity
            $product->quantity -= $validatedData['quantity'];
            $product->save();

            return response()->json(['message' => 'Quantity deducted successfully', 'product' => $product], 200);
        }

        return response()->json(['message' => 'Product not found'], 404);
    }


    public function AddQuantity(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Products::where('name', $validatedData['name'])->first();

        if ($product) {
            // Deduct the quantity
            $product->quantity += $validatedData['quantity'];
            $product->save();

            return response()->json(['message' => 'Stocks Added successfully', 'product' => $product], 200);
        }

        return response()->json(['message' => 'Product not found'], 404);
    }


    public function search(Request $request)
    {
        $searchTerm = $request->query('q');

        // Query the database for products that match the search term
        $products = Products::where('name', 'like', '%' . $searchTerm . '%')->get();

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
