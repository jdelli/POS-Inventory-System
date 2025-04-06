import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import ViewItemsModal from '../Props/ViewDelivery';
import AddStocks from '../Props/AddStocks';
import {
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { Tooltip, IconButton } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { Fab } from '@mui/material';


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

interface Auth {
  user: {
    name: string;
    role: string;
  };
}

interface InventoryManagementProps {
  auth: Auth;
}

const StockEntriesTableAdmin: React.FC<InventoryManagementProps> = ({ auth }) => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(''); // Ensure this is a string or null
  const [isAddStocksModalOpen, setIsAddStocksModalOpen] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  const fetchDeliveryReceipts = async () => {
    if (!selectedBranchName) return;

    setLoading(true);
    try {
      const response = await apiService.get('/admin-fetch-delivery-receipts-by-branch', {
        params: {
          branch_name: selectedBranchName,
          page,
          limit,
          month: selectedMonth ? parseInt(selectedMonth) : undefined, // Ensure proper parsing
        },
      });
      setStockEntries(response.data.data);
      setTotalPages(response.data.last_page);
      setCurrentPage(response.data.current_page);
    } catch (error) {
      console.error('Error fetching stock entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryReceipts();
  }, [page, selectedBranchName, limit, selectedMonth]);

  const handleAddStocksSuccess = () => {
    fetchDeliveryReceipts();
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiService.delete(`/delete-delivery-receipt-item/${id}`);
      fetchDeliveryReceipts();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteAllItems = async () => {
    if (!confirm('Are you sure you want to delete all items?')) return;
    try {
      const deletePromises = selectedItems.map(item => apiService.delete(`/delete-delivery-receipt-item/${item.id}`));
      await Promise.all(deletePromises);
      fetchDeliveryReceipts();
      setModalOpen(false);
    } catch (error) {
      console.error('Error deleting all items:', error);
    }
  };

  const handleDeleteReceipt = async (id: number) => {
    if (!confirm('Are you sure you want to delete this delivery receipt?')) return;
    try {
      await apiService.delete(`/delete-delivery-receipt/${id}`);
      fetchDeliveryReceipts();
    } catch (error) {
      console.error('Error deleting delivery receipt:', error);
    }
  };

  return (
    <AdminLayout header={<Typography variant="h6">Stock Entries</Typography>}>
      <Head title="Stock Entries (Admin)" />
      <Container maxWidth="xl" sx={{ mx: 'auto' }}>
        {/* Controls */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Select
            value={selectedBranchName || ''}
            onChange={(e) => {
              setSelectedBranchName(e.target.value as string);
              setCurrentPage(1);
            }}
            displayEmpty
            fullWidth
            variant="outlined"
            style={{ marginRight: '8px' }}
            aria-label="Select Branch"
          >
            <MenuItem value="" disabled>
              Select Branch
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.name}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(e.target.value || '')} // Ensure the value is a string
            displayEmpty
            fullWidth
            variant="outlined"
            style={{ marginRight: '8px' }}
            aria-label="Filter by Month"
          >
            <MenuItem value="">All</MenuItem>
            {[...Array(12).keys()].map((month) => (
              <MenuItem key={month} value={(month + 1).toString()}> {/* Ensure the value is a string */}
                {new Date(0, month).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>

          <Button
            onClick={() => setIsAddStocksModalOpen(true)}
            variant="contained"
            color="primary"
          >
            Add Stocks
          </Button>
        </Box>

        {/* Stock Entries Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
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
                {stockEntries.length > 0 ? (
                  stockEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.delivery_number}</TableCell>
                      <TableCell>{entry.delivered_by}</TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Tooltip title="View Items">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedItems(entry.items || []);
                              setModalOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Receipt">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => handleDeleteReceipt(entry.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            variant="outlined"
          >
            Previous
          </Button>
          <Typography variant="body2" style={{ margin: '0 16px' }}>
            Page {page} of {totalPages}
          </Typography>
          <Button
            onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
            disabled={page === totalPages}
            variant="outlined"
          >
            Next
          </Button>
        </Box>

        {/* Modals */}
        <ViewItemsModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          items={selectedItems}
          onDelete={handleDeleteItem}
          onDeleteAll={handleDeleteAllItems}
        />

        {/* Modal for Adding Stocks */}
        <AddStocks
          showModal={isAddStocksModalOpen}
          closeModal={() => setIsAddStocksModalOpen(false)}
          onSuccess={handleAddStocksSuccess}
        />
      </Container>
    </AdminLayout>
  );
};

export default StockEntriesTableAdmin;
