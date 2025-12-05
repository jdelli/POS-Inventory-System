import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { Megaphone, Plus, X, Trash2 } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Announcement {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>({ title: '', content: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const response = await apiService.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;
    try {
      await apiService.post('/announcements', newAnnouncement);
      setNewAnnouncement({ title: '', content: '' });
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await apiService.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Announcements</h2>}>
      <Head title="Announcements" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><Megaphone size={20} />Announcements</h1>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={14} />New</button>
        </div>

        {/* Announcement List */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Content</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {announcements.length > 0 ? announcements.map((announcement) => (
                <tr key={announcement.id}>
                  <td style={{ fontWeight: 600 }}>{announcement.title}</td>
                  <td style={{ maxWidth: 400 }}>{announcement.content.substring(0, 80)}{announcement.content.length > 80 ? '...' : ''}</td>
                  <td><span className="badge badge-gray">{formatDate(announcement.created_at!)}</span></td>
                  <td><button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(announcement.id!)}><Trash2 size={14} /></button></td>
                </tr>
              )) : (
                <tr><td colSpan={4}><div className="empty-state"><Megaphone size={32} /><div className="empty-state-text">No announcements yet</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Announcement</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" className="form-control" placeholder="Enter title" value={newAnnouncement.title} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea name="content" className="form-control" rows={4} placeholder="Enter content..." value={newAnnouncement.content} onChange={handleInputChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Announcements;
