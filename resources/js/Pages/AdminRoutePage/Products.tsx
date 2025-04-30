import { useState, useEffect } from "react";
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from "../Services/ApiService";
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Pagination, CircularProgress, Typography, Button, IconButton } from "@mui/material";
import AddProductModal from "../Props/Add";
import StockHistoryModal from "../Props/StockHistoryModal"; // Import the StockHistoryModal
import EditProductModal from "../Props/Edit"; // Import the EditProductModal
import { Edit, Delete, History } from "@mui/icons-material";

interface WarehouseProduct {
  id: number;
  product_code: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image_url: string;
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

const SearchFilter: React.FC<{
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterCategory: string;
  setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
}> = ({ searchTerm, setSearchTerm, filterCategory, setFilterCategory }) => (
  <div className="flex flex-1 space-x-2">
    <input
      type="text"
      placeholder="Search by name"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border rounded-md py-2 px-3 w-full sm:w-auto"
    />
    <select
      value={filterCategory}
      onChange={(e) => setFilterCategory(e.target.value)}
      className="border rounded-md py-2 px-3 w-full sm:w-auto"
    >
      <option value="">All Categories</option>
      {categoryOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const Products = () => {
  const [warehouseProducts, setWarehouseProducts] = useState<WarehouseProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [warehousePage, setWarehousePage] = useState(1);
  const [totalWarehousePages, setTotalWarehousePages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);  // State for history modal
  const [stockHistory, setStockHistory] = useState<any[]>([]); // State for stock history
  const [selectedProductName, setSelectedProductName] = useState<string>(''); // Store the product name for history
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [editProduct, setEditProduct] = useState<WarehouseProduct | null>(null); // Store the product to edit

  // Helper function to format currency as ₱100,000 without decimals
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0, // No decimal places
        maximumFractionDigits: 0, // No decimal places
    }).format(amount);
};


  useEffect(() => {
    fetchWarehouseProducts(warehousePage);
  }, [warehousePage]);

  const fetchWarehouseProducts = async (page: number) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/fetch-products-by-branch?user_name=branch1&page=${page}`);
      setWarehouseProducts(response.data.warehouse.data);
      setTotalWarehousePages(response.data.warehouse.last_page);
    } catch (error) {
      console.error("Error fetching warehouse products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (productId: number, productName: string) => {
    setSelectedProductName(productName);
    try {
      const response = await apiService.get(`/stock-history/${productId}`);
      setStockHistory(response.data);  // Set the stock history data
      setShowHistoryModal(true);  // Show the history modal
    } catch (error) {
      console.error("Error fetching stock history:", error);
    }
  };

  const handleEdit = (product: WarehouseProduct) => {
    setEditProduct(product); // Set the product to edit
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiService.delete(`/delete-products/${id}`);
      // Refresh the product list after deletion
      fetchWarehouseProducts(warehousePage);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = warehouseProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? product.category === filterCategory : true)
  );

  const handleOpenAddProductModal = () => setShowAddProductModal(true);  // Open modal
  const handleCloseAddProductModal = () => setShowAddProductModal(false);  // Close modal
  const handleCloseHistoryModal = () => setShowHistoryModal(false);  // Close stock history modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditProduct(null); // Reset the edit product state
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight"> Warehouse Stocks</h2>}>
      <Head title=" Warehouse Stocks" />

      <div >
        <div className="flex justify-between items-center mb-4">
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
          <Button variant="contained" color="primary" onClick={handleOpenAddProductModal}>
            Add Product
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <CircularProgress />
            <Typography variant="body1" sx={{ marginLeft: 2 }}>Loading products...</Typography>
          </div>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Product Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Actions</TableCell> {/* Added column for actions */}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img src={product.image_url} alt={product.name} width={50} height={50} />
                      </TableCell>
                      <TableCell>{product.product_code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(product)} // Handle edit
                          aria-label="Edit Product"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleDelete(product.id)} // Handle delete
                          aria-label="Delete Product"
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          color="default"
                          onClick={() => handleViewHistory(product.id, product.name)} // Handle view history
                          aria-label="View Stock History"
                        >
                          <History />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">No products found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <div className="flex justify-center mt-4">
          <Pagination
            count={totalWarehousePages}
            page={warehousePage}
            onChange={(e, page) => setWarehousePage(page)}
            color="primary"
          />
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal showModal={showAddProductModal} closeModal={handleCloseAddProductModal} />

      {/* Stock History Modal */}
      <StockHistoryModal
        showModal={showHistoryModal}
        closeModal={handleCloseHistoryModal}
        history={stockHistory}
        productName={selectedProductName}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        showModal={isEditModalOpen}
        closeModal={handleCloseEditModal}
        editProduct={editProduct}
        onUpdate={() => fetchWarehouseProducts(warehousePage)} // Refresh data after update
      />
    </AdminLayout>
  );
};

export default Products;