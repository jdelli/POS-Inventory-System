import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';

interface Item {
  name: string;
  quantity: number;
  id?: number;
  price?: number;
  product_code: string;
}

interface Auth {
  user: {
    name: string;
  };
}

interface RequestStocksProps {
    isOpen: boolean;
    onClose: () => void;
    auth: Auth;
}

const StockRequestModal: React.FC<RequestStocksProps> = ({ isOpen, onClose, auth }) => {
  if (!isOpen) return null; // Hide modal when `isOpen` is false

  const [requestItems, setRequestItems] = useState<Item[]>([{product_code: '', name: '', quantity: 0 }]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [productSuggestions, setProductSuggestions] = useState<Item[][]>([[]]);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set today's date when the component mounts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    searchTerms.forEach((term, index) => {
      if (term.length > 0) {
        apiService
          .get('/search-products', {
            params: {
              q: term, // Search query
              user_name: auth.user.name, // Pass the username to the backend
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
  }, [searchTerms]);

  const handleSearchTermChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleItemChange(index, 'name', value);
  };

  const handleSuggestionClick = (index: number, product: Item) => {
    const updatedItems = requestItems.map((item, i) =>
      i === index ? { ...item, id: product.id, product_code: product.product_code, name: product.name, price: product.price } : item
    );
    setRequestItems(updatedItems);

    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = '';
    setSearchTerms(updatedSearchTerms);

    const updatedSuggestions = [...productSuggestions];
    updatedSuggestions[index] = [];
    setProductSuggestions(updatedSuggestions);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    setRequestItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: field === 'quantity' ? Number(value) : value } : item))
    );
  };

  const addRequestItem = () => {
    setRequestItems([...requestItems, {product_code: '', name: '', quantity: 0 }]);
    setSearchTerms([...searchTerms, '']);
    setProductSuggestions([...productSuggestions, []]);
  };

  const removeRequestItem = (index: number) => {
    setRequestItems((prev) => prev.filter((_, i) => i !== index));
    setSearchTerms((prev) => prev.filter((_, i) => i !== index));
    setProductSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const submitStockRequest = async () => {
    // Prevent double-clicking by setting isSubmitting to true
    setIsSubmitting(true);
    
    const payload = { branch_id: auth.user.name, date, items: requestItems };
    try {
      const response = await apiService.post('/add-stock-request', payload);
      if (response.data.success) {
        alert('Stock request submitted successfully!');
        onClose(); // Close modal
        resetForm();
      } else {
        setError('Failed to submit stock request.');
      }
    } catch (error) {
      console.error('Error submitting stock request:', error);
      setError('An error occurred while submitting the stock request.');
    } finally {
      // Reset isSubmitting to false after the request is complete
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestItems([{ product_code: '', name: '', quantity: 0 }]);
    setDate('');
    setSearchTerms(['']);
    setProductSuggestions([[]]);
    setError(null);
  };

  return (
    <>
      <Head title="Stock Request" />
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-auto flex flex-col">
            <h2 className="text-lg font-bold mb-4">Request Stock</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto flex-grow mt-5 mb-1">
              {requestItems.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 mb-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Product Code</label>
                    <input
                      type="text"
                      value={item.product_code}
                      onChange={(e) => handleItemChange(index, 'product_code', e.target.value)}
                      className="border rounded w-full p-2"
                      readOnly
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleSearchTermChange(index, e.target.value)}
                      className="border border-gray-300 p-2 w-full rounded"
                      placeholder="Search Item"
                    />
                    {productSuggestions[index] && productSuggestions[index].length > 0 && (
                      <ul className="border mt-2 max-h-32 overflow-y-auto bg-white rounded">
                        {productSuggestions[index].map((product) => (
                          <li
                            key={product.id}
                            className="cursor-pointer p-2 hover:bg-gray-200"
                            onClick={() => handleSuggestionClick(index, product)}
                          >
                            {product.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="col-span-1">
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
                    onClick={() => removeRequestItem(index)}
                    className="text-red-500 hover:text-red-700 mt-6 col-span-1"
                    aria-label="Remove Item"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                onClick={addRequestItem}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>

            <div className="flex justify-end space-x-4">
            <button
              onClick={submitStockRequest}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
              disabled={isSubmitting} // Disable the button if submitting
            >
              Submit
            </button>
              <button
                onClick={() => { onClose(); resetForm(); }}
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

export default StockRequestModal;