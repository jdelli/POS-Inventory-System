import React from 'react';
import apiService from '../Services/ApiService';

interface SalesOrderItem {
  product_name: string;
  price: number;
  quantity: number;
}

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder?: {
    id: number;
    customer_name: string;
    receipt_number: string;
    date: string;
    items: SalesOrderItem[];
  };
}

const Receipt: React.FC<ReceiptProps> = ({ isOpen, onClose, selectedOrder }) => {
  if (!isOpen || !selectedOrder) return null;

  // Print handler function
  const handlePrint = () => {
    window.print(); // Triggers the print dialog
  };

  const grandTotal = selectedOrder.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-auto flex flex-col relative receipt-content print:w-full">
        <h2 className="text-lg font-bold mb-4 text-center">Order Receipt</h2>

        <div className="mb-4">
          <p>
            <strong>Client:</strong> {selectedOrder.customer_name}
          </p>
          <p>
            <strong>Receipt Number:</strong> {selectedOrder.receipt_number}
          </p>
          <p>
            <strong>Date:</strong> {selectedOrder.date}
          </p>
        </div>

        <table className="min-w-full border text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {selectedOrder.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2">₱{item.price.toLocaleString()}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">₱{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
            {/* Grand Total Row */}
            <tr>
              <td className="border p-2 font-bold" colSpan={3}>
                Total
              </td>
              <td className="border p-2 font-bold">₱{grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 border-t pt-2 text-center">
          <p className="text-sm">Thank you for your purchase!</p>
        </div>

        <div className="flex justify-end mt-4 no-print">
          <button onClick={onClose} className="bg-blue-500 text-white p-2 rounded mr-4">
            Close
          </button>
          <button onClick={handlePrint} className="bg-green-500 text-white p-2 rounded">
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;