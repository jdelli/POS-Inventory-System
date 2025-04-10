import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import ViewItemsModal from './Props/ViewDelivery';
import AddStocks from './Props/AddStocks';
import RequestStocks from './Props/RequestStocks';
import { Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, TablePagination, 
  } from '@mui/material';

interface DeliveryItem {
  id: number;
  product_name: string;
  quantity: number;
  date: string;
}

interface StockEntry {
  id: number;
  delivery_number: string;
  delivered_by: string;
  date: string;
  items: DeliveryItem[];
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


const StockEntriesTable: React.FC<InventoryManagementProps> = ({ auth }) => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // State for selected month
  const [isAddStocksModalOpen, setIsAddStocksModalOpen] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>([]);
  const [isRequestStockModalOpen, setIsRequestStockModalOpen] = useState<boolean>(false);


  // Fetch stock entries data with pagination and sorting by date
  const fetchDeliveryReceipts = async () => {
    setLoading(true);
    try {
     let url = `/fetch-delivery-receipts?sort_by=date&page=${page}&limit=${limit}&user_name=${auth.user.name}`;
if (selectedMonth !== null) {
  url += `&month=${selectedMonth}`;
}

      const response = await apiService.get(url);
      setStockEntries(response.data.deliveryReceipts);
      setTotalPages(response.data.last_page);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery receipts:', error);
      setLoading(false);
    }
  };

  

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Function to open the modal with selected items
  const openModal = (items: DeliveryItem[]) => {
    setSelectedItems(items);
    setModalOpen(true);
  };

  // Callback to refetch stock entries after adding stocks
  const handleAddStocksSuccess = () => {
    fetchDeliveryReceipts();
  };

  // Initial data fetch and fetch on sorting or page/limit change
  useEffect(() => {
    fetchDeliveryReceipts();
  }, [ page, limit, selectedMonth]); // Add selectedMonth as a dependency

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stocks Entries</h2>}>
      <Head title="Stock Entries" />
      <div className="p-4">
      
        
      

       {/* Date Range Filters */}
       <div className="mb-4 flex justify-between items-center"> {/* Flexbox with space-between */}
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
          <Button
            variant="contained"
            color="success"
            onClick={() => setIsRequestStockModalOpen(true)}
          >
            Request Stock
          </Button>
        </div>

    {/* Stock Entries Table */}
    <TableContainer className="bg-white shadow-md rounded-lg">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Delivery Receipt No.</TableCell>
            <TableCell>Delivered By</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : stockEntries.length > 0 ? (
            stockEntries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>{entry.delivery_number}</TableCell>
                <TableCell>{entry.delivered_by}</TableCell>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => openModal(entry.items)}
                  >
                    View Items
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

    {/* Pagination Controls */}
    <div className="mt-4">
      <TablePagination
        component="div"
        count={totalPages * 10} // Adjust based on total number of records
        page={page - 1} // Material UI uses zero-based index
        onPageChange={(e, newPage) => handlePageChange(newPage + 1)} // Zero-based index for pagination
        rowsPerPage={10}
        rowsPerPageOptions={[10]}
        nextIconButtonProps={{
          disabled: page === totalPages,
        }}
        backIconButtonProps={{
          disabled: page === 1,
        }}
      />
    </div>
  </div>

      {/* Modal for Viewing Items */}
      <ViewItemsModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        items={selectedItems}
      />

      {/* Modal for Adding Stocks */}
      <AddStocks
        showModal={isAddStocksModalOpen}
        closeModal={() => setIsAddStocksModalOpen(false)}
        onSuccess={handleAddStocksSuccess}
      />
      {/* Modal for Requesting Stock */}
    <RequestStocks
      isOpen={isRequestStockModalOpen}
      onClose={() => setIsRequestStockModalOpen(false)}
      auth={auth}
    />
    </AuthenticatedLayout>
  );
};

export default StockEntriesTable;
