import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import Receipt from '../Props/Receipt';

// Interfaces
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Item {
  name: string;
  price: number;
  quantity: number;
  id: number;
}

interface SalesOrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
}

interface SalesOrder {
  id: number;
  customer_name: string;
  receipt_number: string;
  date: string;
  items: SalesOrderItem[];
}

interface Auth {
  user: {
    name: string;
  };
}

interface InventoryManagementProps {
  auth: Auth;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ auth }) => {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState<boolean>(false);
  const [receiptItems, setReceiptItems] = useState<Item[]>([{ name: '', price: 0, quantity: 0, id: 0 }]);
  const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [client, setClient] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiService.get('/get-branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  const closeOrderDetailModal = () => {
    setIsOrderDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Reset receipt form
  const resetReceiptForm = () => {
    setReceiptItems([{ name: '', price: 0, quantity: 0, id: 0 }]);
    setProductSuggestions([]);
    setSearchTerms(['']);
    setClient('');
    setReceiptNumber('');
    setDate('');
  };

  // View order details
  const viewOrderDetails = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  // Fetch products by branch and date range
  const fetchProductsByBranch = async (branchName: string, page = 1, limit = 20) => {
    if (!branchName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.get('/admin-get-sales-orders', {
        params: { branch_name: branchName, page, limit, month: selectedMonth, year: selectedYear },
      });

      setFilteredOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBranchName) {
      fetchProductsByBranch(selectedBranchName, currentPage);
    }
  }, [selectedBranchName, currentPage, selectedMonth, selectedYear]);

  // Date formatting
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Order</h2>}>
      <Head title="Inventory" />
      <div className="p-4">
        <div className="mb-4 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <select
            value={selectedBranchName || ''}
            onChange={(e) => {
              setSelectedBranchName(e.target.value);
              setCurrentPage(1); // Reset to first page when branch changes
            }}
            className="border rounded-md py-2 px-3 w-full md:w-auto"
            aria-label="Select Branch"
          >
            <option value="" disabled>
              Select Branch
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>

          {/* Date Range Filters */}
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <div>
              <label className="text-gray-700">Filter by Month</label>
              <select
                value={selectedMonth ?? ''}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                }}
                className="border rounded-md py-2 px-3 w-full md:w-auto"
                aria-label="Select Month"
              >
                <option value="" disabled>
                  Select Month
                </option>
                {[...Array(12).keys()].map((month) => (
                  <option key={month} value={month + 1}>
                    {new Date(2025, month).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-700">Filter by Year</label>
              <select
                value={selectedYear ?? ''}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                }}
                className="border rounded-md py-2 px-3 w-full md:w-auto"
                aria-label="Select Year"
              >
                <option value="" disabled>
                  Select Year
                </option>
                {[2022, 2023, 2024, 2025].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Render orders */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left border">Receipt Number</th>
                <th className="py-2 px-4 text-left border">Customer</th>
                <th className="py-2 px-4 text-left border">Date</th>
                <th className="py-2 px-4 text-left border">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{order.receipt_number}</td>
                  <td className="py-2 px-4 border">{order.customer_name}</td>
                  <td className="py-2 px-4 border">{formatDate(order.date)}</td>
                  <td className="py-2 px-4 border">
                    <button onClick={() => viewOrderDetails(order)} className="text-blue-500 hover:underline">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && isOrderDetailModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl">
              <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
              <ul className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="font-medium">{item.product_name}</span>
                    <span>{item.price} x {item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 font-semibold">
                Total: ${selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </div>
              <button 
                onClick={closeOrderDetailModal} 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InventoryManagement;