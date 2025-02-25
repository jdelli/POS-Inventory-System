import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import ViewItemsModal from './Props/ViewDelivery';
import AddStocks from './Props/AddStocks';
import RequestStocks from './Props/RequestStocks';

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

// Define the Auth interface
interface Auth {
  user: {
    name: string;
  };
}

// Define the InventoryManagementProps interface
interface InventoryManagementProps {
  auth: Auth;
}


const StockEntriesTable: React.FC<InventoryManagementProps> = ({ auth }) => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // State for selected month
  const [isAddStocksModalOpen, setIsAddStocksModalOpen] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>([]);
  const [isRequestStockModalOpen, setIsRequestStockModalOpen] = useState<boolean>(false);


  // Fetch stock entries data with pagination and sorting by date
  const fetchDeliveryReceipts = async () => {
    setLoading(true);
    try {
     let url = `/fetch-delivery-receipts?sort_by=date&page=${page}&limit=${limit}&user_name=${auth.user.name}`;
if (selectedMonth !== null) {
  url += `&month=${selectedMonth}`;
}

      const response = await apiService.get(url);
      setStockEntries(response.data.deliveryReceipts);
      setTotalPages(response.data.last_page);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery receipts:', error);
      setLoading(false);
    }
  };

  

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

  // Callback to refetch stock entries after adding stocks
  const handleAddStocksSuccess = () => {
    fetchDeliveryReceipts();
  };

  // Initial data fetch and fetch on sorting or page/limit change
  useEffect(() => {
    fetchDeliveryReceipts();
  }, [ page, limit, selectedMonth]); // Add selectedMonth as a dependency

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stocks Entries</h2>}>
      <Head title="Stock Entries" />
      <div className="p-4">
      
        
      

       {/* Date Range Filters */}
      <div className="mb-4 flex space-x-4">
        <div>
          <label className="text-gray-700">Filtered by Month</label>
          <select
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value) || null)}
            className="mt-2 p-2 border rounded"
          >
            <option value="">All</option> {/* Empty value for 'All' */}
            {[...Array(12).keys()].map((month) => (
              <option key={month} value={month + 1}>
                {new Date(0, month).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>

        {/* Add Stocks Button
        <div className="mb-4 flex justify-end">
          <button 
            onClick={() => setIsAddStocksModalOpen(true)} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Stocks
          </button>
        </div> */}
        {/* Request Stock Button */}
<div className="mb-4 flex justify-end">
  <button 
    onClick={() => setIsRequestStockModalOpen(true)} 
    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
  >
    Request Stock
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
                  <td colSpan={4} className="text-center py-4">Loading...</td>
                </tr>
              ) : stockEntries.length > 0 ? (
                stockEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-200">
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
        onSuccess={handleAddStocksSuccess}
      />
      {/* Modal for Requesting Stock */}
    <RequestStocks
      isOpen={isRequestStockModalOpen}
      onClose={() => setIsRequestStockModalOpen(false)}
      auth={auth}
    />
    </AuthenticatedLayout>
  );
};

export default StockEntriesTable;
