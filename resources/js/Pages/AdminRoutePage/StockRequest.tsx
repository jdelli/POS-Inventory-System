import React, { useEffect, useState } from 'react';
import apiService from '../Services/ApiService';
import AdminLayout from '@/Layouts/AdminLayout';

interface RequestStock {
  id: number;
  branch_id: number;
  date: string;
  items: RequestStockItem[];
}

interface RequestStockItem {
  id: number;
  request_stocks_id: number;
  product_name: string;
  quantity: number;
}

const StockRequest: React.FC = () => {
  const [requestStocks, setRequestStocks] = useState<RequestStock[]>([]);
  const [selectedItems, setSelectedItems] = useState<RequestStockItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequestStocks();
  }, []);

  const fetchRequestStocks = async () => {
    try {
      const response = await apiService.get<RequestStock[]>('/fetch-stock-requests'); // Ensure the response type is correct
      setRequestStocks(response.data);
    } catch (error) {
      console.error('Error fetching request stocks:', error);
    }
  };

  const handleViewItems = (items: RequestStockItem[]) => {
    setSelectedItems(items);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItems([]);
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Request Stocks</h2>}>
      <div className="container mx-auto p-4">
        <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-300 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-2 px-4 border-b">Branch</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requestStocks.map((requestStock) => (
              <tr key={requestStock.id} className="border-b hover:bg-gray-200">
                <td className="py-2 px-4 border-b">{requestStock.branch_id}</td>
                <td className="py-2 px-4 border-b">{requestStock.date}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                    onClick={() => handleViewItems(requestStock.items)}
                  >
                    View Items
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-4 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Stock Request Items</h2>
                <button className="text-gray-500" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Product Name</th>
                    <th className="py-2 px-4 border-b">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-4 border-b">{item.product_name}</td>
                      <td className="py-2 px-4 border-b">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button className="bg-gray-500 text-white py-1 px-3 rounded" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StockRequest;
