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
  }, [page, selectedBranchName, limit]);

  const deleteStockEntry = async (id: number) => {
    try {
      await apiService.delete(`/delete-stock-entry/${id}`);
      fetchDeliveryReceipts();
    } catch (error) {
      console.error('Error deleting stock entry:', error);
    }
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Entries (Admin)</h2>}>
      <Head title="Stock Entries (Admin)" />
      <div className="p-4">
        {/* Branch Selector */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <select
            value={selectedBranchName || ''}
            onChange={(e) => {
              setSelectedBranchName(e.target.value);
              setPage(1); // Reset to first page when branch changes
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
        </div>

        {/* Month Filter */}
        <div className="mb-4">
          <label className="text-gray-700">Filter by Month</label>
          <select
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value) || null)}
            className="mt-2 p-2 border rounded"
          >
            <option value="">All</option>
            {[...Array(12).keys()].map((month) => (
              <option key={month} value={month + 1}>
                {new Date(0, month).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
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
                  <td colSpan={4} className="text-center py-4">Loading...</td>
                </tr>
              ) : stockEntries.length > 0 ? (
                stockEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-200">
                    <td className="py-3 px-6">{entry.delivery_number}</td>
                    <td className="py-3 px-6">{entry.delivered_by}</td>
                    <td className="py-3 px-6">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3 px-6 space-x-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => {
                          setSelectedItems(entry.items || []); // Ensure items is an array
                          setModalOpen(true);
                        }}
                      >
                        View Items
                      </button>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => alert('Edit functionality here')}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => deleteStockEntry(entry.id)}
                      >
                        Delete
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
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
            disabled={page === totalPages}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <ViewItemsModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} items={selectedItems} />
      <AddStocks showModal={isAddStocksModalOpen} closeModal={() => setIsAddStocksModalOpen(false)} onSuccess={fetchDeliveryReceipts} />
    </AdminLayout>
  );
};

export default StockEntriesTableAdmin;