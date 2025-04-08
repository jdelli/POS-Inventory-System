import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EditProductModal from './Props/Edit';
import AddProductModal from './Props/Add';
import { Grid, TextField, InputLabel, MenuItem, Select, FormControl, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography } from '@mui/material';



interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  product_code: string,
  id: number;
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

const PaginationControls: React.FC<{
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, lastPage, onPageChange }) => (
  <div className="flex justify-center mt-4 space-x-2">
    <button
      className={`px-3 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400'}`}
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Previous
    </button>
    <span className="px-4 py-2 font-medium">
      Page {currentPage} of {lastPage}
    </span>
    <button
      className={`px-3 py-2 rounded-md ${currentPage === lastPage ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400'}`}
      disabled={currentPage === lastPage}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </button>
  </div>
);

const ProductTable: React.FC = () => {
  const { auth } = usePage().props as { auth: { user: User } }; // Cast auth prop with the updated User type
  const [products, setProducts] = useState<Product[]>([]); // Initialize as an empty array
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (userName: string, page: number = 1, limit: number = 20) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/fetch-products-by-branch`, {
        params: {
          user_name: userName,
          page,
          limit,
        },
      });

      const branchData = response.data.branch;
      setProducts(Array.isArray(branchData.data) ? branchData.data : []);

      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(auth.user.name);
  }, [auth.user.name]);



  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? product.category === filterCategory : true)
  );

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Stocks</h2>}>
      <Head title="Manage Stocks" />
      <div className="container mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
  <SearchFilter
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    filterCategory={filterCategory}
    setFilterCategory={setFilterCategory}
  />
</div>

{loading ? (
  <div className="flex justify-center py-4">
    <CircularProgress />
    <Typography variant="body1" sx={{ marginLeft: 2 }}>Loading products...</Typography>
  </div>
) : (
  <TableContainer sx={{ maxHeight: 400 }}>
    <Table stickyHeader className="min-w-full bg-white shadow-md rounded-lg">
      <TableHead>
        <TableRow>
          <TableCell align="left" className="font-medium">Image</TableCell>
          <TableCell align="left" className="font-medium">Product Code</TableCell>
          <TableCell align="left" className="font-medium">Product Name</TableCell>
          <TableCell align="left" className="font-medium">Category</TableCell>
          <TableCell align="left" className="font-medium">Price</TableCell>
          <TableCell align="left" className="font-medium">Quantity</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-12 h-12 object-cover rounded-md"
                />
              </TableCell>
              <TableCell>{product.product_code}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>₱{product.price.toLocaleString()}</TableCell>
              <TableCell className="text-red-500">{product.quantity}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} align="center">
              <Typography variant="body2" color="textSecondary">No products found.</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
)}

<PaginationControls
  currentPage={currentPage}
  lastPage={lastPage}
  onPageChange={(page) => fetchProducts(auth.user.name, page)}
  
/>
        
      </div>
    </AuthenticatedLayout>
  );
};

export default ProductTable;