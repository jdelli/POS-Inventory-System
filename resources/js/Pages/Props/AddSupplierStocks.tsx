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
  user_name?: string;
  total?: number; // Add total field
}

interface AddSupplierModalProps {
  showModal: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  onSubmit: (items: Item[]) => void;
}

interface Supplier {
  name: string;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ showModal, closeModal, onSuccess, onSubmit }) => {
  const { auth } = usePage().props as { auth: { user: Supplier } };
  const [supplierItems, setSupplierItems] = useState<Item[]>([{ product_code: '', name: '', price: 0, quantity: 0 }]);
  const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleItemChange = (index: number, field: string, value: string | number) => {
  const updatedItems = supplierItems.map((item, i) =>
    i === index
      ? {
          ...item,
          [field]: field === 'price' || field === 'quantity' ? Number(value) : value,
          total: field === 'price' || field === 'quantity' ? Number(value) * (field === 'price' ? item.quantity : item.price) : item.total,
        }
      : item
  );
  setSupplierItems(updatedItems);
};

  const addItem = () => {
    setSupplierItems([...supplierItems, { product_code: '', name: '', price: 0, quantity: 0 }]);
    setProductSuggestions([...productSuggestions, []]);
    setSearchTerms([...searchTerms, '']);
  };

  const removeItem = (index: number) => {
    setSupplierItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const submitAddSupplier = async () => {
    try {
      if (!deliveryNumber || !productCategory || !date || supplierItems.length === 0) {
        alert("Please fill in all required fields.");
        return;
      }
      setIsSubmitting(true);
      const itemsPayload = supplierItems.map((item) => ({
        id: item.id,
        product_code: item.product_code,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total || 0, // Include total in the payload
      }));
      const response = await apiService.post('/add-supplier', {
        supplier_name: selectedSupplierName,
        delivery_number: deliveryNumber,
        date,
        product_category: productCategory,
        items: itemsPayload,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error adding supplier.');
      }
      alert('Supplier added successfully!');
      closeModal();
      onSuccess(); // Refresh data after success
    } catch (error: unknown) {
      console.error('Error submitting supplier:', error);
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
              user_name: 'warehouse', // Pass the username to the backend
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

  const handleSuggestionClick = (index: number, product: InventoryItem) => {
    const updatedItems = supplierItems.map((item, i) =>
      i === index
        ? {
            ...item,
            id: product.id,
            name: product.name,
           
            product_code: product.product_code,
          }
        : item
    );
    setSupplierItems(updatedItems);

    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = '';
    setSearchTerms(updatedSearchTerms);

    const updatedSuggestions = [...productSuggestions];
    updatedSuggestions[index] = [];
    setProductSuggestions(updatedSuggestions);
  };


  const calculateGrandTotal = (): number => {
    return supplierItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-2xl h-[80vh] overflow-y-auto flex flex-col">
          <h2 className="text-lg font-bold mb-4">Add Supplier</h2>
      
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Supplier Name</label>
            <input
              type="text"
              value={selectedSupplierName}
              onChange={(e) => setSelectedSupplierName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
              placeholder="Supplier Name"
              required
            />
          </div>
      
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Delivery Number</label>
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
            <label className="block text-sm font-medium mb-1">Product Category</label>
            <input
              type="text"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
              placeholder="Supplier Contact"
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
      
          <div className="max-h-[50vh] overflow-y-auto flex-grow mt-5 mb-1">
            {supplierItems.map((item, index) => (
              <div className="flex space-x-4 mb-4">
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
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  className="border border-gray-300 p-2 w-full rounded"
                  placeholder="Price"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Total</label>
                <input
                  type="text"
                  value={item.total?.toFixed(2) || '0.00'}
                  readOnly
                  className="border border-gray-300 p-2 w-full rounded bg-gray-100"
                  placeholder="Total"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove Item"
              >
                &times;
              </button>
            </div>
            ))}
            <button
              onClick={addItem}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
      
          <div className="flex justify-end space-x-4">
            <button
              onClick={submitAddSupplier}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            >
              Submit
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
          <div className="mt-4">
  <h3 className="font-bold text-lg">Grand Total: {calculateGrandTotal().toFixed(2)}</h3>
</div>
        </div>
        
      </div>
      
      )}
    </>
  );
};

export default AddSupplierModal;