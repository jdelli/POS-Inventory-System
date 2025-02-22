import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import AdminLayout from '@/Layouts/AdminLayout';
import EditProductModal from '../Props/Edit';
import AddProductModal from '../Props/Add';
import StockHistoryModal from '../Props/StockHistoryModal';

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
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Stocks</h2>}>
      <Head title="Manage Stocks" />
      <div className="container mx-auto p-6 space-y-4">
        {/* Branch Selector */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <select
            value={selectedBranchName || ''}
            onChange={(e) => {
              setSelectedBranchName(e.target.value);
              setCurrentPage(1); // Reset to first page when branch changes
            }}
            className="border rounded-md py-2 px-3 w-full md:w-auto"
            aria-label="Select Branch"
          >
            <option value="" disabled>
              Select Branch
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md py-2 px-3 w-full md:w-auto bg-white text-gray-700"
            aria-label="Search Products by Name"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded-md py-2 px-3 w-full md:w-auto bg-white text-gray-700"
            aria-label="Filter by Category"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add Product
          </button>
        </div>

        {/* Product Table */}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500" role="status"></div>
            <span className="ml-2">Loading products...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-gray-200 font-medium text-left">Product Code</th>
                  <th className="py-2 px-4 bg-gray-200 font-medium text-left">Product Name</th>
                  <th className="py-2 px-4 bg-gray-200 font-medium text-left">Category</th>
                  <th className="py-2 px-4 bg-gray-200 font-medium text-left">Price</th>
                  <th className="py-2 px-4 bg-gray-200 font-medium text-left">Quantity</th>
                  <th className="py-2 px-4 bg-gray-200 font-medium text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-100">
                      <td className="py-2 px-4">{product.product_code}</td>
                      <td className="py-2 px-4">{product.name}</td>
                      <td className="py-2 px-4">{product.category}</td>
                      <td className="py-2 px-4">₱{product.price.toLocaleString()}</td>
                      <td className="py-2 px-4">{product.quantity}</td>
                      <td className="py-2 px-4 flex space-x-2">
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            setSelectedProduct(product); // Set the selected product
                            fetchStockHistory(product.id); // Fetch stock history for the selected product
                          }}
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {products.length > 0 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              className={`px-3 py-2 rounded-md ${
                currentPage === 1 ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400 transition-colors'
              }`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="px-4 py-2 font-medium">
              Page {currentPage} of {lastPage}
            </span>
            <button
              className={`px-3 py-2 rounded-md ${
                currentPage === lastPage ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400 transition-colors'
              }`}
              disabled={currentPage === lastPage}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
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
      </div>
    </AdminLayout>
  );
};

export default ProductTable;