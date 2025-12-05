import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { Truck, Plus, Edit, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

const SupplierPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', phone: '', address: '', status: 'active' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/suppliers');
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({ name: supplier.name, contact_person: supplier.contact_person, email: supplier.email, phone: supplier.phone, address: supplier.address, status: supplier.status });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', contact_person: '', email: '', phone: '', address: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingSupplier) {
        await apiService.put(`/suppliers/${editingSupplier.id}`, formData);
      } else {
        await apiService.post('/suppliers', formData);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await apiService.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Suppliers</h2>}>
      <Head title="Suppliers" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><Truck size={20} />Suppliers</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={14} />Add</button>
        </div>

        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input type="text" className="form-control" placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 28 }} />
          </div>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{filteredSuppliers.length} suppliers</span>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading"><div className="spinner"></div>Loading...</div>
          ) : (
            <>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {paginatedSuppliers.length > 0 ? paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td style={{ fontWeight: 500 }}>{supplier.name}</td>
                      <td>{supplier.contact_person}</td>
                      <td className="text-muted">{supplier.email}</td>
                      <td>{supplier.phone}</td>
                      <td><span className={`badge ${supplier.status === 'active' ? 'badge-success' : 'badge-gray'}`}>{supplier.status}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleOpenModal(supplier)}><Edit size={14} /></button>
                          <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(supplier.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6}><div className="empty-state"><Truck size={32} /><div className="empty-state-text">No suppliers found</div></div></td></tr>}
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

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Contact Person</label><input type="text" className="form-control" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SupplierPage;
