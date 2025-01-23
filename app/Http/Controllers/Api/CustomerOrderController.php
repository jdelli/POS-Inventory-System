<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\CustomerOrders;


class CustomerOrderController extends Controller
{
    public function addCustomerOrder(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'branch' => 'required|string|max:255',
            'orders' => 'required|array',
            'orders.*.product_name' => 'required|string|max:255',
            'orders.*.quantity' => 'required|integer|min:1',
            'orders.*.price' => 'required|numeric|min:0',
            'orders.*.total' => 'required|numeric|min:0',  // Validate total
        ]);

        // Create a new Customer instance
        $customer = new Customer();
        $customer->name = $validated['name'];
        $customer->phone = $validated['phone'];
        $customer->address = $validated['address'];
        $customer->branch = $validated['branch'];
        $customer->save();

        // Save the individual orders
        foreach ($validated['orders'] as $order) {
            $customerOrder = new CustomerOrders();
            $customerOrder->customer_id = $customer->id; // FK to Customer
            $customerOrder->product_name = $order['product_name'];
            $customerOrder->quantity = $order['quantity'];
            $customerOrder->price = $order['price'];
            $customerOrder->total = $order['total'];
            $customerOrder->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Customer order added successfully.',
            'customer' => $customer
        ]);
            
    }



  public function getAllCustomerOrders( Request $request)
{
    try {

        $branch = $request->query('username');
        // Fetch customers with false status and their related orders
        $customers = Customer::with('orders')->where('branch', $branch)
            ->where('status', false) // Filter customers with status false
            ->get();

        return response()->json([
            'success' => true,
            'customers' => $customers, // Includes only customers with status false and their orders
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'An error occurred while fetching customer orders.',
            'error' => $e->getMessage(),
        ], 500);
    }
}



public function updateCustomerOrderStatus(Request $request, $id)
{
    try {
        // Find the customer by ID
        $customer = Customer::findOrFail($id);

        // Update the customer's status
        $customer->status = true; // Set status to true
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Customer order status updated successfully.',
        ], 200);        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'An error occurred while updating customer order status.',
            'error' => $e->getMessage(),
        ], 500);
    }




}

public function forwardOrder(Request $request, $id)
{
    try {
        // Validate the request input
        $validatedData = $request->validate([
    'branch' => 'required|string|in:Cainta,Makati,Quezon City,San Mateo,Taguig,Pasig,Manila,Mandaluyong,Marikina,Caloocan,Las Piñas,Muntinlupa,Parañaque,Pasay,Pateros,Navotas,Valenzuela,Malabon,San Juan'
]);


        // Find the customer by ID
        $customer = Customer::findOrFail($id);

        // Update the branch
        $customer->branch = $validatedData['branch'];
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Customer branch updated successfully.',
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'An error occurred: ' . $e->getMessage(),
        ], 500);
    }
}




}