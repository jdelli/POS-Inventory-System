import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import { X, Package, Plus, Trash2, Send, Search, Building2 } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  product_code: string;
}

interface Item {
  product_code: string;
  name: string;
  price: number;
  quantity: number;
  id?: number;
}

interface AddStockModalProps {
  showModal: boolean;
  closeModal: () => void;
  onSuccess: () => void;
}

interface User {
  name: string;
}

const AddStocks: React.FC<AddStockModalProps> = ({ showModal, closeModal, onSuccess }) => {
  const { auth } = usePage().props as { auth: { user: User } };
  const [receiptItems, setReceiptItems] = useState<Item[]>([{ product_code: "", name: '', price: 0, quantity: 0 }]);
  const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [selectedBranchName, setSelectedBranchName] = useState<string>('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [date, setDate] = useState('');
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiService.get('/get-branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const closeAddStocksModal = () => {
    closeModal();
    setReceiptItems([{ product_code: "", name: '', price: 0, quantity: 0 }]);
    setProductSuggestions([]);
    setSearchTerms(['']);
    setDeliveryNumber('');
    setDeliveredBy('');
    setDate('');
    setSelectedBranchName('');
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index ? { ...item, [field]: field === 'price' || field === 'quantity' ? Number(value) : value } : item
    );
    setReceiptItems(updatedItems);
  };

  const addReceiptItem = () => {
    setReceiptItems([...receiptItems, { product_code: "", name: '', price: 0, quantity: 0 }]);
    setProductSuggestions([...productSuggestions, []]);
    setSearchTerms([...searchTerms, '']);
  };

  const removeReceiptItem = (index: number) => {
    if (receiptItems.length === 1) return;
    setReceiptItems((prevItems) => prevItems.filter((_, i) => i !== index));
    setProductSuggestions((prev) => prev.filter((_, i) => i !== index));
    setSearchTerms((prev) => prev.filter((_, i) => i !== index));
  };

  const submitAddStocks = async () => {
    try {
      if (!deliveryNumber || !deliveredBy || !date || receiptItems.length === 0 || !selectedBranchName) {
        alert("Please fill in all required fields.");
        return;
      }
      setIsSubmitting(true);
      for (const item of receiptItems) {
        const payload = {
          product_code: item.product_code,
          delivery_number: deliveryNumber,
          delivered_by: deliveredBy,
          date: date,
          distribution: [{ branch_id: selectedBranchName, quantity: item.quantity }],
        };
        const response = await apiService.post('/distribute-stocks', payload);
        if (response.status !== 200) {
          throw new Error(response.data.message || 'Error distributing stock.');
        }
      }
      alert('Stocks distributed successfully!');
      closeAddStocksModal();
      onSuccess();
    } catch (error) {
      console.error('Error distributing stocks:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    searchTerms.forEach((term, index) => {
      if (term.length > 0) {
        apiService
          .get('/search-products', { params: { q: term, user_name: "warehouse" } })
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
  }, [searchTerms, auth]);

  const handleSearchTermChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleItemChange(index, 'name', value);
  };

  const handleSuggestionClick = (index: number, product: InventoryItem) => {
    const updatedItems = receiptItems.map((item, i) =>
      i === index ? { ...item, id: product.id, name: product.name, price: product.price, product_code: product.product_code } : item
    );
    setReceiptItems(updatedItems);
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = '';
    setSearchTerms(updatedSearchTerms);
    const updatedSuggestions = [...productSuggestions];
    updatedSuggestions[index] = [];
    setProductSuggestions(updatedSuggestions);
  };

  const calculateTotal = () => {
    return receiptItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!showModal) return null;

  return (
    <>
      <Head title="Add Stocks" />
      <div className="modal-backdrop">
        <div className="modal modal-lg">
          {/* Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={16} />
              <h3 className="modal-title">Distribute Stocks</h3>
            </div>
            <button className="modal-close" onClick={closeAddStocksModal}>
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Delivery Info */}
            <div className="info-grid">
              <div className="form-group">
                <label className="form-label">
                  <Building2 size={12} style={{ marginRight: '4px' }} />
                  Select Branch *
                </label>
                <select
                  value={selectedBranchName || ''}
                  onChange={(e) => setSelectedBranchName(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="" disabled>Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Number *</label>
                <input
                  type="text"
                  value={deliveryNumber}
                  onChange={(e) => setDeliveryNumber(e.target.value)}
                  className="form-control"
                  placeholder="DR-00000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Delivered By *</label>
                <input
                  type="text"
                  value={deliveredBy}
                  onChange={(e) => setDeliveredBy(e.target.value)}
                  className="form-control"
                  placeholder="Name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="section-header">
              <span>Items to Distribute</span>
            </div>

            <div className="items-container">
              {receiptItems.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="form-group" style={{ flex: '0 0 100px' }}>
                    <label className="form-label">Code</label>
                    <input
                      type="text"
                      value={item.product_code}
                      className="form-control"
                      readOnly
                      placeholder="—"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, position: 'relative' }}>
                    <label className="form-label">Product Name</label>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleSearchTermChange(index, e.target.value)}
                        className="form-control"
                        placeholder="Search..."
                        style={{ paddingLeft: '28px' }}
                      />
                    </div>
                    {productSuggestions[index]?.length > 0 && (
                      <ul className="suggestions-list">
                        {productSuggestions[index].map((product) => (
                          <li key={product.id} onClick={() => handleSuggestionClick(index, product)}>
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
                    onClick={() => removeReceiptItem(index)}
                    className="btn btn-icon btn-danger"
                    style={{ marginTop: '1.25rem' }}
                    disabled={receiptItems.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addReceiptItem} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
              <Plus size={14} /> Add Item
            </button>

            {/* Total */}
            <div className="total-row">
              <span>Total Amount:</span>
              <strong>{formatCurrency(calculateTotal())}</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <span style={{ fontSize: '0.75rem', color: '#6B7280', marginRight: 'auto' }}>
              {receiptItems.length} item{receiptItems.length !== 1 ? 's' : ''}
            </span>
            <button onClick={closeAddStocksModal} className="btn btn-secondary">Cancel</button>
            <button onClick={submitAddStocks} className="btn btn-success" disabled={isSubmitting}>
              <Send size={14} />
              {isSubmitting ? 'Submitting...' : 'Submit'}
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
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
        }
        .modal-lg { width: 750px; max-width: 95vw; }
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
          max-height: calc(90vh - 110px);
        }
        .modal-footer {
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-top: 1px solid #D1D5DB;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .info-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .section-header {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6B7280;
          padding: 0.5rem 0;
          border-bottom: 1px solid #E5E7EB;
          margin-bottom: 0.75rem;
        }
        .items-container {
          max-height: 250px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .item-row {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          padding: 0.75rem;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        .form-group { margin-bottom: 0; }
        .form-label {
          display: flex;
          align-items: center;
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
          border-color: #1D4ED8;
          box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.15);
        }
        .form-control:read-only {
          background: #F3F4F6;
          color: #6B7280;
        }
        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.375rem center;
          background-repeat: no-repeat;
          background-size: 1.25rem 1.25rem;
          padding-right: 1.75rem;
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
        .total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          padding: 0.75rem;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 4px;
          color: #166534;
        }
        .total-row strong { font-size: 1.125rem; }
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

export default AddStocks;
