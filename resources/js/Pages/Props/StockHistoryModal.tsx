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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={closeModal}>✖</button>
        <h2 className="text-xl font-semibold mb-4">{productName} - Stock History</h2>
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((entry, index) => (
              <li key={index} className={`p-2 ${entry.action === 'added' ? 'text-green-500' : 'text-red-500'}`}>
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