import React, { useState, useEffect } from 'react';
import apiService from '../Services/ApiService';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface AddProductModalProps {
  showModal: boolean;
  closeModal: () => void;
  refreshProducts: () => void;
  auth: { name: string };  // Ensure this matches your auth structure
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

const AddProductModal: React.FC<AddProductModalProps> = ({ showModal, closeModal, refreshProducts, auth }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string>('');

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

    if (Number(price) <= 0 || Number(quantity) <= 0) {
      setError('Price and quantity must be greater than 0.');
      setLoading(false);
      return;
    }

    if (!image) {
      setError('Image file is required.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('quantity', quantity.toString());
    formData.append('category', category);
    formData.append('image', image);
    formData.append('branch_id', selectedBranchName);  // Ensure this matches the backend expectations

    try {
      // Add new product
      const response = await apiService.post('/add-products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetForm();
      closeModal();
      refreshProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setQuantity('');
    setImage(null);
    setImagePreview(null);
  };

  return (
    showModal ? (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Add Product</h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500">{error}</p>}
            <div className="mb-4">
              <label className="block mb-1">Branch</label>
              <select
                value={selectedBranchName || ''}
                onChange={(e) => setSelectedBranchName(e.target.value)}
                className="border rounded-md py-2 px-3 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Select Branch"
              >
                <option value="" disabled>
                  Select Branch
                </option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
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
            <div className="mb-4">
              <label className="block mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border rounded w-full p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Image</label>
              <input type="file" onChange={handleImageChange} className="border rounded w-full p-2" />
              {imagePreview && <img src={imagePreview} alt="Image Preview" className="mt-2" />}
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
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null
  );
};

export default AddProductModal;