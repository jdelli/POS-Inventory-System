import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import AdminLayout from '@/Layouts/AdminLayout';
import EditProductModal from '../Props/Edit';
import AddProductModal from '../Props/Add';

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
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch branches
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

  const fetchProductsByBranch = async (branchId, page = 1, limit = 20) => {
    if (!branchId) {
      setProducts([]);
      setCurrentPage(1);
      setLastPage(1);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching products with branch_id:", branchId); // Debugging branch_id
      const response = await apiService.get('/admin-fetch-products-by-branch', {
        params: { branch_id: branchId, page, limit },
      });

      console.log("Fetched products response:", response.data); // Debugging response
      setProducts(response.data.data || []);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when selectedBranchId or currentPage changes
  useEffect(() => {
    if (selectedBranchId !== null) {
      fetchProductsByBranch(selectedBranchId, currentPage);
    }
  }, [selectedBranchId, currentPage]);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiService.delete(`/delete-products/${id}`);
      fetchProductsByBranch(selectedBranchId as number, currentPage);
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
        <div className="flex space-x-2">
          <select
            value={selectedBranchId || ''}
            onChange={(e) => { 
              setSelectedBranchId(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when branch changes
            }}
            className="border rounded-md py-2 px-3 w-full sm:w-auto"
          >
            <option value="" disabled>
              Select Branch
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Product
          </button>
        </div>

        {/* Product Table */}
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
                      <td className="py-2 px-4">{product.quantity}</td>
                      <td className="py-2 px-4 flex space-x-2">
                        <button className="btn btn-green" onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        <button className="btn btn-red" onClick={() => handleDelete(product.id)}>
                          Delete
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
              className={`px-3 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400'}`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="px-4 py-2 font-medium">
              Page {currentPage} of {lastPage}
            </span>
            <button
              className={`px-3 py-2 rounded-md ${currentPage === lastPage ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400'}`}
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
          onUpdate={() => fetchProductsByBranch(selectedBranchId as number, currentPage)}
        />
        <AddProductModal
          showModal={isAddModalOpen}
          closeModal={() => setIsAddModalOpen(false)}
          refreshProducts={() => fetchProductsByBranch(selectedBranchId as number, currentPage)}
          auth={auth.user}
        />
      </div>
    </AdminLayout>
  );
};

export default ProductTable;