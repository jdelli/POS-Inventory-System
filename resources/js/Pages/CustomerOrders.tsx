import React, { useState, useEffect } from 'react';
import apiService from './Services/ApiService';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button, Card, CardContent, Typography, Box,
  Dialog,
   DialogActions,
    DialogContent,
     DialogTitle,
     Table, TableBody,
      TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel
 } from '@mui/material';

interface Order {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  branch: string;
  created_at: string;
  updated_at: string;
  orders: Order[];
}

interface Auth {
  user: {
    name: string;
  };
}

interface Branch {
  id: number;
  name: string;
}



interface InventoryManagementProps {
  auth: Auth;
}


const CustomerOrders: React.FC<InventoryManagementProps> = ({ auth }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [doneCustomers, setDoneCustomers] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null); // Fix duplicated state
  const [branches, setBranches] = useState<Branch[]>([]);

  // Fetch branches
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

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/orders', {
        params: { username: auth.user.name },
      });
      if (response.data.success) {
        setCustomers(response.data.customers);
      } else {
        throw new Error('Failed to fetch customers.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const markAsDone = async (customerId: number) => {
    try {
      const response = await apiService.put(`/update-status/${customerId}`);
      if (response.data.success) {
        setDoneCustomers((prev) => [...prev, customerId]);
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating customer order status:', error);
      alert('An error occurred while updating the status.');
    }
    fetchCustomers();
  };

  const updateBranch = async (customerId: number, branch: string) => {
    try {
      const response = await apiService.put(`/update-branch/${customerId}`, { branch });
      if (response.data.success) {
        alert('Branch updated successfully!');
        fetchCustomers();
      } else {
        throw new Error(response.data.message || 'Failed to update branch.');
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      alert('An error occurred while updating the branch.');
    }
  };

  const openModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedBranch(customer.branch);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };


  
  if (error)
    return (
      <div className="flex flex-col items-center p-6">
        <p className="text-red-500 font-bold">{error}</p>
        <button
          onClick={fetchCustomers}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );

  return (
    <AuthenticatedLayout
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Customer Orders
        </h2>
      }
    >
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Box>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <Card
                key={customer.id}
                sx={{
                  backgroundColor: 'white',
                  boxShadow: 3,
                  borderRadius: 2,
                  mb: 2,
                  border: doneCustomers.includes(customer.id) ? '2px solid green' : '1px solid #e0e0e0',
                  '&:hover': { boxShadow: 6 },
                  transition: 'box-shadow 0.3s',
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {customer.name}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" mb={1}>
                    <strong>Phone:</strong> {customer.phone}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>Address:</strong> {customer.address}
                  </Typography>

                  <Button
                    onClick={() => openModal(customer)}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    View Orders
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No customers found.
            </Typography>
          )}
        </Box>


        {isModalOpen && selectedCustomer && (
  <Dialog open={isModalOpen} onClose={closeModal} maxWidth="lg" fullWidth>
    <DialogTitle>
      Orders for {selectedCustomer.name}
      <Button
        onClick={closeModal}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'red',
        }}
      >
        &times;
      </Button>
    </DialogTitle>
    <DialogContent>
      {selectedCustomer.orders.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCustomer.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>{order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No orders found for this customer.
        </Typography>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <Typography variant="h6" fontWeight="bold">
          Total:
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {selectedCustomer.orders
            .reduce((sum, order) => sum + (Number(order.total) || 0), 0)
            .toFixed(2)}
        </Typography>
      </div>

      <FormControl variant="outlined" sx={{ marginTop: 2 }}>
        <InputLabel>Forward to</InputLabel>
        <Select
          value={selectedBranch || ''}
          onChange={(e) => setSelectedBranch(e.target.value)}
          label="Forward to"
        >
          <MenuItem value="" disabled>
            Forward to
          </MenuItem>
          {branches.map((branch) => (
            <MenuItem key={branch.id} value={branch.name}>
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        onClick={() => {
          if (selectedBranch) {
            updateBranch(selectedCustomer.id, selectedBranch);
            setIsModalOpen(false);
          } else {
            alert('Please select a valid branch before updating.');
          }
        }}
        
        variant="contained"
        color="primary"
        sx={{ marginTop: 3 }}
      >
        Update Branch
      </Button>
    </DialogContent>

    <DialogActions>
      <Button
        onClick={() => markAsDone(selectedCustomer.id)}
        variant="contained"
        color="success"
      >
        Done
      </Button>
      <Button onClick={closeModal} variant="contained">
        Close
      </Button>
    </DialogActions>
  </Dialog>
)}
      </div>
    </AuthenticatedLayout>
  );
};

export default CustomerOrders;
