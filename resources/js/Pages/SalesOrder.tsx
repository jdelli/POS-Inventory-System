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

const InventoryManagement: React.FC = () => {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState<boolean>(false);
  const [receiptItems, setReceiptItems] = useState<Item[]>([{ name: '', price: 0, quantity: 0 }]);
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
    setReceiptItems([{ name: '', price: 0, quantity: 0 }]);
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
    setReceiptItems([...receiptItems, { name: '', price: 0, quantity: 0 }]);
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

  const handleSuggestionClick = (index: number, product: InventoryItem) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index ? { ...item, name: product.name, price: product.price } : item
    );
    setReceiptItems(updatedItems);
    setSearchTerms((prev) => prev.map((term, i) => (i === index ? '' : term)));
    setProductSuggestions((prev) => prev.map((suggestions, i) => (i === index ? [] : suggestions)));
  };

  const submitSalesOrder = async () => {
    try {
      if (!client || !receiptNumber || !date || receiptItems.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
        alert('Please fill in all fields correctly.');
        return;
      }

      setIsSubmitting(true);

      const itemsPayload = receiptItems.map(item => ({
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }));

      const response = await apiService.post('/add-sales-order', {
        customer_name: client,
        receipt_number: receiptNumber,
        date,
        items: itemsPayload,
      });

      if (response.data.success) {
        for (const item of itemsPayload) {
          await apiService.post('/deduct-quantity', {
            name: item.product_name,
            quantity: item.quantity,
          });
        }
        alert('Sales order submitted successfully!');
        closeReceiptModal();
      } else {
        alert('Error submitting the sales order.');
      }
    } catch (error) {
      console.error('Error submitting sales order:', error);
      alert('Error submitting the sales order.');
    } finally {
      setIsSubmitting(false);
      fetchSalesReceipts();
    }
  };

  useEffect(() => {
    if (searchTerms.length === 0 || !searchTerms.some(term => term.trim().length > 0)) return;

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

  const fetchSalesReceipts = async () => {
    setLoading(true);
    try {
      let url = `/fetch-sales-orders?sort_by=date&page=${currentPage}&limit=10`;
      if (selectedMonth !== null) {
        url += `&month=${selectedMonth}`;
      }
      const response = await apiService.get(url);
      setFilteredOrders(response.data.salesOrders);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching delivery receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReceipts();
  }, [currentPage, selectedMonth]);



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
        <button onClick={openReceiptModal} className= "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded p-2 mb-4 ml-2">
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



{/* Recipt Modal */}
          {isReceiptModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-full flex flex-col relative">
              <h2 className="text-lg font-bold mb-4">Sales Order</h2>
              <form className="flex-1 flex flex-col" onSubmit={(e) => { e.preventDefault(); submitSalesOrder(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Client</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                    placeholder="Client Name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                    placeholder="Receipt Number"
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

                {/* add receipt items */}
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
                          required
                        />
                        {/* Dropdown for product suggestions */}
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
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value.replace(/[^0-9.]/g, ''))}
                          className="border border-gray-300 p-2 w-full rounded"
                          placeholder="Price"
                          required
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value.replace(/[^0-9]/g, ''))}
                          className="border border-gray-300 p-2 w-full rounded"
                          placeholder="Quantity"
                          required
                        />
                      </div>

                      <div className="flex-1">
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
                        onClick={() => removeReceiptItem(index)} // Function to remove the item
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove Item"
                      >
                        &times; {/* Close button for removing the item */}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addReceiptItem}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Item
                  </button>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <h2 className="text-lg font-bold">Total: ₱{calculateTotal()}</h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={closeReceiptModal}
                      className="bg-gray-500 text-white p-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 rounded"
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