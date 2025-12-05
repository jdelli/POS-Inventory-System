import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { Package, Check, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface StockRequestItem {
  product_name: string;
  quantity: number;
}

interface StockRequest {
  id: number;
  branch_name: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  items: StockRequestItem[];
  notes?: string;
}

const StockRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/stock-requests', { params: { page: currentPage, status: filterStatus !== 'all' ? filterStatus : undefined } });
      setRequests(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching stock requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [currentPage, filterStatus]);

  const handleView = (request: StockRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleAction = async (id: number, action: 'approved' | 'rejected') => {
    try {
      await apiService.put(`/stock-requests/${id}`, { status: action });
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Requests</h2>}>
      <Head title="Stock Requests" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><Package size={20} />Stock Requests</h1>
        </div>

        <div className="filter-bar">
          <select className="form-control form-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={{ width: 140 }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{requests.length} requests</span>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading"><div className="spinner"></div>Loading...</div>
          ) : (
            <>
              <table className="data-table">
                <thead><tr><th>#</th><th>Branch</th><th>Date</th><th>Items</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {requests.length > 0 ? requests.map((request, i) => (
                    <tr key={request.id}>
                      <td>{(currentPage - 1) * 10 + i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{request.branch_name}</td>
                      <td>{formatDate(request.request_date)}</td>
                      <td><span className="badge badge-primary">{request.items.length} items</span></td>
                      <td><span className={`badge ${getStatusBadge(request.status)}`}>{request.status}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-sm btn-secondary" onClick={() => handleView(request)}><Eye size={14} /></button>
                          {request.status === 'pending' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleAction(request.id, 'approved')}><Check size={14} /></button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleAction(request.id, 'rejected')}><X size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6}><div className="empty-state"><Package size={32} /><div className="empty-state-text">No requests found</div></div></td></tr>}
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

      {showModal && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request from {selectedRequest.branch_name}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="flex-between mb-3">
                <span className="text-muted">Date: {formatDate(selectedRequest.request_date)}</span>
                <span className={`badge ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span>
              </div>
              <table className="data-table">
                <thead><tr><th>Product</th><th>Qty</th></tr></thead>
                <tbody>
                  {selectedRequest.items.map((item, i) => (
                    <tr key={i}><td>{item.product_name}</td><td className="font-bold">{item.quantity}</td></tr>
                  ))}
                </tbody>
              </table>
              {selectedRequest.notes && (
                <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#F3F4F6', borderRadius: '3px', fontSize: '0.8125rem' }}>
                  <strong>Notes:</strong> {selectedRequest.notes}
                </div>
              )}
            </div>
            {selectedRequest.status === 'pending' && (
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => handleAction(selectedRequest.id, 'approved')}><Check size={14} /> Approve</button>
                <button className="btn btn-danger" onClick={() => handleAction(selectedRequest.id, 'rejected')}><X size={14} /> Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StockRequestPage;
