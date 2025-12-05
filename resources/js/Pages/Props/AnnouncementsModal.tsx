import React, { useState, useEffect } from 'react';
import { X, Megaphone, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import apiService from '../Services/ApiService';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface AnnouncementModalProps {
  onNewAnnouncement: () => void;
  unreadCount: number;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ onNewAnnouncement, unreadCount }) => {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
  });
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await apiService.get('/announcements', {
        params: { page, limit },
      });
      setAnnouncements(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        currentPage: response.data.pagination.currentPage,
        lastPage: response.data.pagination.lastPage,
        perPage: response.data.pagination.perPage,
      }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadResponse = await apiService.get('/announcements/unread');
      const unreadIds = unreadResponse.data.map((item: any) => item.announcement.id);
      await Promise.all(
        unreadIds.map((id: number) => apiService.patch(`/announcements/${id}/read`))
      );
      onNewAnnouncement();
    } catch (error) {
      console.error('Error marking announcements as read:', error);
    }
  };

  useEffect(() => {
    if (open) {
      const echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT),
        forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
        disableStats: true,
        enabledTransports: ['ws'],
        cluster: 'mt1',
      });

      fetchAnnouncements(pagination.currentPage, pagination.perPage);
      markAllAsRead();

      echo.channel('announcements').listen('.new-announcement', (data: any) => {
        console.log('📣 Received announcement:', data);
        setAnnouncements((prev) => [data.announcement, ...prev]);
        onNewAnnouncement();
      });

      return () => {
        echo.leave('announcements');
        echo.disconnect();
      };
    }
  }, [open, pagination.currentPage]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    onNewAnnouncement();
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button className="announcement-trigger" onClick={handleOpen}>
        <Megaphone size={16} />
        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
      </button>

      {/* Drawer */}
      {open && (
        <div className="drawer-backdrop" onClick={handleClose}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={16} />
                <h3 className="drawer-title">Announcements</h3>
              </div>
              <button className="drawer-close" onClick={handleClose}>
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="drawer-body">
              {loading ? (
                <div className="loading-state">
                  <Loader2 size={24} className="spinner-icon" />
                  <span>Loading announcements...</span>
                </div>
              ) : announcements.length === 0 ? (
                <div className="empty-state">
                  <Megaphone size={32} />
                  <p>No announcements available.</p>
                </div>
              ) : (
                <div className="announcements-list">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="announcement-card">
                      <h4 className="announcement-title">{announcement.title}</h4>
                      <p className="announcement-content">{announcement.content}</p>
                      <div className="announcement-date">
                        <Calendar size={12} />
                        {new Date(announcement.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && announcements.length > 0 && (
              <div className="drawer-pagination">
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchAnnouncements(pagination.currentPage - 1, pagination.perPage)}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </span>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={pagination.currentPage === pagination.lastPage}
                  onClick={() => fetchAnnouncements(pagination.currentPage + 1, pagination.perPage)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="drawer-footer">
              <button className="btn btn-primary" onClick={handleClose} style={{ width: '100%' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .announcement-trigger {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 3px;
          background: transparent;
          border: 1px solid transparent;
          color: white;
          cursor: pointer;
          transition: all 0.15s;
        }
        .announcement-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-size: 0.625rem;
          font-weight: 600;
          background: #DC2626;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1000;
        }
        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 380px;
          max-width: 100vw;
          background: #FFFFFF;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
          animation: slideIn 0.2s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-header {
          background: linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%);
          color: white;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .drawer-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }
        .drawer-close {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          opacity: 0.8;
          transition: opacity 0.15s;
        }
        .drawer-close:hover { opacity: 1; }
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: #6B7280;
          gap: 0.75rem;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
          color: #1D4ED8;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #6B7280;
        }
        .empty-state svg {
          color: #D1D5DB;
          margin-bottom: 0.75rem;
        }
        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .announcement-card {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 4px;
          padding: 0.875rem;
          transition: all 0.15s;
        }
        .announcement-card:hover {
          border-color: #D1D5DB;
          background: #FFFFFF;
        }
        .announcement-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.375rem 0;
        }
        .announcement-content {
          font-size: 0.8125rem;
          color: #374151;
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
        }
        .announcement-date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.6875rem;
          color: #6B7280;
        }
        .drawer-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-top: 1px solid #E5E7EB;
        }
        .pagination-info {
          font-size: 0.75rem;
          color: #6B7280;
        }
        .drawer-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid #E5E7EB;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 500;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid transparent;
          font-family: inherit;
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
        .btn-secondary {
          background: #FFFFFF;
          color: #374151;
          border-color: #D1D5DB;
        }
        .btn-secondary:hover { background: #F3F4F6; }
        .btn-secondary:disabled {
          background: #F3F4F6;
          color: #9CA3AF;
          cursor: not-allowed;
        }
        .btn-primary {
          background: #1D4ED8;
          color: white;
          border-color: #1E40AF;
        }
        .btn-primary:hover { background: #1E40AF; }
      `}</style>
    </>
  );
};

export default AnnouncementModal;
