import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../Services/ApiService';
import { TrendingUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface SalesData {
  date: string;
  total_sales: number;
}

interface Branch {
  id: number;
  name: string;
}

interface ProductSale {
  product_name: string;
  quantity: number;
  total: number;
}

const SalesStatistics: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
    const fetchSales = async () => {
      setLoading(true);
      try {
        const response = await apiService.get('/sales-report/daily', {
          params: { user_name: selectedBranch, month: selectedMonth - 1, year: selectedYear }
        });
        setSalesData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [selectedBranch, selectedMonth, selectedYear]);

  const fetchDayDetails = async (date: string) => {
    try {
      const response = await apiService.get('/sales-orders-by-date', { params: { date, user_name: selectedBranch } });
      const products: ProductSale[] = [];
      response.data.forEach((order: any) => {
        order.items.forEach((item: any) => {
          const existing = products.find(p => p.product_name === item.product_name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.total += item.price * item.quantity;
          } else {
            products.push({ product_name: item.product_name, quantity: item.quantity, total: item.price * item.quantity });
          }
        });
      });
      setProductSales(products.sort((a, b) => b.total - a.total));
      setSelectedDate(date);
      setDetailsModal(true);
    } catch (error) {
      console.error('Error fetching day details:', error);
    }
  };

  const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  const totalSales = salesData.reduce((sum, d) => sum + d.total_sales, 0);
  const avgSales = salesData.length ? totalSales / salesData.length : 0;

  const totalPages = Math.ceil(salesData.length / itemsPerPage);
  const paginatedData = salesData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Statistics</h2>}>
      <Head title="Sales Statistics" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><TrendingUp size={20} />Sales Statistics</h1>
        </div>

        <div className="filter-bar">
          <select className="form-control form-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} style={{ width: 160 }}>
            {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
          </select>
          <select className="form-control form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={{ width: 130 }}>
            {months.map((month, i) => <option key={i} value={i + 1}>{month}</option>)}
          </select>
          <select className="form-control form-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ width: 100 }}>
            {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
          </select>
        </div>

        <div className="stats-row">
          <div className="stat-box"><div className="stat-label">Total Sales</div><div className="stat-value success">{formatCurrency(totalSales)}</div></div>
          <div className="stat-box"><div className="stat-label">Average Daily</div><div className="stat-value primary">{formatCurrency(avgSales)}</div></div>
          <div className="stat-box"><div className="stat-label">Days with Sales</div><div className="stat-value">{salesData.filter(d => d.total_sales > 0).length}</div></div>
        </div>

        <div className="chart-panel mb-3">
          <div className="chart-title"><TrendingUp size={14} />Daily Sales Trend</div>
          {loading ? <div className="loading"><div className="spinner"></div>Loading...</div> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-15} textAnchor="end" height={50} />
                <YAxis tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Sales"]} contentStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total_sales" fill="#3B82F6" radius={[2, 2, 0, 0]} onClick={(data) => fetchDayDetails(data.date)} style={{ cursor: 'pointer' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="table-container">
          <div className="panel-header">Daily Breakdown</div>
          <table className="data-table">
            <thead><tr><th>#</th><th>Date</th><th>Total Sales</th></tr></thead>
            <tbody>
              {paginatedData.length > 0 ? paginatedData.map((data, i) => (
                <tr key={data.date} onClick={() => fetchDayDetails(data.date)} style={{ cursor: 'pointer' }}>
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td>{data.date}</td>
                  <td className="currency">{formatCurrency(data.total_sales)}</td>
                </tr>
              )) : <tr><td colSpan={3}><div className="empty-state"><TrendingUp size={24} /><div className="empty-state-text">No data</div></div></td></tr>}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
              <span className="pagination-info">Page {currentPage} of {totalPages}</span>
              <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {detailsModal && (
        <div className="modal-backdrop" onClick={() => setDetailsModal(false)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Sales Details - {selectedDate}</h3>
              <button className="modal-close" onClick={() => setDetailsModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <table className="data-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
                <tbody>
                  {productSales.map((p, i) => (
                    <tr key={i}>
                      <td>{p.product_name}</td>
                      <td className="font-bold">{p.quantity}</td>
                      <td className="currency">{formatCurrency(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#F3F4F6' }}>
                    <td className="font-bold text-right" colSpan={2}>Grand Total:</td>
                    <td className="currency font-bold">{formatCurrency(productSales.reduce((s, p) => s + p.total, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SalesStatistics;
