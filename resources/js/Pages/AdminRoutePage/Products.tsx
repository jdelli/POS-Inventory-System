import { useState, useEffect } from "react";
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from "../Services/ApiService";
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Pagination, CircularProgress, Typography, Button, IconButton } from "@mui/material";
import AddProductModal from "../Props/Add";
import StockHistoryModal from "../Props/StockHistoryModal";
import EditProductModal from "../Props/Edit";
import { Edit, Delete, History, Search, Plus, Package } from "lucide-react";

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

const Products = () => {
  const [warehouseProducts, setWarehouseProducts] = useState<WarehouseProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [warehousePage, setWarehousePage] = useState(1);
  const [totalWarehousePages, setTotalWarehousePages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<WarehouseProduct | null>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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
      setStockHistory(response.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching stock history:", error);
    }
  };

  const handleEdit = (product: WarehouseProduct) => {
    setEditProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiService.delete(`/delete-products/${id}`);
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

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Warehouse Stocks</h2>}>
      <Head title="Warehouse Stocks" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .products-container {
          background: linear-gradient(to bottom right, #F8FAFC, #EFF6FF);
          min-height: 100vh;
          padding: 2.5rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          animation: slideInDown 0.6s ease-out;
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .products-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .search-filter-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          margin-bottom: 1.5rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
          animation: fadeIn 0.8s ease-out 0.2s both;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .search-input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .category-select {
          padding: 0.875rem 1.25rem;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          min-width: 200px;
          transition: all 0.3s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: white;
        }

        .category-select:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .add-button {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 0.9375rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        }

        .add-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
        }

        .table-container {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
          animation: fadeIn 0.8s ease-out 0.3s both;
        }

        .product-table {
          width: 100%;
        }

        .table-header {
          background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
        }

        .table-header-cell {
          color: white !important;
          font-weight: 700 !important;
          font-size: 0.875rem !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 1.25rem 1rem !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        .table-row {
          transition: all 0.3s ease;
          border-bottom: 1px solid #F1F5F9;
        }

        .table-row:hover {
          background: linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05));
        }

        .table-cell {
          padding: 1.25rem 1rem !important;
          font-weight: 500 !important;
          color: #334155 !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        .product-image {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid #E2E8F0;
        }

        .product-code {
          font-family: 'JetBrains Mono', monospace;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1E40AF;
          display: inline-block;
        }

        .category-badge {
          background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
          color: #166534;
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.8125rem;
          font-weight: 600;
          display: inline-block;
        }

        .quantity-badge {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          color: #92400E;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          display: inline-block;
        }

        .action-button {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          margin: 0 0.25rem;
        }

        .edit-button {
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
          color: #1E40AF;
        }

        .edit-button:hover {
          background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
          border-color: #3B82F6;
          transform: translateY(-2px);
        }

        .delete-button {
          background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
          color: #991B1B;
        }

        .delete-button:hover {
          background: linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%);
          border-color: #EF4444;
          transform: translateY(-2px);
        }

        .history-button {
          background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
          color: #374151;
        }

        .history-button:hover {
          background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%);
          border-color: #6B7280;
          transform: translateY(-2px);
        }

        .pagination-wrapper {
          display: flex;
          justify-content: center;
          padding: 2rem;
          background: white;
          border-radius: 0 0 20px 20px;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          background: white;
          border-radius: 20px;
        }

        .loading-text {
          margin-left: 1rem;
          font-weight: 600;
          color: #3B82F6;
        }
      `}</style>

      <div className="products-container">
        <div className="products-header">
          <h1 className="products-title">
            <Package size={32} />
            Warehouse Inventory
          </h1>
        </div>

        <div className="search-filter-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button className="add-button" onClick={() => setShowAddProductModal(true)}>
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <CircularProgress style={{ color: '#3B82F6' }} />
            <span className="loading-text">Loading products...</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="product-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Image</th>
                  <th className="table-header-cell">Product Code</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Category</th>
                  <th className="table-header-cell">Price</th>
                  <th className="table-header-cell">Quantity</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="table-row">
                      <td className="table-cell">
                        <img src={product.image_url} alt={product.name} className="product-image" />
                      </td>
                      <td className="table-cell">
                        <span className="product-code">{product.product_code}</span>
                      </td>
                      <td className="table-cell" style={{ fontWeight: 600 }}>{product.name}</td>
                      <td className="table-cell">
                        <span className="category-badge">{product.category}</span>
                      </td>
                      <td className="table-cell" style={{ fontWeight: 700, color: '#3B82F6' }}>
                        {formatCurrency(product.price)}
                      </td>
                      <td className="table-cell">
                        <span className="quantity-badge">{product.quantity}</span>
                      </td>
                      <td className="table-cell">
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEdit(product)}
                          aria-label="Edit Product"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDelete(product.id)}
                          aria-label="Delete Product"
                        >
                          <Delete size={18} />
                        </button>
                        <button
                          className="action-button history-button"
                          onClick={() => handleViewHistory(product.id, product.name)}
                          aria-label="View Stock History"
                        >
                          <History size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                      No products found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination-wrapper">
              <Pagination
                count={totalWarehousePages}
                page={warehousePage}
                onChange={(e, page) => setWarehousePage(page)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </div>
          </div>
        )}
      </div>

      <AddProductModal showModal={showAddProductModal} closeModal={() => setShowAddProductModal(false)} />
      <StockHistoryModal
        showModal={showHistoryModal}
        closeModal={() => setShowHistoryModal(false)}
        history={stockHistory}
        productName={selectedProductName}
      />
      <EditProductModal
        showModal={isEditModalOpen}
        closeModal={() => { setIsEditModalOpen(false); setEditProduct(null); }}
        editProduct={editProduct}
        onUpdate={() => fetchWarehouseProducts(warehousePage)}
      />
    </AdminLayout>
  );
};

export default Products;
