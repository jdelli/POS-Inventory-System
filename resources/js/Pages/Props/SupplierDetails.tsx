import React from 'react';
import { X, Package, Hash, DollarSign } from 'lucide-react';

interface SupplierStock {
  id: number;
  supplier_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface SupplierStocksModalProps {
  open: boolean;
  onClose: () => void;
  stocks: SupplierStock[];
}

const SupplierStocksModal: React.FC<SupplierStocksModalProps> = ({ open, onClose, stocks }) => {
  if (!open) return null;

  const stockList = stocks || [];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const grandTotal = stockList.reduce((sum, stock) => sum + (stock.total || 0), 0);

  return (
    <div className="modal-backdrop">
      <div className="modal modal-lg">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} />
            <h3 className="modal-title">Supplier Stocks</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {stockList.length === 0 ? (
            <div className="empty-state">
              <Package size={32} />
              <p className="empty-state-text">No stocks available</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stockList.map((stock) => (
                    <tr key={stock.id}>
                      <td>
                        <span className="code">{stock.product_code}</span>
                      </td>
                      <td>{stock.product_name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-info">{stock.quantity}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="currency">{formatCurrency(stock.price || 0)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="currency" style={{ fontWeight: 600 }}>{formatCurrency(stock.total || 0)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, background: '#F9FAFB' }}>
                      Grand Total:
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, background: '#F9FAFB', color: '#059669' }}>
                      {formatCurrency(grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span style={{ fontSize: '0.75rem', color: '#6B7280', marginRight: 'auto' }}>
            {stockList.length} item{stockList.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
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
        .modal-lg { width: 700px; max-width: 95vw; }
        .modal-header {
          background: linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%);
          color: white;
          padding: 0.625rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-title { font-size: 0.875rem; font-weight: 600; margin: 0; }
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
        .data-table tfoot td {
          border-bottom: none;
          border-top: 1px solid #D1D5DB;
        }
        .code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          background: #F3F4F6;
          padding: 0.125rem 0.375rem;
          border-radius: 2px;
          color: #1E40AF;
        }
        .badge {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 2px;
        }
        .badge-info { background: #E0F2FE; color: #075985; }
        .currency { color: #059669; }
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
        .empty-state-text { font-size: 0.875rem; margin: 0; }
      `}</style>
    </div>
  );
};

export default SupplierStocksModal;
