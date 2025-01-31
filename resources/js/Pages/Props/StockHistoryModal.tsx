import React from 'react';

interface StockHistoryProps {
  showModal: boolean;
  closeModal: () => void;
  history: any[];
  productName: string;
}

const StockHistoryModal: React.FC<StockHistoryProps> = ({ showModal, closeModal, history, productName }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300 ease-in-out">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 max-h-96 overflow-y-auto transition-transform duration-300 ease-in-out transform scale-95 sm:scale-100">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1 transition-colors duration-300"
          onClick={closeModal}
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{productName} - Stock History</h2>
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((entry, index) => (
              <li
                key={index}
                className={`p-2 border rounded ${entry.action === 'added' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {entry.action === 'added' ? '+' : '-'}{entry.quantity_changed} (Remaining: {entry.remaining_stock})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No history available.</p>
        )}
      </div>
    </div>
  );
};

export default StockHistoryModal;