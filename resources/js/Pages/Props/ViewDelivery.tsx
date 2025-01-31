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
}

const ViewItemsModal: React.FC<ViewItemsModalProps> = ({ isOpen, onClose, items }) => {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 id="modal-title" className="text-xl font-bold mb-4 text-gray-800">
          Items in Delivery Receipt
        </h2>

        <div className="max-h-60 overflow-y-auto">
          {items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between border-b py-2">
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-gray-600">Qty: +{item.quantity}</span>
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
