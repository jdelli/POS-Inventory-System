import React, { useState, useEffect } from 'react';
import { X, Package, Upload, Image as ImageIcon } from 'lucide-react';
import apiService from '../Services/ApiService';

interface AddProductModalProps {
  showModal: boolean;
  closeModal: () => void;
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

const AddProductModal: React.FC<AddProductModalProps> = ({ showModal, closeModal }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [productCode, setProductCode] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (Number(price) <= 0) {
      setError('Price must be greater than 0.');
      setLoading(false);
      return;
    }

    if (!image) {
      setError('Image file is required.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('product_code', productCode);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('category', category);
    formData.append('image', image);
    formData.append('branch_id', "warehouse");

    try {
      await apiService.post('/add-products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetForm();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductCode('');
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setImage(null);
    setImagePreview(null);
    setError(null);
  };

  if (!showModal) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal modal-md">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} />
            <h3 className="modal-title">Add Product</h3>
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
              <label className="form-label">Product Code *</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="form-control"
                placeholder="e.g., CAM-001"
                required
              />
            </div>

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

            <div className="form-group">
              <label className="form-label">Product Image *</label>
              <div className="file-upload">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  id="product-image"
                  className="file-input"
                />
                <label htmlFor="product-image" className="file-label">
                  <Upload size={16} />
                  <span>{image ? image.name : 'Choose file...'}</span>
                </label>
              </div>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
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
        .file-upload {
          position: relative;
        }
        .file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
        }
        .file-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border: 1px dashed #D1D5DB;
          border-radius: 3px;
          background: #F9FAFB;
          cursor: pointer;
          font-size: 0.8125rem;
          color: #6B7280;
          transition: all 0.15s;
        }
        .file-label:hover {
          border-color: #1D4ED8;
          background: #EFF6FF;
        }
        .image-preview {
          margin-top: 0.75rem;
          padding: 0.5rem;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 3px;
          display: flex;
          justify-content: center;
        }
        .image-preview img {
          max-height: 100px;
          border-radius: 3px;
          object-fit: contain;
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

export default AddProductModal;
