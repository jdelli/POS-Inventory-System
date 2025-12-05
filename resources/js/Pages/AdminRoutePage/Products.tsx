import { useState, useEffect } from "react";
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from "../Services/ApiService";
import { Pagination, CircularProgress } from "@mui/material";
import AddProductModal from "../Props/Add";
import StockHistoryModal from "../Props/StockHistoryModal";
import EditProductModal from "../Props/Edit";
import { Package, Edit, Trash2, History, Search, Plus } from "lucide-react";
import SharedStyles from './SharedStyles';

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

  const getQuantityClass = (qty: number) => {
    if (qty <= 10) return 'badge-danger';
    if (qty <= 30) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Warehouse Stocks</h2>}>
      <Head title="Warehouse Stocks" />
      <SharedStyles />

      <div className="admin-page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <Package size={20} />
            Warehouse Inventory
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 28 }}
            />
          </div>
          <select
            className="form-control form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowAddProductModal(true)}>
            <Plus size={14} />
            Add Product
          </button>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading products...</span>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.image_url} alt={product.name} className="thumb" />
                        </td>
                        <td>
                          <span className="code">{product.product_code}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{product.name}</td>
                        <td>
                          <span className="badge badge-gray">{product.category}</span>
                        </td>
                        <td className="currency">{formatCurrency(product.price)}</td>
                        <td>
                          <span className={`badge ${getQuantityClass(product.quantity)}`}>{product.quantity}</span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleEdit(product)} title="Edit">
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(product.id)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                            <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleViewHistory(product.id, product.name)} title="History">
                              <History size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <Package size={32} />
                          <div className="empty-state-text">No products found</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pagination">
                <Pagination
                  count={totalWarehousePages}
                  page={warehousePage}
                  onChange={(e, page) => setWarehousePage(page)}
                  color="primary"
                  size="small"
                  showFirstButton
                  showLastButton
                />
              </div>
            </>
          )}
        </div>
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
