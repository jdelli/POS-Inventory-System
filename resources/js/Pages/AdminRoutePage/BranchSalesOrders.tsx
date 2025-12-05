import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { ShoppingCart, Eye, X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface SalesOrder {
  id: number;
  receipt_number: string;
  customer_name: string;
  date: string;
  items: OrderItem[];
  total_sales: number;
  payment_method: string;
}

interface Branch {
  id: number;
  name: string;
}

const BranchSalesOrders: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await apiService.get('/sales-orders-by-date', { params: { date: selectedDate, user_name: selectedBranch, page: currentPage } });
        setOrders(Array.isArray(response.data) ? response.data : response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedBranch, selectedDate, currentPage]);

  const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  const totalSales = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0);

  const handleView = (order: SalesOrder) => { setSelectedOrder(order); setShowModal(true); };

  const handlePrint = () => {
    if (!selectedOrder) return;
    const printContent = document.getElementById('print-receipt');
    if (printContent) {
      const w = window.open('', '_blank');
      w?.document.write(`<html><head><title>Receipt - ${selectedOrder.receipt_number}</title><style>body{font-family:Arial;font-size:12px;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head><body>${printContent.innerHTML}<script>window.onload=function(){window.print();window.close()}</script></body></html>`);
      w?.document.close();
    }
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Orders</h2>}>
      <Head title="Branch Sales Orders" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><ShoppingCart size={20} />Sales Orders</h1>
        </div>

        <div className="filter-bar">
          <select className="form-control form-select" value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setCurrentPage(1); }} style={{ width: 160 }}>
            {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
          </select>
          <input type="date" className="form-control" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }} style={{ width: 150 }} />
          <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{orders.length} orders • Total: <span className="currency">{formatCurrency(totalSales)}</span></span>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading"><div className="spinner"></div>Loading...</div>
          ) : (
            <>
              <table className="data-table">
                <thead><tr><th>#</th><th>Receipt</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Action</th></tr></thead>
                <tbody>
                  {orders.length > 0 ? orders.map((order, i) => (
                    <tr key={order.id}>
                      <td>{(currentPage - 1) * 10 + i + 1}</td>
                      <td><span className="code">{order.receipt_number}</span></td>
                      <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                      <td><span className="badge badge-primary">{order.items.length}</span></td>
                      <td className="currency">{formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</td>
                      <td><span className="badge badge-info">{order.payment_method}</span></td>
                      <td><button className="btn btn-sm btn-secondary" onClick={() => handleView(order)}><Eye size={14} /></button></td>
                    </tr>
                  )) : <tr><td colSpan={7}><div className="empty-state"><ShoppingCart size={32} /><div className="empty-state-text">No orders found</div></div></td></tr>}
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

      {showModal && selectedOrder && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Order #{selectedOrder.receipt_number}</h3>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-secondary" onClick={handlePrint}><Printer size={14} /></button>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body">
              <div id="print-receipt">
                <div className="info-grid mb-3">
                  <div className="info-item"><div className="info-label">Customer</div><div className="info-value">{selectedOrder.customer_name}</div></div>
                  <div className="info-item"><div className="info-label">Date</div><div className="info-value">{selectedOrder.date}</div></div>
                  <div className="info-item"><div className="info-label">Payment</div><div className="info-value">{selectedOrder.payment_method}</div></div>
                  <div className="info-item"><div className="info-label">Receipt</div><div className="info-value">{selectedOrder.receipt_number}</div></div>
                </div>
                <table className="data-table">
                  <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.product_name}</td>
                        <td className="font-bold">{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td className="currency">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#DBEAFE' }}>
                      <td colSpan={3} className="text-right font-bold">Grand Total:</td>
                      <td className="currency font-bold">{formatCurrency(selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BranchSalesOrders;
