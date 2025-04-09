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
  Button,
  TableFooter,
  TablePagination,
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchSuppliers = async (page: number = 1) => {
   
    try {
      const response = await apiService.get('/get-supplier', {
        params: { page },
      });
      console.log('Fetched Suppliers:', response.data.data);
      setSuppliers(response.data.data);
      setCurrentPage(response.data.meta.current_page);
      setTotalPages(response.data.meta.last_page);
      setTotalItems(response.data.meta.total);
    } catch (err) {
      setError('Failed to fetch suppliers');
    } finally {
    }
  };

  useEffect(() => {
    fetchSuppliers(currentPage);
  }, [currentPage]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setCurrentPage(newPage + 1); // Material-UI pages are 0-indexed; backend pages are 1-indexed.
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page
    fetchSuppliers(1);
  };

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
    fetchSuppliers(currentPage); // Refresh data after adding a supplier
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
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  count={totalItems}
                  rowsPerPage={rowsPerPage}
                  page={currentPage - 1} // Material-UI uses 0-based indexing
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TableRow>
            </TableFooter>
          </Table>
          <SupplierStocksModal open={modalOpen} onClose={handleCloseStocksModal} stocks={selectedStocks} />
          <AddSupplierModal showModal={addModalOpen} closeModal={handleCloseAddModal} onSuccess={handleSuccess} onSubmit={() => {}} />
        </TableContainer>
      </div>
    </AdminLayout>
  );
};

export default SupplierData;