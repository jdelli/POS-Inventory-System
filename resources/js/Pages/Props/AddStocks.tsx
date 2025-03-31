import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import apiService from '../Services/ApiService';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  product_code: string;
}

interface Item {
  product_code: string;
  name: string;
  price: number;
  quantity: number;
  id?: number;
}

interface AddStockModalProps {
  showModal: boolean;
  closeModal: () => void;
  onSuccess: () => void;
}

interface User {
  name: string;
}

const AddStocks: React.FC<AddStockModalProps> = ({ showModal, closeModal, onSuccess }) => {
  const { auth } = usePage().props as { auth: { user: User } };
  const [receiptItems, setReceiptItems] = useState<Item[]>([{product_code: "", name: '', price: 0, quantity: 0 }]);
  const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [selectedBranchName, setSelectedBranchName] = useState<string>('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [date, setDate] = useState('');
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiService.get('/get-branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  const closeAddStocksModal = () => {
    closeModal();
    setReceiptItems([{product_code: "", name: '', price: 0, quantity: 0 }]);
    setProductSuggestions([]);
    setSearchTerms(['']);
    setDeliveryNumber('');
    setDeliveredBy('');
    setDate('');
    setSelectedBranchName('');
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index ? { ...item, [field]: field === 'price' || field === 'quantity' ? Number(value) : value } : item
    );
    setReceiptItems(updatedItems);
  };

  const addReceiptItem = () => {
    setReceiptItems([...receiptItems, {product_code: "", name: '', price: 0, quantity: 0 }]);
    setProductSuggestions([...productSuggestions, []]);
    setSearchTerms([...searchTerms, '']);
  };

  const removeReceiptItem = (index: number) => {
    setReceiptItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const submitAddStocks = async () => {
    try {
      if (!deliveryNumber || !deliveredBy || !date || receiptItems.length === 0) {
        alert("Please fill in all required fields.");
        return;
      }
  
      setIsSubmitting(true);
  
      const itemsPayload = receiptItems.map(item => ({
        id: item.id, // Ensure product ID is sent
        product_code: item.product_code,
        product_name: item.name,
        quantity: item.quantity,
      }));
  
      // Call backend with combined request
      const response = await apiService.post('/add-delivery-receipt', {
        delivered_by: deliveredBy,
        delivery_number: deliveryNumber,
        date,
        branch_id: selectedBranchName,
        items: itemsPayload,
      });
  
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error adding delivery receipt.');
      }
  
      alert('Stocks added successfully!');
      closeAddStocksModal();
      onSuccess(); // Refresh data after success
  
    } catch (error: unknown) {
      console.error('Error submitting stocks:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  




  useEffect(() => {
    searchTerms.forEach((term, index) => {
      if (term.length > 0) {
        apiService
          .get('/search-products', {
            params: {
              q: term, // Search query
              user_name: selectedBranchName, // Pass the username to the backend
            },
          })
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
  }, [searchTerms, auth]);

  const handleSearchTermChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleItemChange(index, 'name', value);
  };

  const handleSuggestionClick = (index: number, product: InventoryItem) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index ? { ...item, id: product.id, name: product.name, price: product.price, product_code: product.product_code, } : item
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

            {/* Branch Selector */}
            <select
              value={selectedBranchName || ''}
              onChange={(e) => setSelectedBranchName(e.target.value)}
              className="border rounded-md py-2 px-3 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Select Branch"
            >
              <option value="" disabled>
                Select Branch
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>

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
                   <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Product Code</label>
                    <input
                      type="number"
                      value={item.product_code}
                      onChange={(e) => handleItemChange(index, 'product_code', e.target.value)}
                      className="border border-gray-300 p-2 w-full rounded"
                      placeholder="Product Code"
                      readOnly
                    />
                  </div>
                  <div className="flex-1 relative">
                    <label className="block text-sm font-medium mb-1">Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleSearchTermChange(index, e.target.value)}
                      className="border border-gray-300 p-2 w-full rounded"
                      placeholder="Search Item"
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
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="border border-gray-300 p-2 w-full rounded"
                      placeholder="Quantity"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeReceiptItem(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove Item"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                onClick={addReceiptItem}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Total Amount:</label>
              <p className="text-lg font-semibold">{calculateTotal().toFixed(2)}</p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={submitAddStocks}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
              <button
                onClick={closeAddStocksModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddStocks;