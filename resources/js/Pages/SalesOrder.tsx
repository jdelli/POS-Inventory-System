import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import Receipt from './Props/Receipt';

// Interfaces
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
  id: number;
}

interface SalesOrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
}

interface SalesOrder {
  id: number;
  customer_name: string;
  receipt_number: string;
  date: string;
  items: SalesOrderItem[];
}

// Define the Auth interface
interface Auth {
  user: {
    name: string;
  };
}

// Define the InventoryManagementProps interface
interface InventoryManagementProps {
  auth: Auth;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ auth }) => {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState<boolean>(false);
  const [receiptItems, setReceiptItems] = useState<Item[]>([{ name: '', price: 0, quantity: 0, id: 0 }]);
  const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [client, setClient] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Functions
  const openReceiptModal = () => setIsReceiptModalOpen(true);

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    resetReceiptForm();
  };

  const closeOrderDetailModal = () => {
    setIsOrderDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const resetReceiptForm = () => {
    setReceiptItems([{ name: '', price: 0, quantity: 0, id: 0 }]);
    setProductSuggestions([]);
    setSearchTerms(['']);
    setClient('');
    setReceiptNumber('');
    setDate('');
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]: field === 'price' || field === 'quantity' ? parseFloat(value as string) : value,
          }
        : item
    );
    setReceiptItems(updatedItems);
  };

  const addReceiptItem = () => {
    setReceiptItems([...receiptItems, { name: '', price: 0, quantity: 0, id: 0 }]);
    setProductSuggestions([...productSuggestions, []]);
    setSearchTerms([...searchTerms, '']);
  };

  const removeReceiptItem = (index: number): void => {
    setReceiptItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const viewOrderDetails = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  const calculateTotal = () => receiptItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleSearchTermChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleItemChange(index, 'name', value);
    
  };

  const handleSuggestionClick = (index: number, product: any) => {
  const updatedItems = [...receiptItems];
  updatedItems[index] = {
    ...updatedItems[index],
    id: product.id, 
    name: product.name,
    price: product.price,
  };
  
  // Clear suggestions for the selected index
    setReceiptItems(updatedItems);
    setSearchTerms((prev) => prev.map((term, i) => (i === index ? '' : term)));
    setProductSuggestions((prev) => prev.map((suggestions, i) => (i === index ? [] : suggestions)));
};


  const submitSalesOrder = async () => {
  try {
    if (
      !client || 
      !receiptNumber || 
      !date || 
      receiptItems.some(item => !item.name || item.quantity <= 0 || item.price <= 0)
    ) {
      alert('Please fill in all fields correctly.');
      return;
    }

    setIsSubmitting(true);

    const itemsPayload = receiptItems.map(item => ({
      id: item.id, // Include product ID
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    // Validate stock for each item
    for (const item of itemsPayload) {
      try {
        await apiService.post('/deduct-quantity', {
          id: item.id, // Send product ID
          quantity: item.quantity,
          name: client,
          receipt_number: receiptNumber,
          date: date,
        });
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error && (error as any).response?.status === 400) {
          const response = (error as any).response;
          alert(response.data.message);
        } else {
          alert('An error occurred while validating stock.');
        }
        setIsSubmitting(false);
        return; // Stop the process if there's an error
      }
    }

    // Submit the sales order
    try {
      const response = await apiService.post('/add-sales-order', {
        customer_name: client,
        receipt_number: receiptNumber,
        date,
        items: itemsPayload,
        branch_id: auth.user.name,
      });

      if (response.data.success) {
        alert('Sales order submitted successfully!');
        closeReceiptModal();
      } else {
        alert('Error submitting the sales order.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error submitting sales order:', error.message);
      }
      alert('Error submitting the sales order.');
      setIsSubmitting(false);
      return; // Stop the process if there's an error
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error submitting sales order:', error.message);
    }
    alert('Error submitting the sales order.');
  } finally {
    setIsSubmitting(false);
    fetchSalesReceipts();
  }
};



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


  const fetchSalesReceipts = async () => {
  setLoading(true);
  try {
    // Ensure auth.user.name is included in the URL
    let url = `/fetch-sales-orders?sort_by=date&page=${currentPage}&limit=10&user_name=${auth.user.name}`;
    if (selectedMonth !== null) {
      url += `&month=${selectedMonth}`;
    }

    if (selectedYear !== null) {
      url += `&year=${selectedYear}`;
    }

    const response = await apiService.get(url);
    setFilteredOrders(response.data.salesOrders);
    setTotalPages(response.data.last_page);
  } catch (error) {
    console.error('Error fetching sales receipts:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSalesReceipts();
  }, [currentPage, selectedMonth, selectedYear]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchSalesReceipts();
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Order</h2>}>
      <Head title="Inventory" />
      <div className="p-4">
        <button onClick={openReceiptModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded p-2 mb-4 ml-2">
          New Sales Order
        </button>

        {/* Date Range Filters */}
        <div className="mb-4 flex space-x-4">
          <div>
            <label className="text-gray-700">Filtered by Month</label>
            <select
              value={selectedMonth ?? ''}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value) || null)}
              className="mt-2 p-2 border rounded"
            >
              <option value="">All</option> {/* Empty value for 'All' */}
              {[...Array(12).keys()].map((month) => (
                <option key={month} value={month + 1}>
                  {new Date(0, month).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-700">Filtered by Year</label>
            <select
              value={selectedYear !== null ? selectedYear.toString() : ''} // Ensure the value is always a string or empty string if null
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)} // Set selected year or null
              className="mt-2 p-2 border rounded"
            >
              <option value="">All</option> {/* Empty value for 'All' */}
              {new Array(10).fill(null).map((_, index) => {
                const year = new Date().getFullYear() - index; // Generate the last 10 years
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Sales Order Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-300">Date</th>
                <th className="px-4 py-2 bg-gray-300">Receipt Number</th>
                <th className="px-4 py-2 bg-gray-300">Customer</th>
                <th className="px-4 py-2 bg-gray-300">Total</th>
                <th className="px-4 py-2 bg-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">Loading...</td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((entry) => (
                  <tr key={entry.id} className='hover:bg-slate-300'>
                    <td className="border p-2">{formatDate(entry.date)}</td>
                    <td className="border p-2">{entry.receipt_number}</td>
                    <td className="border p-2">{entry.customer_name}</td>
                    <td className="border p-2">{entry.items.length}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => viewOrderDetails(entry)}
                        className="bg-blue-500 text-white p-1 rounded"
                      >
                        View Items
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Receipt Modal */}
          {isReceiptModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
                <h2 className="text-lg font-bold mb-4">New Sales Order</h2>
                <form onSubmit={(e) => { e.preventDefault(); submitSalesOrder(); }}>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Client Name</label>
                      <input
                        type="text"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded"
                        placeholder="Enter client name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Receipt Number</label>
                      <input
                        type="text"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded"
                        placeholder="Enter receipt number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded"
                        required
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto mb-4">
                    {receiptItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-center mb-4">
                        <div className="relative">
                          <label className="block text-sm font-medium mb-1">Item</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleSearchTermChange(index, e.target.value)}
                            className="border border-gray-300 p-2 w-full rounded"
                            placeholder="Search item"
                            required
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
                        <div>
                          <label className="block text-sm font-medium mb-1">Price</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            className="border border-gray-300 p-2 w-full rounded"
                            placeholder="Enter price"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="border border-gray-300 p-2 w-full rounded"
                            placeholder="Enter quantity"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Total</label>
                          <input
                            type="text"
                            value={(item.price * item.quantity).toFixed(2)}
                            readOnly
                            className="border border-gray-300 p-2 w-full rounded bg-gray-100"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeReceiptItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addReceiptItem}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Item
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Total: ₱{calculateTotal()}</h2>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={closeReceiptModal}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex justify-between">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>

        {/* Order Detail Modal */}
        {isOrderDetailModalOpen && selectedOrder && (
          <Receipt isOpen={isOrderDetailModalOpen} onClose={closeOrderDetailModal} selectedOrder={selectedOrder} />
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default InventoryManagement;