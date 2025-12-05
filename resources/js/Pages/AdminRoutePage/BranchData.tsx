import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { Building2, Plus, Edit, Trash2, X, Users } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Branch {
  id: number;
  name: string;
  address: string;
  contact: string;
  manager?: string;
  status: 'active' | 'inactive';
}

const BranchData: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', contact: '', manager: '', status: 'active' });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/get-branches');
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({ name: branch.name, address: branch.address, contact: branch.contact, manager: branch.manager || '', status: branch.status });
    } else {
      setEditingBranch(null);
      setFormData({ name: '', address: '', contact: '', manager: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingBranch) {
        await apiService.put(`/branches/${editingBranch.id}`, formData);
      } else {
        await apiService.post('/branches', formData);
      }
      setShowModal(false);
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this branch?')) return;
    try {
      await apiService.delete(`/branches/${id}`);
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Branches</h2>}>
      <Head title="Branch Data" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><Building2 size={20} />Branches</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={14} />Add</button>
        </div>

        <div className="stats-row">
          <div className="stat-box"><div className="stat-label">Total Branches</div><div className="stat-value">{branches.length}</div></div>
          <div className="stat-box"><div className="stat-label">Active</div><div className="stat-value success">{branches.filter(b => b.status === 'active').length}</div></div>
          <div className="stat-box"><div className="stat-label">Inactive</div><div className="stat-value danger">{branches.filter(b => b.status !== 'active').length}</div></div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading"><div className="spinner"></div>Loading...</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Address</th><th>Contact</th><th>Manager</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {branches.length > 0 ? branches.map((branch) => (
                  <tr key={branch.id}>
                    <td style={{ fontWeight: 500 }}><Building2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />{branch.name}</td>
                    <td className="text-muted">{branch.address}</td>
                    <td>{branch.contact}</td>
                    <td>{branch.manager || '-'}</td>
                    <td><span className={`badge ${branch.status === 'active' ? 'badge-success' : 'badge-gray'}`}>{branch.status}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleOpenModal(branch)}><Edit size={14} /></button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(branch.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6}><div className="empty-state"><Building2 size={32} /><div className="empty-state-text">No branches found</div></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Branch Name</label><input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Contact</label><input type="text" className="form-control" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Manager</label><input type="text" className="form-control" value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} /></div>
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

export default BranchData;
