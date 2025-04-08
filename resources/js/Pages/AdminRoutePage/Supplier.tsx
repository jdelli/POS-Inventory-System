import React, { useState, useEffect } from 'react';
import apiService from '../Services/ApiService';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Button
} from '@mui/material';
import SupplierStocksModal from '../Props/SupplierDetails';
import AddSupplierModal from '../Props/AddSupplierStocks';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

interface Supplier {
  id: number;
  supplier_name: string;
  delivery_number: string;
  product_category: string;
  date: string;
  supplier_stocks?: SupplierStock[];
}

interface SupplierStock {
  id: number;
  supplier_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
}





const SupplierData: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStocks, setSelectedStocks] = useState<SupplierStock[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await apiService.get('/get-supplier');
        // Log the response data for debugging
        console.log('Fetched Suppliers:', response.data.data);
        setSuppliers(response.data.data);
       
      } catch (err) {
        setError('Failed to fetch suppliers');
       
      }
    };

    fetchSuppliers();
  }, []);

  const handleOpenStocksModal = (stocks: SupplierStock[] = []) => {
    setSelectedStocks(stocks);
    setModalOpen(true);
  };

  const handleCloseStocksModal = () => {
    setModalOpen(false);
    setSelectedStocks([]);
  };

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleSuccess = () => {
    setAddModalOpen(false);
  };



  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <AdminLayout header={<Typography variant="h6">Stock Entries</Typography>}>
      <Head title="Stock Entries (Admin)" />
      <div>
        <Button variant="outlined" onClick={handleOpenAddModal}>
          Add Supplier
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Supplier Name</TableCell>
                <TableCell>Delivery Number</TableCell>
                <TableCell>Product Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Supplier Stocks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.supplier_name}</TableCell>
                  <TableCell>{supplier.delivery_number}</TableCell>
                  <TableCell>{supplier.product_category}</TableCell>
                  <TableCell>{supplier.date}</TableCell>
                  <TableCell>
                    {supplier.supplier_stocks && supplier.supplier_stocks.length > 0 ? (
                      <Button variant="outlined" onClick={() => handleOpenStocksModal(supplier.supplier_stocks)}>
                        View Stocks
                      </Button>
                    ) : (
                      <Typography>No supplier stocks available</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <SupplierStocksModal open={modalOpen} onClose={handleCloseStocksModal} stocks={selectedStocks} />
          <AddSupplierModal showModal={addModalOpen} closeModal={handleCloseAddModal} onSuccess={handleSuccess} onSubmit={() => {}} />
        </TableContainer>
      </div>
    </AdminLayout>
  );
};

export default SupplierData;
