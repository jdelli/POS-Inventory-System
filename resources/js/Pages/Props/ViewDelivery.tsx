import React, { useEffect } from 'react';

interface DeliveryItem {
  id: number;
  product_name: string;
  quantity: number;
}

interface ViewItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DeliveryItem[];
  onDelete: (id: number) => void; // Add onDelete prop
  onDeleteAll: () => void; // Add onDeleteAll prop
}

const ViewItemsModal: React.FC<ViewItemsModalProps> = ({ isOpen, onClose, items = [], onDelete, onDeleteAll }) => {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      // Cleanup event listener on component unmount or when isOpen changes
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            Items in Delivery Receipt
          </h2>
          <div className="flex space-x-2">
            <button
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={onDeleteAll}
            >
              Delete All
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto border-t border-b py-4">
          {Array.isArray(items) && items.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{item.product_name}</span>
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                  </div>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ml-2"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No items available for this delivery receipt.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewItemsModal;