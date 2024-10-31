import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Analog/IP Cameras');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

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

  const fetchProductsByCategory = async (category: string, page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get(
        `/fetch-products?category=${encodeURIComponent(category)}&page=${page}&per_page=${limit}`
      );
      if (response?.data?.success) {
        setProducts(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsByCategory(activeTab);
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProductsByCategory(activeTab, newPage);
  };

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Products</h2>}>
      <Head title="Products" />

      <div>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-300">
          {categoryOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveTab(option)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTab === option
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="spinner border-t-2 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 font-medium py-4">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No products available in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-4"
                >
                  <img
                    src={product.image ? `/storage/${product.image}` : 'default-image-url.jpg'}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-2 mb-4 truncate">{product.description}</p>
                  <p className="text-xl font-bold text-blue-600">₱{(Number(product.price) || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {products.length > 0 && (
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              className={`px-4 py-2 text-sm font-medium border rounded-md ${
                currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white'
              }`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <p className="text-sm">
              Page {currentPage} of {lastPage}
            </p>
            <button
              className={`px-4 py-2 text-sm font-medium border rounded-md ${
                currentPage === lastPage ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white'
              }`}
              disabled={currentPage === lastPage}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Products;
