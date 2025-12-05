import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Product {
  id: number;
  product_code: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface Branch {
  id: number;
  name: string;
}

const BranchStocks: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiService.get('/get-branches');
        setBranches(response.data);
        if (response.data.length > 0) setSelectedBranch(response.data[0].name);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/fetch-products-by-branch?user_name=${selectedBranch}&page=${currentPage}`);
        setProducts(response.data.branch?.data || []);
        setTotalPages(response.data.branch?.last_page || 1);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedBranch, currentPage]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.product_code.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const getStockBadge = (qty: number) => {
    if (qty <= 10) return 'badge-danger';
    if (qty <= 30) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Branch Stocks</h2>}>
      <Head title="Branch Stocks" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><Package size={20} />Branch Stocks</h1>
        </div>

        <div className="filter-bar">
          <select className="form-control form-select" value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setCurrentPage(1); }} style={{ width: 160 }}>
            {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
          </select>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input type="text" className="form-control" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 28 }} />
          </div>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{filteredProducts.length} products</span>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading"><div className="spinner"></div>Loading...</div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr><th>Image</th><th>Code</th><th>Name</th><th>Category</th><th>Price</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td><img src={product.image_url} alt={product.name} className="thumb" /></td>
                      <td><span className="code">{product.product_code}</span></td>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td><span className="badge badge-gray">{product.category}</span></td>
                      <td className="currency">{formatCurrency(product.price)}</td>
                      <td><span className={`badge ${getStockBadge(product.quantity)}`}>{product.quantity}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6}><div className="empty-state"><Package size={32} /><div className="empty-state-text">No products found</div></div></td></tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
                  <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BranchStocks;
