import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import apiService from './Services/ApiService';
import ViewItemsModal from './Props/ViewDelivery';
import AddStocks from './Props/AddStocks';

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
  items: DeliveryItem[]; // Include items in the StockEntry interface
}

const StockEntriesTable: React.FC = () => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10); // Default items per page
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isAddStocksModalOpen, setIsAddStocksModalOpen] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>([]);

  // Fetch stock entries data with pagination
  const fetchStockEntries = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/fetch-delivery-receipts?page=${page}&per_page=${limit}`);
      setStockEntries(response.data.deliveryReceipts);
      setTotalPages(Math.ceil(response.data.total / limit)); // Calculate total pages
    } catch (error) {
      console.error('Error fetching stock entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockEntries();
  }, [page, limit]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Function to open the modal with selected items
  const openModal = (items: DeliveryItem[]) => {
    setSelectedItems(items);
    setModalOpen(true);
  };

  // Function to refetch stock entries
  const handleAddStocksSuccess = () => {
    fetchStockEntries(); // Refetch stock entries
  };

  return (
    <AuthenticatedLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Stock Entries</h1>

        {/* Add Stocks Button */}
        <div className="mb-4 flex justify-end">
          <button 
            onClick={() => setIsAddStocksModalOpen(true)} 
            className="btn btn-green"
          >
            Add Stocks
          </button>
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
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
                  <tr key={entry.id} className="border-b border-gray-200">
                    <td className="py-3 px-6">{entry.delivery_number}</td>
                    <td className="py-3 px-6">{entry.delivered_by}</td>
                    <td className="py-3 px-6">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3 px-6">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => openModal(entry.items)}
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

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for Viewing Items */}
      <ViewItemsModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        items={selectedItems}
      />

      {/* Modal for Adding Stocks */}
      <AddStocks
        showModal={isAddStocksModalOpen}
        closeModal={() => setIsAddStocksModalOpen(false)}
        onSuccess={handleAddStocksSuccess} // Pass the callback
      />
    </AuthenticatedLayout>
  );
};

export default StockEntriesTable;
