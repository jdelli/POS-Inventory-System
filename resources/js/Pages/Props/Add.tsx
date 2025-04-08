import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
  const [quantity, setQuantity] = useState<number | string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string>('');
  const [productCode, setProductCode] = useState<string>('');

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

    if (Number(price) <= 0) {
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
    formData.append('product_code', productCode);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('category', category);
    formData.append('image', image);
    formData.append('branch_id', "warehouse");  // Ensure this matches the backend expectations

    try {
      // Add new product
      const response = await apiService.post('/add-products', formData, {
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
    setQuantity('');
    setImage(null);
    setImagePreview(null);
  };

  return (
    <Modal open={showModal} onClose={closeModal}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: 400, 
        bgcolor: 'background.paper', 
        border: '2px solid #000', 
        boxShadow: 24, 
        p: 4 
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add Product</Typography>
          <IconButton onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit}>
          {error && <Typography color="error">{error}</Typography>}
          
          <TextField
            label="Product Code"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">Select a category</MenuItem>
              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            
            <input type="file" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Image Preview" style={{ marginTop: '10px', maxHeight: '100px' }} />}
          </FormControl>
          <Box display="flex" justifyContent="flex-end" marginTop={2}>
            <Button onClick={closeModal} color="secondary" sx={{ marginRight: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Add Product'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddProductModal;