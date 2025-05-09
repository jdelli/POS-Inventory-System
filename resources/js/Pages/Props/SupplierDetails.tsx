import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';

interface SupplierStock {
  id: number;
  supplier_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface SupplierStocksModalProps {
  open: boolean;
  onClose: () => void;
  stocks: SupplierStock[]; // expect stocks to be an array, which could be empty
}

const SupplierStocksModal: React.FC<SupplierStocksModalProps> = ({ open, onClose, stocks }) => {
  // Ensure stocks is always an array
  const stockList = stocks || [];

  // Helper function to format currency as ₱100,000 without decimals
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 0, // No decimal places
          maximumFractionDigits: 0, // No decimal places
      }).format(amount);
    };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Supplier Stocks</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product Code</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography>No stocks available</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stockList.map((stock) => (
                  <TableRow key={stock.id}>
                  <TableCell>{stock.product_code}</TableCell>
                  <TableCell>{stock.product_name}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>
                      {/* Format Price */}
                      {formatCurrency(stock.price || 0)}
                  </TableCell>
                  <TableCell>
                      {/* Format Total */}
                      {formatCurrency(stock.total || 0)}
                  </TableCell>
              </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupplierStocksModal;
