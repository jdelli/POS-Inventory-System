import React, { useState, useEffect } from 'react';
import apiService from '../Services/ApiService';

interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  quantity: number;
}

interface EditProductModalProps {
  showModal: boolean;
  closeModal: () => void;
  editProduct: Product | null;
  onUpdate: (updatedProduct: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ showModal, closeModal, editProduct, onUpdate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description || '');
      setCategory(editProduct.category);
      setPrice(editProduct.price);
      setQuantity(editProduct.quantity);
    }
  }, [editProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (Number(price) <= 0 || Number(quantity) <= 0) {
      setError('Price and quantity must be greater than 0.');
      setLoading(false);
      return;
    }

    const updatedProduct: Product = {
      id: editProduct?.id!,
      name,
      description,
      category,
      price: Number(price),
      quantity: Number(quantity),
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

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500">{error}</p>}
              <div className="mb-4">
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border rounded w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border rounded w-full p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border rounded w-full p-2"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border rounded w-full p-2"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProductModal;
