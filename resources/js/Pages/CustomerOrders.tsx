import React, { useState, useEffect } from 'react';
import apiService from './Services/ApiService';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface Order {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  branch: string;
  created_at: string;
  updated_at: string;
  orders: Order[];
}

const CustomerOrders: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [doneCustomers, setDoneCustomers] = useState<number[]>([]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/orders`);
      if (response.data.success) {
        setCustomers(response.data.customers);
      } else {
        throw new Error('Failed to fetch customers.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const markAsDone = async (customerId: number) => {
    try {
      const response = await apiService.put(`/update-status/${customerId}`);
      if (response.data.success) {
        setDoneCustomers((prev) => [...prev, customerId]);
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating customer order status:', error);
      alert('An error occurred while updating the status.');
    }
    fetchCustomers();
  };

  const openModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center p-6">
        <p className="text-red-500 font-bold">{error}</p>
        <button
          onClick={fetchCustomers}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );

  return (
    <AuthenticatedLayout
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Customer Orders
        </h2>
      }
    >
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <div
              key={customer.id}
              className={`bg-white shadow-lg rounded-lg p-4 border ${
                doneCustomers.includes(customer.id) ? 'border-green-500' : 'border-gray-200'
              } hover:shadow-xl transition-shadow`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold">{customer.name}</h3>
                <p><strong>Phone:</strong> {customer.phone}</p>
                <p><strong>Address:</strong> {customer.address}</p>
                <p><strong>Branch:</strong> {customer.branch}</p>
              </div>
              <button
                onClick={() => openModal(customer)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                View Orders
              </button>
            </div>
          ))
        ) : (
          <div>No customers found.</div>
        )}

        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Orders for {selectedCustomer.name}
                </h3>
                <button onClick={closeModal} className="text-red-500 text-xl">
                  &times;
                </button>
              </div>
              {selectedCustomer.orders.length > 0 ? (
                <table className="w-full border-collapse border border-gray-200 mb-4">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="border px-4 py-2 text-left">Product Name</th>
                      <th className="border px-4 py-2 text-left">Quantity</th>
                      <th className="border px-4 py-2 text-left">Price</th>
                      <th className="border px-4 py-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="border px-4 py-2">{order.product_name}</td>
                        <td className="border px-4 py-2">{order.quantity}</td>
                        <td className="border px-4 py-2">{order.price}</td>
                        <td className="border px-4 py-2">{order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No orders found for this customer.</p>
              )}
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total:</span>
                <span>
                  {selectedCustomer.orders
                    .reduce((sum, order) => sum + (Number(order.total) || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => markAsDone(selectedCustomer.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  Done
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default CustomerOrders;
