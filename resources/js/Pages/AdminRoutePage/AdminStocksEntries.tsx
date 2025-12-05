import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface StockEntry {
  id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  supplier: string;
  date: string;
  expiry_date: string | null;
  batch_number: string;
  notes: string;
  handled_by: string;
}

const AdminStocksEntries: React.FC = () => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const fetchStockEntries = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/stock-entries');
      setStockEntries(response.data);
      filterData(response.data, selectedMonth, selectedYear);
    } catch (error) {
      console.error('Error fetching stock entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStockEntries(); }, []);

  useEffect(() => {
    filterData(stockEntries, selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const filterData = (data: StockEntry[], month: string, year: string) => {
    const filtered = data.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() + 1 === parseInt(month, 10) && entryDate.getFullYear() === parseInt(year, 10);
    });
    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Entries</h2>}>
      <Head title="Stock Entries" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><Package size={20} />Stock Entries</h1>
        </div>

        <div className="filter-bar">
          <select className="form-control form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ width: 130 }}>
            {months.map((month, index) => <option key={index} value={(index + 1).toString().padStart(2, '0')}>{month}</option>)}
          </select>
          <select className="form-control form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: 100 }}>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{filteredEntries.length} entries found</span>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading"><div className="spinner"></div>Loading...</div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Code</th><th>Product</th><th>Qty</th><th>Supplier</th><th>Batch</th><th>Handler</th></tr>
                </thead>
                <tbody>
                  {paginatedEntries.length > 0 ? paginatedEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td><span className="code">{entry.product_code}</span></td>
                      <td style={{ fontWeight: 500 }}>{entry.product_name}</td>
                      <td><span className="badge badge-success">{entry.quantity}</span></td>
                      <td>{entry.supplier}</td>
                      <td><span className="code">{entry.batch_number}</span></td>
                      <td className="text-muted">{entry.handled_by}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7}><div className="empty-state"><Package size={32} /><div className="empty-state-text">No entries found</div></div></td></tr>
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

export default AdminStocksEntries;
