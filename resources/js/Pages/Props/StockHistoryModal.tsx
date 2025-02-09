import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiService from '../Services/ApiService';

interface StockHistoryProps {
  showModal: boolean;
  closeModal: () => void;
  history: any[];
  productName: string;
}

const StockHistoryModal: React.FC<StockHistoryProps> = ({ showModal, closeModal, history, productName }) => {
  const [startDate, setStartDate] = useState<Date | null>(null); // Allow null
  const [endDate, setEndDate] = useState<Date | null>(null); // Allow null

  if (!showModal) return null;

  // Date Filtering Logic
  const filteredHistory = history.filter((entry) => {
    const entryDate = new Date(entry.date);
    if (startDate && entryDate < startDate) return false;
    if (endDate && entryDate > endDate) return false;
    return true;
  });



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out z-50">
      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl max-h-screen overflow-y-auto transition-transform duration-300 ease-in-out transform scale-95 sm:scale-100">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1 transition-colors duration-300"
          onClick={closeModal}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{productName} - Stock History</h2>

        {/* Date Selection Inputs */}
        <div className="flex space-x-4 mb-6">
          <div>
            <label className="block text-gray-700">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)} // Handle null
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-gray-700">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)} // Handle null
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined} // Ensure minDate is Date or undefined
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <ul className="space-y-6">
            {filteredHistory.map((entry, index) => (
              <li
                key={index}
                className={`p-6 border rounded-lg ${entry.action === 'added' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className={`text-lg font-semibold ${entry.action === 'added' ? 'text-green-800' : 'text-red-800'}`}>
                      {entry.action === 'added' ? '+' : ''}{entry.quantity_changed}
                    </span>
                    <span className="text-sm text-gray-600">Remaining: {entry.remaining_stock}</span>
                  </div>
                  <span className="text-sm text-gray-500">Receipt: {entry.receipt_number}</span>
                </div>
                <div className="text-sm text-gray-600">Date: {entry.date}</div>
                <div className="text-sm text-gray-600">Name: {entry.name}</div>

                {/* `onClick` to Pass Correct `product_id` */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No history available.</p>
        )}
      </div>
    </div>
  );
};

export default StockHistoryModal;