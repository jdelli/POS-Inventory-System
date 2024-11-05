import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Item {
  name: string;
  price: number;
  quantity: number;
}

interface AddStockModalProps {
  showModal: boolean;
  closeModal: () => void;
  onSuccess: () => void;  
  
}

const AddStocks: React.FC<AddStockModalProps> = ({ showModal, closeModal, onSuccess }) => {
  const [receiptItems, setReceiptItems] = useState<Item[]>([{ name: '', price: 0, quantity: 0 }]);
  const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);

  // New state for additional fields
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [date, setDate] = useState('');

  const closeAddStocksModal = () => {
    closeModal();
    setReceiptItems([{ name: '', price: 0, quantity: 0 }]);
    setProductSuggestions([]);
    setSearchTerms(['']);
    setDeliveryNumber('');
    setDeliveredBy('');
    setDate('');
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index ? { ...item, [field]: field === 'price' || field === 'quantity' ? Number(value) : value } : item
    );
    setReceiptItems(updatedItems);
  };

  const addReceiptItem = () => {
    setReceiptItems([...receiptItems, { name: '', price: 0, quantity: 0 }]);
    setProductSuggestions([...productSuggestions, []]);
    setSearchTerms([...searchTerms, '']);
  };

  const submitAddStocks = async () => {
    const itemsPayload = receiptItems.map((item) => ({
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));
  
    const payload = {
      delivery_number: deliveryNumber,
      delivered_by: deliveredBy,
      date,
      items: itemsPayload,
    };
  
    try {
      const response = await apiService.post('/add-delivery-receipt', payload);
  
      // Check if the initial submission was successful
      if (response.data.success) {
        for (const item of itemsPayload) {
          await apiService.post('/add-quantity', {
            name: item.product_name,
            quantity: item.quantity,
          });
        }
        alert('Sales order submitted successfully!');
        
        closeAddStocksModal();
      } else {
        alert('Error submitting the sales order.');
      }
    } catch (error) {
      console.error('Error submitting stocks:', error);
      alert('An error occurred while submitting the stocks.');
    }
    onSuccess();
  };
  
  

  useEffect(() => {
    searchTerms.forEach((term, index) => {
      if (term.length > 0) {
        apiService
          .get(`/search-products?q=${term}`)
          .then((response) => {
            const updatedSuggestions = [...productSuggestions];
            updatedSuggestions[index] = response.data;
            setProductSuggestions(updatedSuggestions);
          })
          .catch((error) => {
            console.error('Error fetching product suggestions:', error);
          });
      } else {
        const updatedSuggestions = [...productSuggestions];
        updatedSuggestions[index] = [];
        setProductSuggestions(updatedSuggestions);
      }
    });
  }, [searchTerms]);

  const handleSearchTermChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleItemChange(index, 'name', value);
  };

  const handleSuggestionClick = (index: number, product: InventoryItem) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index
        ? {
            ...item,
            name: product.name,
            price: product.price,
          }
        : item
    );
    setReceiptItems(updatedItems);

    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = '';
    setSearchTerms(updatedSearchTerms);

    const updatedSuggestions = [...productSuggestions];
    updatedSuggestions[index] = [];
    setProductSuggestions(updatedSuggestions);
  };

  const calculateTotal = () => {
    return receiptItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <>
      <Head title="Inventory" />
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-full flex flex-col">
            <h2 className="text-lg font-bold mb-4">Add Stocks</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Delivery Number:</label>
              <input
                type="text"
                value={deliveryNumber}
                onChange={(e) => setDeliveryNumber(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded"
                placeholder="Delivery Number"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Delivered By:</label>
              <input
                type="text"
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded"
                placeholder="Delivered By"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded"
                required
              />
            </div>

            <div className="max-h-60 overflow-y-auto flex-grow mt-5 mb-1">
              {receiptItems.map((item, index) => (
                <div key={index} className="flex space-x-4 mb-4">
                  <div className="flex-1 relative">
                    <label className="block text-sm font-medium mb-1">Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleSearchTermChange(index, e.target.value)}
                      className="border border-gray-300 p-2 w-full rounded"
                      placeholder="Item name"
                    />
                    {productSuggestions[index]?.length > 0 && (
                      <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-40 overflow-y-auto">
                        {productSuggestions[index].map((product) => (
                          <li
                            key={product.id}
                            onClick={() => handleSuggestionClick(index, product)}
                            className="cursor-pointer p-2 hover:bg-gray-100"
                          >
                            {product.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value.replace(/[^0-9]/g, ''))}
                      className="border border-gray-300 p-2 w-full rounded"
                      placeholder="Quantity"
                    />
                  </div>
                </div>
              ))}
              <button onClick={addReceiptItem} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Add Item
              </button>
            </div>

            <div className="flex justify-between items-center mt-1">
              <h2 className="text-lg font-bold">Total: ₱{calculateTotal()}</h2>
              <div className="flex space-x-2">
                <button onClick={closeAddStocksModal} className="bg-gray-500 text-white p-2 rounded">
                  Cancel
                </button>
                <button onClick={submitAddStocks} className="bg-green-500 text-white p-2 rounded">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddStocks;
