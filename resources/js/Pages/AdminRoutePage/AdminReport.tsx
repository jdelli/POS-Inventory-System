import React, { useEffect, useState } from "react";
import { usePage, Head } from "@inertiajs/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import AdminLayout from "@/Layouts/AdminLayout";
import apiService from '../Services/ApiService';
import { BarChart3, Eye, Printer, X, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface SalesOrderItem {
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface SalesOrder {
  id: number;
  receipt_number: string;
  customer_name: string;
  date: string;
  items: SalesOrderItem[];
  total_sales: number;
  payment_method: string;
}

interface Product {
  product_code: string;
  product_name: string;
  total_quantity_sold: number;
  total_sales: number;
  category: string;
}

interface Remittance {
  id: number;
  date_start: string;
  date_end: string;
  total_sales: number;
  total_cash: number;
  total_expenses: number;
  remaining_cash: number;
  cash_breakdown: string;
  expenses?: { particular: string; amount: number }[];
  status: 'Pending' | 'Received' | 'Rejected';  
  online_payments: number;
}

const DailySalesReport: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesOrder[]>([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { auth } = usePage().props as { auth: { user: { name: string } } };
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [monthlySales, setMonthlySales] = useState<Product[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [grandTotal, setGrandTotal] = useState<Product[]>([]);
  const [remittances, setRemittances] = useState([]);
  const [isRemittanceModalOpen, setIsRemittanceModalOpen] = useState(false);
  const [selectedRemittance, setSelectedRemittance] = useState<Remittance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPageRemittances, setCurrentPageRemittances] = useState(1);
  const [totalPagesRemittances, setTotalPagesRemittances] = useState(1);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [selectedMonthDaily, setSelectedMonthDaily] = useState(new Date().getMonth().toString());
  const [selectedYearDaily, setSelectedYearDaily] = useState(new Date().getFullYear().toString());
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (!auth?.user?.name || !selectedBranchName) return;
    apiService
      .get("/sales-report/daily", {
        params: { user_name: selectedBranchName, page: currentPage, month: selectedMonthDaily, year: selectedYearDaily },
      })
      .then((response) => {
        setSalesData(response.data.data);
        setTotalPages(response.data.last_page);
      })
      .catch((error) => console.error("Error fetching sales data:", error));
  }, [auth?.user?.name, selectedBranchName, currentPage, selectedMonthDaily, selectedYearDaily]);

  const fetchRemittances = async () => {
    try {
      const response = await apiService.get("/cash-breakdowns", {
        params: { branch_id: selectedBranchName, page: currentPageRemittances, month: selectedMonthDaily, year: selectedYearDaily },
      });
      if (!response.data.success) return;
      setRemittances(response.data.data || []);
      setTotalPagesRemittances(response.data.last_page);
    } catch (error) {
      console.error("Error fetching remittances:", error);
    }
  };

  useEffect(() => {
    fetchRemittances();
  }, [currentPageRemittances, selectedBranchName, selectedMonthDaily, selectedYearDaily]);

  const handleViewDetails = async (id: number) => {
    try {
      const response = await apiService.get(`/cash-breakdowns/${id}`, { params: { branch_id: selectedBranchName } });
      if (!response.data.success) { alert("No remittance found."); return; }
      const data = {
        ...response.data.data,
        expenses: typeof response.data.data.expenses === "string" ? JSON.parse(response.data.data.expenses) : response.data.data.expenses || [],
      };
      setSelectedRemittance(data);
      setIsRemittanceModalOpen(true);
    } catch (error) {
      console.error("Error fetching remittance details:", error);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiService.put(`/remittance/${id}/update-status`, { status });
      setIsRemittanceModalOpen(false);
      fetchRemittances();
    } catch (error) {
      console.error("Error updating status:", error);
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

  const handleOpenModal = (date: string) => {
    setLoading(true);
    apiService
      .get(`/sales-orders-by-date?date=${date}`, { params: { user_name: selectedBranchName } })
      .then((response) => setSelectedSalesOrder(response.data))
      .catch((error) => console.error("Error fetching sales orders:", error))
      .finally(() => setLoading(false));
    setIsModalOpen(true);
  };

  const fetchMonthlySales = async () => {
    try {
      const response = await apiService.get("/fetch-monthly-sales", {
        params: { month: selectedMonth, year: selectedYear, user_name: selectedBranchName },
      });
      if (!Array.isArray(response.data.monthlySales)) throw new Error("Expected array");
      const sortedSales = response.data.monthlySales.sort((a: Product, b: Product) => b.total_quantity_sold - a.total_quantity_sold);
      setMonthlySales(sortedSales);
      setGrandTotal(response.data.grandTotal);
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
    }
  };

  const openSalesModal = () => { setIsSalesModalOpen(true); fetchMonthlySales(); };

  const handlePrintAll = () => {
    if (!selectedSalesOrder.length) return;
    const printContent = document.getElementById("print-section-all");
    if (printContent) {
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(`<html><head><title>Sales Orders - ${selectedSalesOrder[0].date}</title>
        <style>body{font-family:Arial,sans-serif;padding:20px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#1D4ED8;color:white}</style></head>
        <body><h2>Sales Orders - ${selectedSalesOrder[0].date}</h2>${printContent.innerHTML}<script>window.onload=function(){window.print();window.close()}</script></body></html>`);
      newWindow?.document.close();
    }
  };

  const handlePrintMonthlyReport = () => {
    const printContent = document.getElementById("print-section-monthly");
    if (printContent) {
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(`<html><head><title>Monthly Report - ${selectedMonth}/${selectedYear}</title>
        <style>body{font-family:Arial,sans-serif;padding:20px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#1D4ED8;color:white}</style></head>
        <body><h2>Monthly Sales Report - ${new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" })} ${selectedYear}</h2>${printContent.innerHTML}<script>window.onload=function(){window.print();window.close()}</script></body></html>`);
      newWindow?.document.close();
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Received') return 'badge-success';
    if (status === 'Rejected') return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Report</h2>}>
      <Head title="Admin Sales Report" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><BarChart3 size={20} />Sales Report</h1>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <select className="form-control form-select" value={selectedBranchName || ""} onChange={(e) => { setSelectedBranchName(e.target.value); setCurrentPage(1); }} style={{ width: 160 }}>
            <option value="" disabled>Select Branch</option>
            {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
          </select>
          <select className="form-control form-select" value={selectedMonthDaily} onChange={(e) => setSelectedMonthDaily(e.target.value)} style={{ width: 130 }}>
            {months.map((month, index) => <option key={index} value={index.toString()}>{month}</option>)}
          </select>
          <select className="form-control form-select" value={selectedYearDaily} onChange={(e) => setSelectedYearDaily(e.target.value)} style={{ width: 100 }}>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <button className="btn btn-success" onClick={openSalesModal}>Monthly Sales</button>
        </div>

        {/* Chart */}
        <div className="chart-panel mb-3">
          <div className="chart-title"><BarChart3 size={14} />Daily Sales Overview</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-15} textAnchor="end" height={50} />
              <YAxis tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Sales"]} contentStyle={{ fontSize: '11px' }} />
              <Bar dataKey="total_sales" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tables Grid */}
        <div className="grid-2">
          {/* Daily Sales */}
          <div className="table-container">
            <div className="panel-header">Daily Sales Report</div>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Date</th><th>Total Sales</th><th>Action</th></tr>
              </thead>
              <tbody>
                {salesData.length > 0 ? salesData.map((data, index) => (
                  <tr key={data.date}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>{data.date}</td>
                    <td className="currency">{formatCurrency(data.total_sales || 0)}</td>
                    <td><button className="btn btn-sm btn-primary" onClick={() => handleOpenModal(data.date)}><Eye size={12} /> View</button></td>
                  </tr>
                )) : <tr><td colSpan={4}><div className="empty-state"><BarChart3 size={24} /><div className="empty-state-text">No records found</div></div></td></tr>}
              </tbody>
            </table>
            <div className="pagination">
              <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
              <span className="pagination-info">Page {currentPage} of {totalPages}</span>
              <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
            </div>
          </div>

          {/* Remittance */}
          <div className="table-container">
            <div className="panel-header">Remittance</div>
            <table className="data-table">
              <thead>
                <tr><th>Start</th><th>End</th><th>Sales</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {remittances.length > 0 ? remittances.map((remit: Remittance) => (
                  <tr key={remit.id}>
                    <td>{remit.date_start}</td>
                    <td>{remit.date_end}</td>
                    <td className="currency">{formatCurrency(remit.total_sales || 0)}</td>
                    <td><span className={`badge ${getStatusBadge(remit.status)}`}>{remit.status}</span></td>
                    <td><button className="btn btn-sm btn-primary" onClick={() => handleViewDetails(remit.id)}><Eye size={12} /></button></td>
                  </tr>
                )) : <tr><td colSpan={5}><div className="empty-state"><BarChart3 size={24} /><div className="empty-state-text">No records found</div></div></td></tr>}
              </tbody>
            </table>
            <div className="pagination">
              <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPageRemittances(p => Math.max(1, p-1))} disabled={currentPageRemittances === 1}><ChevronLeft size={14} /></button>
              <span className="pagination-info">Page {currentPageRemittances} of {totalPagesRemittances}</span>
              <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPageRemittances(p => Math.min(totalPagesRemittances, p+1))} disabled={currentPageRemittances === totalPagesRemittances}><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Remittance Modal */}
      {isRemittanceModalOpen && selectedRemittance && (
        <div className="modal-backdrop" onClick={() => setIsRemittanceModalOpen(false)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Remittance Details</h3>
              <button className="modal-close" onClick={() => setIsRemittanceModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="info-grid mb-3">
                <div className="info-item"><div className="info-label">Date From</div><div className="info-value">{selectedRemittance.date_start}</div></div>
                <div className="info-item"><div className="info-label">Date To</div><div className="info-value">{selectedRemittance.date_end}</div></div>
                <div className="info-item"><div className="info-label">Total Sales</div><div className="info-value currency">{formatCurrency(selectedRemittance.total_sales || 0)}</div></div>
                <div className="info-item"><div className="info-label">Total Cash</div><div className="info-value">{formatCurrency(selectedRemittance.total_cash || 0)}</div></div>
                <div className="info-item"><div className="info-label">Online Payments</div><div className="info-value">{formatCurrency(selectedRemittance.online_payments || 0)}</div></div>
                <div className="info-item"><div className="info-label">Expenses</div><div className="info-value text-danger">{Array.isArray(selectedRemittance.expenses) ? formatCurrency(selectedRemittance.expenses.reduce((sum, e) => sum + Number(e.amount), 0)) : '₱0'}</div></div>
              </div>
              <div className="info-item mb-3" style={{ background: '#DBEAFE' }}><div className="info-label">Remaining Cash</div><div className="info-value text-primary font-bold">{formatCurrency(selectedRemittance.remaining_cash || 0)}</div></div>
              
              <div className="mb-3">
                <div className="form-label">Cash Breakdown</div>
                <table className="data-table">
                  <thead><tr><th>Denomination</th><th>Qty</th></tr></thead>
                  <tbody>
                    {Object.entries(JSON.parse(selectedRemittance.cash_breakdown) as Record<string, number>).map(([denom, count]) => (
                      <tr key={denom}><td>{denom}</td><td>{count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRemittance.expenses && Array.isArray(selectedRemittance.expenses) && selectedRemittance.expenses.length > 0 && (
                <div className="mb-3">
                  <div className="form-label">Expenses</div>
                  <table className="data-table">
                    <thead><tr><th>Type</th><th>Amount</th></tr></thead>
                    <tbody>
                      {selectedRemittance.expenses.map((exp, i) => (
                        <tr key={i}><td>{exp.particular}</td><td className="text-danger">{formatCurrency(Number(exp.amount) || 0)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={() => handleUpdateStatus(selectedRemittance.id, "Received")}><CheckCircle size={14} /> Received</button>
              <button className="btn btn-danger" onClick={() => handleUpdateStatus(selectedRemittance.id, "Rejected")}><XCircle size={14} /> Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Sales Modal */}
      {isModalOpen && selectedSalesOrder.length > 0 && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Daily Sales - {selectedSalesOrder[0].date}</h3>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-secondary" onClick={handlePrintAll}><Printer size={14} /> Print</button>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body">
              {loading ? <div className="loading"><div className="spinner"></div>Loading...</div> : (
                <div id="print-section-all">
                  <table className="data-table">
                    <thead><tr><th>#</th><th>Receipt</th><th>Customer</th><th>Total</th><th>Payment</th></tr></thead>
                    <tbody>
                      {selectedSalesOrder.map((order, index) => (
                        <tr key={order.id}>
                          <td>{index + 1}</td>
                          <td><span className="code">{order.receipt_number}</span></td>
                          <td>{order.customer_name}</td>
                          <td className="currency">{formatCurrency(order.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</td>
                          <td><span className="badge badge-info">{order.payment_method}</span></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#F3F4F6' }}>
                        <td colSpan={3} className="text-right font-bold">Grand Total:</td>
                        <td className="currency font-bold">{formatCurrency(selectedSalesOrder.reduce((acc, order) => acc + order.items.reduce((o, i) => o + i.price * i.quantity, 0), 0))}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Sales Modal */}
      {isSalesModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSalesModalOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Monthly Sales Report</h3>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-secondary" onClick={handlePrintMonthlyReport}><Printer size={14} /> Print</button>
                <button className="modal-close" onClick={() => setIsSalesModalOpen(false)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body">
              <div className="flex gap-2 mb-3">
                <select className="form-control form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))} style={{ width: 130 }}>
                  {[...Array(12).keys()].map((m) => <option key={m+1} value={m+1}>{new Date(0, m).toLocaleString("default", { month: "long" })}</option>)}
                </select>
                <select className="form-control form-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))} style={{ width: 100 }}>
                  {[...Array(10).keys()].map((y) => <option key={y + new Date().getFullYear() - 5} value={y + new Date().getFullYear() - 5}>{y + new Date().getFullYear() - 5}</option>)}
                </select>
                <button className="btn btn-primary" onClick={fetchMonthlySales}>Filter</button>
              </div>
              <div id="print-section-monthly">
                <table className="data-table">
                  <thead><tr><th>Product Name</th><th>Qty Sold</th><th>Total Sales</th></tr></thead>
                  <tbody>
                    {monthlySales.length > 0 ? monthlySales.map((product) => (
                      <tr key={product.product_code}>
                        <td>{product.product_name}</td>
                        <td className="font-bold text-primary">{product.total_quantity_sold.toLocaleString()}</td>
                        <td className="currency">{formatCurrency(product.total_sales || 0)}</td>
                      </tr>
                    )) : <tr><td colSpan={3}><div className="empty-state"><BarChart3 size={24} /><div className="empty-state-text">No data</div></div></td></tr>}
                  </tbody>
                </table>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#DBEAFE', borderRadius: '3px', textAlign: 'right' }}>
                  <strong>Grand Total: {formatCurrency(Number(grandTotal) || 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DailySalesReport;
