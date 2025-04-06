import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import AdminLayout from '@/Layouts/AdminLayout';
import EditProductModal from '../Props/Edit';
import AddProductModal from '../Props/Add';
import StockHistoryModal from '../Props/StockHistoryModal';

import {
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Pagination,
  Alert,
  Select,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
} from '@mui/material';
import { Edit, Delete, History } from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Product {
  product_code: string;
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const categoryOptions = [
  'Analog/IP Cameras',
  'WIFI Cameras',
  'DVR/NVR',
  'HDD',
  'Home Alarms',
  'Accessories',
  'Radios',
  'Biometrics',
];

const ProductTable: React.FC = () => {
  const { auth } = usePage().props as { auth: { user: User } };
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const [stockHistory, setStockHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchStockHistory = async (productId: number) => {
    try {
      const response = await apiService.get(`/stock-history/${productId}`);
      setStockHistory(response.data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }
  };

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

  const fetchProductsByBranch = async (branchName: string, page = 1, limit = 20) => {
    if (!branchName) {
      setProducts([]);
      setCurrentPage(1);
      setLastPage(1);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.get('/admin-fetch-products-by-branch', {
        params: { branch_name: branchName, page, limit },
      });

      setProducts(response.data.data || []);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBranchName) {
      fetchProductsByBranch(selectedBranchName, currentPage);
    }
  }, [selectedBranchName, currentPage]);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiService.delete(`/delete-products/${id}`);
      if (selectedBranchName) {
        fetchProductsByBranch(selectedBranchName, currentPage);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? product.category === filterCategory : true)
  );

  return (
    <AdminLayout header={<Typography variant="h6">Manage Stocks</Typography>}>
      <Head title="Manage Stocks" />
      <Container maxWidth="xl" sx={{ mx: 'auto' }}>
        {/* Branch Selector */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Select
            value={selectedBranchName || ''}
            onChange={(e) => {
              setSelectedBranchName(e.target.value as string);
              setCurrentPage(1); // Reset to first page when branch changes
            }}
            displayEmpty
            variant="outlined"
            fullWidth
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
          <TextField
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            style={{ marginRight: '8px' }}
            aria-label="Search Products by Name"
          />
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as string)}
            displayEmpty
            variant="outlined"
            fullWidth
            style={{ marginRight: '8px' }}
            aria-label="Filter by Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="contained"
            color="primary"
          >
            Add
          </Button>
        </Box>

        {/* Product Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Code</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.product_code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₱{product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          color="default"
                          onClick={() => {
                            setSelectedProduct(product); // Set the selected product
                            fetchStockHistory(product.id); // Fetch stock history for the selected product
                          }}
                        >
                          <History />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination Controls */}
        {products.length > 0 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={lastPage}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
              variant="outlined"
              shape="rounded"
            />
          </Box>
        )}

        {/* Modals */}
        <EditProductModal
          showModal={isEditModalOpen}
          closeModal={() => setIsEditModalOpen(false)}
          editProduct={editProduct}
          onUpdate={() => fetchProductsByBranch(selectedBranchName as string, currentPage)}
        />
        <AddProductModal
          showModal={isAddModalOpen}
          closeModal={() => setIsAddModalOpen(false)}
          refreshProducts={() => fetchProductsByBranch(selectedBranchName as string, currentPage)}
          auth={auth.user}
        />
        <StockHistoryModal
          showModal={isHistoryModalOpen}
          closeModal={() => setIsHistoryModalOpen(false)}
          history={stockHistory}
          productName={selectedProduct?.name || ''}
        />
      </Container>
    </AdminLayout>
  );
};

export default ProductTable;