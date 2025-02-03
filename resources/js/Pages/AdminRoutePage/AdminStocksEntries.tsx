import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import ViewItemsModal from '../Props/ViewDelivery';
import AddStocks from '../Props/AddStocks';

interface DeliveryItem {
  id: number;
  product_name: string;
  quantity: number;
  date: string;
}

interface StockEntry {
  id: number;
  delivery_number: string;
  delivered_by: string;
  date: string;
  items: DeliveryItem[];
}

interface Auth {
  user: {
    name: string;
    role: string;
  };
}

interface InventoryManagementProps {
  auth: Auth;
}

const StockEntriesTableAdmin: React.FC<InventoryManagementProps> = ({ auth }) => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isAddStocksModalOpen, setIsAddStocksModalOpen] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);

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

  const fetchDeliveryReceipts = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/admin-fetch-delivery-receipts-by-branch', {
        params: {
          branch_name: selectedBranchName,
          page,
          limit,
          month: selectedMonth,
        },
      });
      setStockEntries(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching stock entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryReceipts();
  }, [page, selectedBranchName, limit, selectedMonth]);



  const handleAddStocksSuccess = () => {
    fetchDeliveryReceipts();
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Entries (Admin)</h2>}>
      <Head title="Stock Entries (Admin)" />
      <div className="p-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            {/* Branch Selector */}
            <select
              value={selectedBranchName || ''}
              onChange={(e) => {
                setSelectedBranchName(e.target.value);
                setPage(1); // Reset to first page when branch changes
              }}
              className="border rounded-md py-2 px-3 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
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

            {/* Month Filter */}
            <div className="flex flex-col">
              <label className="text-gray-700">Filter by Month</label>
              <select
                value={selectedMonth ?? ''}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value) || null)}
                className="mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Filter by Month"
              >
                <option value="">All</option>
                {[...Array(12).keys()].map((month) => (
                  <option key={month} value={month + 1}>
                    {new Date(0, month).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Stocks Button */}
          <button 
            onClick={() => setIsAddStocksModalOpen(true)} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Add Stocks"
          >
            Add Stocks
          </button>
        </div>

        {/* Stock Entries Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-300 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Delivery Receipt No.</th>
                <th className="py-3 px-6 text-left">Delivered By</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mx-auto"></div>
                  </td>
                </tr>
              ) : stockEntries.length > 0 ? (
                stockEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-200">
                    <td className="py-3 px-6">{entry.delivery_number}</td>
                    <td className="py-3 px-6">{entry.delivered_by}</td>
                    <td className="py-3 px-6">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3 px-6 space-x-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => {
                          setSelectedItems(entry.items || []); // Ensure items is an array
                          setModalOpen(true);
                        }}
                        aria-label="View Items"
                      >
                        View Items
                      </button>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Previous Page"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
            disabled={page === totalPages}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Next Page"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <ViewItemsModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} items={selectedItems} />
      
      {/* Modal for Adding Stocks */}
      <AddStocks
        showModal={isAddStocksModalOpen}
        closeModal={() => setIsAddStocksModalOpen(false)}
        onSuccess={handleAddStocksSuccess}
      />
    </AdminLayout>
  );
};

export default StockEntriesTableAdmin;