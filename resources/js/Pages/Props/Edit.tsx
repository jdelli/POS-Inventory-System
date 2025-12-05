import React, { useState, useEffect } from 'react';
import { X, Package, Save } from 'lucide-react';
import apiService from '../Services/ApiService';

interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
}

interface EditProductModalProps {
  showModal: boolean;
  closeModal: () => void;
  editProduct: Product | null;
  onUpdate: (updatedProduct: Product) => void;
}

const categoryOptions = [
  'Analog/IP Cameras',
  'WIFI Cameras',
  'DVR/NVR',
  'HDD',
  'Home Alarms',
  'Accessories',
  'Radios',
  'Biometrics',
];

const EditProductModal: React.FC<EditProductModalProps> = ({ showModal, closeModal, editProduct, onUpdate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description || '');
      setCategory(editProduct.category);
      setPrice(editProduct.price);
    }
  }, [editProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (Number(price) <= 0) {
      setError('Price must be greater than 0.');
      setLoading(false);
      return;
    }

    const updatedProduct: Product = {
      id: editProduct?.id!,
      name,
      description,
      category,
      price: Number(price),
    };

    try {
      const response = await apiService.put(`/edit-products/${editProduct?.id}`, updatedProduct);
      onUpdate(response.data.product);
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal modal-md">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} />
            <h3 className="modal-title">Edit Product</h3>
          </div>
          <button className="modal-close" onClick={closeModal} type="button">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                placeholder="Product name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                placeholder="Product description (optional)"
                rows={2}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control form-select"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₱) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="form-control"
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={14} />
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
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
        .modal-md { width: 450px; max-width: 95vw; }
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
          justify-content: flex-end;
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
        .form-group { margin-bottom: 0.75rem; }
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
          border-color: #1D4ED8;
          box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.15);
        }
        textarea.form-control { resize: vertical; min-height: 60px; }
        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.375rem center;
          background-repeat: no-repeat;
          background-size: 1.25rem 1.25rem;
          padding-right: 1.75rem;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
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
        .btn-primary {
          background: #1D4ED8;
          color: white;
          border-color: #1E40AF;
        }
        .btn-primary:hover { background: #1E40AF; }
        .btn-primary:disabled {
          background: #9CA3AF;
          border-color: #9CA3AF;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default EditProductModal;
