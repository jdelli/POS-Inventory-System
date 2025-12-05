import React from 'react';
import { X, Printer, Receipt as ReceiptIcon, CreditCard } from 'lucide-react';

interface SalesOrderItem {
  product_name: string;
  price: number;
  quantity: number;
}

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder?: {
    id: number;
    customer_name: string;
    receipt_number: string;
    date: string;
    payment_method: string;
    items: SalesOrderItem[];
  };
}

const Receipt: React.FC<ReceiptProps> = ({ isOpen, onClose, selectedOrder }) => {
  if (!isOpen || !selectedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const grandTotal = selectedOrder.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-md receipt-modal">
        {/* Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ReceiptIcon size={16} />
            <h3 className="modal-title">Order Receipt</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="modal-body receipt-content">
          <div className="receipt-header">
            <h2>Order Receipt</h2>
            <p className="receipt-number">{selectedOrder.receipt_number}</p>
          </div>

          <div className="receipt-info">
            <div className="info-row">
              <span className="info-label">Customer:</span>
              <span className="info-value">{selectedOrder.customer_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{selectedOrder.date}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment:</span>
              <span className="info-value payment-badge">
                <CreditCard size={12} />
                {selectedOrder.payment_method}
              </span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Grand Total:</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{formatCurrency(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="receipt-footer">
            <p>Thank you for your purchase!</p>
          </div>
        </div>

        {/* Footer - Hidden during print */}
        <div className="modal-footer no-print">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-success">
            <Printer size={14} />
            Print Receipt
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
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
        }
        .modal-md { width: 500px; max-width: 95vw; }
        .modal-header {
          background: linear-gradient(135deg, #0F766E 0%, #0D9488 100%);
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
          max-height: calc(90vh - 110px);
        }
        .modal-footer {
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-top: 1px solid #D1D5DB;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        .receipt-header {
          text-align: center;
          padding-bottom: 0.75rem;
          border-bottom: 2px dashed #E5E7EB;
          margin-bottom: 0.75rem;
        }
        .receipt-header h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.25rem;
        }
        .receipt-number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          color: #6B7280;
          margin: 0;
        }
        .receipt-info {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 4px;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0;
        }
        .info-label {
          font-size: 0.75rem;
          color: #6B7280;
        }
        .info-value {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #111827;
        }
        .payment-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: #FEF3C7;
          color: #92400E;
          padding: 0.125rem 0.5rem;
          border-radius: 2px;
          font-size: 0.6875rem;
          font-weight: 600;
        }
        .table-container {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.75rem;
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
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tfoot td {
          padding: 0.75rem;
          border-top: 1px solid #D1D5DB;
          background: #F9FAFB;
        }
        .receipt-footer {
          text-align: center;
          padding-top: 0.75rem;
          border-top: 2px dashed #E5E7EB;
        }
        .receipt-footer p {
          font-size: 0.8125rem;
          color: #6B7280;
          margin: 0;
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
        .btn-secondary {
          background: #F9FAFB;
          color: #374151;
          border-color: #D1D5DB;
        }
        .btn-secondary:hover { background: #E5E7EB; }
        .btn-success {
          background: #059669;
          color: white;
          border-color: #047857;
        }
        .btn-success:hover { background: #047857; }

        @media print {
          .no-print { display: none !important; }
          .modal-backdrop {
            position: static;
            background: none;
          }
          .modal {
            box-shadow: none;
            max-height: none;
          }
          .receipt-content {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;
