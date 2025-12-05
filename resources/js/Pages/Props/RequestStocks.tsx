import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { X, Package, Plus, Trash2, Send, Search } from 'lucide-react';

interface Item {
  name: string;
  quantity: number;
  id?: number;
  price?: number;
  product_code: string;
}

interface Auth {
  user: {
    name: string;
  };
}

interface RequestStocksProps {
  isOpen: boolean;
  onClose: () => void;
  auth: Auth;
}

const StockRequestModal: React.FC<RequestStocksProps> = ({ isOpen, onClose, auth }) => {
  if (!isOpen) return null;

  const [requestItems, setRequestItems] = useState<Item[]>([{ product_code: '', name: '', quantity: 0 }]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [productSuggestions, setProductSuggestions] = useState<Item[][]>([[]]);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    searchTerms.forEach((term, index) => {
      if (term.length > 0) {
        apiService
          .get('/search-products', {
            params: { q: term, user_name: auth.user.name },
          })
          .then((response) => {
            const updatedSuggestions = [...productSuggestions];
            updatedSuggestions[index] = response.data;
            setProductSuggestions(updatedSuggestions);
          })
          .catch((error) => {
            console.error('Error fetching product suggestions:', error);
          });
      } else {
        const updatedSuggestions = [...productSuggestions];
        updatedSuggestions[index] = [];
        setProductSuggestions(updatedSuggestions);
      }
    });
  }, [searchTerms]);

  const handleSearchTermChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleItemChange(index, 'name', value);
  };

  const handleSuggestionClick = (index: number, product: Item) => {
    const updatedItems = requestItems.map((item, i) =>
      i === index ? { ...item, id: product.id, product_code: product.product_code, name: product.name, price: product.price } : item
    );
    setRequestItems(updatedItems);
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = '';
    setSearchTerms(updatedSearchTerms);
    const updatedSuggestions = [...productSuggestions];
    updatedSuggestions[index] = [];
    setProductSuggestions(updatedSuggestions);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    setRequestItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: field === 'quantity' ? Number(value) : value } : item))
    );
  };

  const addRequestItem = () => {
    setRequestItems([...requestItems, { product_code: '', name: '', quantity: 0 }]);
    setSearchTerms([...searchTerms, '']);
    setProductSuggestions([...productSuggestions, []]);
  };

  const removeRequestItem = (index: number) => {
    if (requestItems.length === 1) return;
    setRequestItems((prev) => prev.filter((_, i) => i !== index));
    setSearchTerms((prev) => prev.filter((_, i) => i !== index));
    setProductSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const submitStockRequest = async () => {
    setIsSubmitting(true);
    const payload = { branch_id: auth.user.name, date, items: requestItems };
    try {
      const response = await apiService.post('/add-stock-request', payload);
      if (response.data.success) {
        alert('Stock request submitted successfully!');
        onClose();
        resetForm();
      } else {
        setError('Failed to submit stock request.');
      }
    } catch (error) {
      console.error('Error submitting stock request:', error);
      setError('An error occurred while submitting the stock request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestItems([{ product_code: '', name: '', quantity: 0 }]);
    setDate('');
    setSearchTerms(['']);
    setProductSuggestions([[]]);
    setError(null);
  };

  return (
    <>
      <Head title="Stock Request" />
      <div className="modal-backdrop">
        <div className="modal modal-lg">
          {/* Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={16} />
              <h3 className="modal-title">Request Stock</h3>
            </div>
            <button className="modal-close" onClick={() => { onClose(); resetForm(); }}>
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Items List */}
            <div className="items-container">
              {requestItems.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="form-group" style={{ flex: '0 0 120px' }}>
                    <label className="form-label">Product Code</label>
                    <input
                      type="text"
                      value={item.product_code}
                      className="form-control"
                      readOnly
                      placeholder="—"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, position: 'relative' }}>
                    <label className="form-label">Item Name</label>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleSearchTermChange(index, e.target.value)}
                        className="form-control"
                        placeholder="Search item..."
                        style={{ paddingLeft: '28px' }}
                      />
                    </div>
                    {productSuggestions[index] && productSuggestions[index].length > 0 && (
                      <ul className="suggestions-list">
                        {productSuggestions[index].map((product) => (
                          <li
                            key={product.id}
                            onClick={() => handleSuggestionClick(index, product)}
                          >
                            <span className="code">{product.product_code}</span>
                            <span>{product.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="form-group" style={{ flex: '0 0 100px' }}>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="form-control"
                      min="1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRequestItem(index)}
                    className="btn btn-icon btn-danger"
                    style={{ marginTop: '1.25rem' }}
                    disabled={requestItems.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addRequestItem} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <span style={{ fontSize: '0.75rem', color: '#6B7280', marginRight: 'auto' }}>
              {requestItems.length} item{requestItems.length !== 1 ? 's' : ''}
            </span>
            <button onClick={() => { onClose(); resetForm(); }} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={submitStockRequest} className="btn btn-success" disabled={isSubmitting}>
              <Send size={14} />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
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
        .alert {
          padding: 0.5rem 0.75rem;
          border-radius: 3px;
          font-size: 0.8125rem;
          margin-bottom: 0.75rem;
        }
        .alert-danger {
          background: #FEE2E2;
          border: 1px solid #FECACA;
          color: #991B1B;
        }
        .items-container {
          max-height: 300px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .item-row {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.75rem;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        .form-group { margin-bottom: 0; }
        .form-label {
          display: block;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .form-control {
          width: 100%;
          padding: 0.375rem 0.5rem;
          font-size: 0.8125rem;
          border: 1px solid #D1D5DB;
          border-radius: 3px;
          background: #FFFFFF;
          color: #374151;
          font-family: inherit;
        }
        .form-control:focus {
          outline: none;
          border-color: #0F766E;
          box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
        }
        .form-control:read-only {
          background: #F3F4F6;
          color: #6B7280;
        }
        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #D1D5DB;
          border-radius: 3px;
          max-height: 150px;
          overflow-y: auto;
          z-index: 10;
          list-style: none;
          padding: 0;
          margin: 2px 0 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .suggestions-list li {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.8125rem;
        }
        .suggestions-list li:hover { background: #F3F4F6; }
        .code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6875rem;
          background: #E5E7EB;
          padding: 0.125rem 0.375rem;
          border-radius: 2px;
          color: #374151;
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
        .btn-icon {
          width: 28px;
          height: 28px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
        .btn-success:disabled {
          background: #9CA3AF;
          border-color: #9CA3AF;
          cursor: not-allowed;
        }
        .btn-danger {
          background: #DC2626;
          color: white;
          border-color: #B91C1C;
        }
        .btn-danger:hover { background: #B91C1C; }
        .btn-danger:disabled {
          background: #F3F4F6;
          color: #9CA3AF;
          border-color: #D1D5DB;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default StockRequestModal;
