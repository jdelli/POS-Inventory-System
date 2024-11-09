import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import EditProductModal from './Props/Edit';
import AddProductModal from './Props/Add';


interface Product {
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

// Search and Filter Component
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStocksModalOpen, setIsAddStocksModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page: number = 1, limit: number = 20) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/fetch-products?page=${page}&per_page=${limit}`);
      setProducts(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await apiService.delete(`/delete-products/${id}`);
      fetchProducts(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

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
          <div className="flex space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-blue">Add Product</button>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-4">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-gray-300 font-medium text-left">Product Name</th>
                  <th className="py-2 px-4 bg-gray-300 font-medium text-left">Category</th>
                  <th className="py-2 px-4 bg-gray-300 font-medium text-left">Price</th>
                  <th className="py-2 px-4 bg-gray-300 font-medium text-left">Quantity</th>
                  <th className="py-2 px-4 bg-gray-300 font-medium text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-200">
                      <td className="py-2 px-4">{product.name}</td>
                      <td className="py-2 px-4">{product.category}</td>
                      <td className="py-2 px-4">₱{product.price.toLocaleString()}</td>
                      <td className="py-2 px-4 text-red-500">{product.quantity}</td>
                      <td className="py-2 px-4 flex space-x-2">
                        <button className="btn btn-green" onClick={() => handleEdit(product)}>Edit</button>
                        <button className="btn btn-red" onClick={() => handleDelete(product.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={(page) => fetchProducts(page)}
        />

        {/* Modals */}
        <EditProductModal
          showModal={isEditModalOpen}
          closeModal={() => setIsEditModalOpen(false)}
          editProduct={editProduct}
          onUpdate={() => fetchProducts(currentPage)}
        />
        <AddProductModal
          showModal={isAddModalOpen}
          closeModal={() => setIsAddModalOpen(false)}
          refreshProducts={() => fetchProducts(currentPage)}
        />
        
      </div>
    </AuthenticatedLayout>
  );
};

export default ProductTable;
