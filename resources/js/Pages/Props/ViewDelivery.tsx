import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 id="modal-title" className="text-xl font-bold mb-4">Items in Delivery Receipt</h2>
        <div id="modal-description">
          {items.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <span className="font-medium">{item.product_name}</span> (Qty: {item.quantity})
                </li>
              ))}
            </ul>
          ) : (
            <p>No items available for this delivery receipt.</p>
          )}
        </div>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewItemsModal;
