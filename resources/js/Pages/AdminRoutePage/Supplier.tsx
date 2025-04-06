import { useState, useEffect } from "react";
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from "../Services/ApiService";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Tabs, Tab, Box } from "@mui/material";
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from "@mui/material";

interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
}

interface WarehouseStock {
  id: number;
  product: string;
  quantity: number;
  location: string;
}

const SalesSupplier = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: "", contact: "", address: "" });
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    fetchSuppliers();
    fetchWarehouseStocks();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.get("/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchWarehouseStocks = async () => {
    try {
      const response = await apiService.get("/warehouse-stocks");
      setWarehouseStocks(response.data);
    } catch (error) {
      console.error("Error fetching warehouse stocks:", error);
    }
  };

  const handleAddSupplier = async () => {
    try {
      await apiService.post("/suppliers", newSupplier);
      fetchSuppliers();
      setIsModalOpen(false);
      setNewSupplier({ name: "", contact: "", address: "" });
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <AdminLayout header={<Typography variant="h6">Supplier</Typography>}>
      <Head title="Supplier" />
      <Box p={3}>
      
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="basic tabs example" sx={{ mb: 3 }}>
          <Tab label="Sales Suppliers" />
          <Tab label="Warehouse Stocks" />
              <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)} className="align-self-end">
                Add Supplier
              </Button>
        </Tabs>
        {tabIndex === 0 && (
          <Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>{supplier.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
              <DialogTitle>Add Supplier</DialogTitle>
              <DialogContent>
                <Box mb={2}>
                  <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    label="Contact"
                    fullWidth
                    margin="normal"
                    value={newSupplier.contact}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    label="Address"
                    fullWidth
                    margin="normal"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsModalOpen(false)} color="secondary">
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier} color="primary">
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tabIndex === 1 && (
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {warehouseStocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.product}</TableCell>
                      <TableCell>{stock.quantity}</TableCell>
                      <TableCell>{stock.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </AdminLayout>
  );
};

export default SalesSupplier;
