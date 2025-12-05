import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, History, Calendar, Package, Hash, User } from 'lucide-react';

interface StockHistoryProps {
  showModal: boolean;
  closeModal: () => void;
  productName: string;
  history: any[];
}

const StockHistoryModal: React.FC<StockHistoryProps> = ({ showModal, closeModal, productName, history }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  if (!showModal) return null;

  const filteredHistory = history.filter((entry) => {
    const entryDate = new Date(entry.date);
    if (startDate && entryDate < startDate) return false;
    if (endDate && entryDate > endDate) return false;
    return true;
  });

  return (
    <div className="modal-backdrop">
      <div className="modal modal-lg">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={16} />
            <h3 className="modal-title">{productName} - Stock History</h3>
          </div>
          <button className="modal-close" onClick={closeModal}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Date Filters */}
          <div className="filter-bar" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} style={{ color: '#6B7280' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>FILTERS:</span>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="form-control"
                placeholderText="Start Date"
                dateFormat="MMM d, yyyy"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                className="form-control"
                placeholderText="End Date"
                dateFormat="MMM d, yyyy"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => { setStartDate(null); setEndDate(null); }}
              >
                Clear
              </button>
            )}
          </div>

          {/* History List */}
          {filteredHistory.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Qty Changed</th>
                    <th>Remaining</th>
                    <th>Receipt #</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((entry, index) => (
                    <tr key={index}>
                      <td>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem' }}>
                          {entry.date}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${entry.action === 'added' ? 'badge-success' : 'badge-danger'}`}>
                          {entry.action === 'added' ? 'ADDED' : 'DEDUCTED'}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 600, 
                          color: entry.action === 'added' ? '#059669' : '#DC2626' 
                        }}>
                          {entry.action === 'added' ? '+' : ''}{entry.quantity_changed}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{entry.remaining_stock}</span>
                      </td>
                      <td>
                        <span className="code">{entry.receipt_number}</span>
                      </td>
                      <td>
                        <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{entry.name}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Package size={32} />
              <p className="empty-state-text">No history available for the selected date range.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span style={{ fontSize: '0.75rem', color: '#6B7280', marginRight: 'auto' }}>
            {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''} found
          </span>
          <button className="btn btn-secondary" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #FFFFFF;
          border-radius: 4px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
        }
        .modal-lg { width: 800px; max-width: 95vw; }
        .modal-header {
          background: linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%);
          color: white;
          padding: 0.625rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }
        .modal-close {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          opacity: 0.8;
          transition: opacity 0.15s;
        }
        .modal-close:hover { opacity: 1; }
        .modal-body {
          padding: 1rem;
          overflow-y: auto;
          max-height: calc(85vh - 110px);
        }
        .modal-footer {
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-top: 1px solid #D1D5DB;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-bar {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: #F9FAFB;
          border: 1px solid #D1D5DB;
          border-radius: 4px;
        }
        .form-group { margin-bottom: 0.75rem; }
        .form-control {
          padding: 0.375rem 0.5rem;
          font-size: 0.8125rem;
          border: 1px solid #D1D5DB;
          border-radius: 3px;
          background: #FFFFFF;
          color: #374151;
          font-family: inherit;
          width: 140px;
        }
        .form-control:focus {
          outline: none;
          border-color: #1D4ED8;
          box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.15);
        }
        .table-container {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 4px;
          overflow: hidden;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .data-table thead { background: #E5E7EB; }
        .data-table th {
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #111827;
          border-bottom: 1px solid #D1D5DB;
        }
        .data-table td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #F3F4F6;
          color: #374151;
        }
        .data-table tbody tr:hover { background: #F9FAFB; }
        .badge {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 2px;
        }
        .badge-success { background: #D1FAE5; color: #065F46; }
        .badge-danger { background: #FEE2E2; color: #991B1B; }
        .code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          background: #F3F4F6;
          padding: 0.125rem 0.375rem;
          border-radius: 2px;
          color: #1E40AF;
        }
        .btn {
          display: inline-flex;
          align-items: center;
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
        .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
        .btn-secondary {
          background: #F9FAFB;
          color: #374151;
          border-color: #D1D5DB;
        }
        .btn-secondary:hover { background: #E5E7EB; }
        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: #6B7280;
        }
        .empty-state svg { color: #D1D5DB; margin-bottom: 0.5rem; }
        .empty-state-text { font-size: 0.875rem; }
      `}</style>
    </div>
  );
};

export default StockHistoryModal;
