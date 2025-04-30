import React, { useEffect, useState } from 'react';
import apiService from '../Services/ApiService';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@mui/material';

interface RequestStock {
  id: number;
  branch_id: number;
  date: string;
  items: RequestStockItem[];
}

interface RequestStockItem {
  id: number;
  request_stocks_id: number;
  product_name: string;
  quantity: number;
}

const StockRequest: React.FC = () => {
  const [requestStocks, setRequestStocks] = useState<RequestStock[]>([]);
  const [selectedItems, setSelectedItems] = useState<RequestStockItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequestStocks();
  }, []);

  const fetchRequestStocks = async () => {
    try {
      const response = await apiService.get<RequestStock[]>('/fetch-stock-requests');
      setRequestStocks(response.data);
    } catch (error) {
      console.error('Error fetching request stocks:', error);
    }
  };

  const handleViewItems = (id: number, items: RequestStockItem[]) => {
    setSelectedItems(items);
    setSelectedRequestId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItems([]);
    setSelectedRequestId(null);
  };

  const handleDone = async () => {
    if (selectedRequestId !== null) {
      try {
        await apiService.delete(`/delete-stock-request/${selectedRequestId}`);
        fetchRequestStocks();
        handleCloseModal();
      } catch (error) {
        console.error('Error deleting stock request:', error);
      }
    }
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Request</h2>}>
      <Container maxWidth="xl" sx={{ mx: 'auto' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Branch</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requestStocks.map((requestStock) => (
                <TableRow key={requestStock.id}>
                  <TableCell>{requestStock.branch_id}</TableCell>
                  <TableCell>{requestStock.date}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewItems(requestStock.id, requestStock.items)}
                    >
                      View Items
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
          <DialogTitle>Stock Request Items</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDone} color="secondary" variant="contained">
              Done
            </Button>
            <Button onClick={handleCloseModal} color="primary" variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default StockRequest;