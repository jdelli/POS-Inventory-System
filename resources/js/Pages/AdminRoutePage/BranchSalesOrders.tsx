import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import Receipt from '../Props/Receipt';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Tooltip, Box, Typography } from '@mui/material';
import { Visibility, Delete,  } from '@mui/icons-material';
import TableContainer from '@mui/material/TableContainer';

// Interfaces
interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

interface Item {
    name: string;
    price: number;
    quantity: number;
    id: number;
}

interface SalesOrderItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
}

interface SalesOrder {
    id: number;
    customer_name: string;
    receipt_number: string;
    date: string;
    items: SalesOrderItem[];
    payment_method: string;
}

interface Auth {
    user: {
        name: string;
    };
}

interface InventoryManagementProps {
    auth: Auth;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ auth }) => {
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
    const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
    const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);

    // Fetch branches on mount
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

    const fetchSalesOrders = async (branchName: string, page = 1, limit = 20) => {
        if (!branchName) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.get('/admin-get-sales-orders', {
                params: { branch_name: branchName, page, limit, month: selectedMonth, year: selectedYear },
            });

            setFilteredOrders(response.data.data || []);
            setCurrentPage(response.data.current_page); // Update current page
            setTotalPages(response.data.last_page); // Update total pages
        } catch (error) {
            console.error('Error fetching sales orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedBranchName) {
            fetchSalesOrders(selectedBranchName, currentPage);
        }
    }, [selectedBranchName, currentPage, selectedMonth, selectedYear]);

    const closeReceiptModal = () => {
        setIsReceiptModalOpen(false);
        setSelectedOrder(null);
    };

    const viewOrderReceipt = (order: SalesOrder) => {
        setSelectedOrder(order);
        setIsReceiptModalOpen(true);
    };

    const handleDeleteReceipt = async (id: number) => {
        if (!confirm('Are you sure you want to delete this sales order?')) return;
        try {
            // Pass the branch_id as a query parameter
            await apiService.delete(`/delete-sales-order/${id}`, {
                params: { branch_id: selectedBranchName }, // Include the branch_id here
            });
            fetchSalesOrders(selectedBranchName || '', currentPage);
        } catch (error) {
            console.error('Error deleting sales order:', error);
        }
    };

    // Date formatting
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Order</h2>}>
            <Head title="Inventory" />
            <div className="p-4" style={{ overflowX: 'auto' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="w-full">
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Select Branch</InputLabel>
                            <Select
                                value={selectedBranchName || ''}
                                onChange={(e) => {
                                    setSelectedBranchName(e.target.value);
                                    setCurrentPage(1); // Reset to first page when branch changes
                                }}
                                label="Select Branch"
                                fullWidth
                            >
                                <MenuItem value="" disabled>Select Branch</MenuItem>
                                {branches.map((branch) => (
                                    <MenuItem key={branch.id} value={branch.name}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {/* Date Range Filters */}
                    <div className="w-full">
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Filter by Month</InputLabel>
                            <Select
                                value={selectedMonth ?? ''}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                label="Select Month"
                                fullWidth
                            >
                                <MenuItem value="" disabled>Select Month</MenuItem>
                                {[...Array(12).keys()].map((month) => (
                                    <MenuItem key={month} value={month + 1}>
                                        {new Date(2025, month).toLocaleString('default', { month: 'long' })}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div className="w-full">
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Filter by Year</InputLabel>
                            <Select
                                value={selectedYear ?? ''}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                label="Select Year"
                                fullWidth
                            >
                                <MenuItem value="" disabled>Select Year</MenuItem>
                                {[2022, 2023, 2024, 2025].map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>

                {/* Render orders */}
                <div className="overflow-x-auto mt-4">
                    <TableContainer component={Paper}>
                        <Table className="min-w-full" aria-label="receipt table">
                            <TableHead>
                                <TableRow className="bg-gray-100">
                                    <TableCell className="py-2 px-4 text-left">Receipt Number</TableCell>
                                    <TableCell className="py-2 px-4 text-left">Customer</TableCell>
                                    <TableCell className="py-2 px-4 text-left">Date</TableCell>
                                    <TableCell className="py-2 px-4 text-left">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-gray-50">
                                        <TableCell className="py-2 px-4">{order.receipt_number}</TableCell>
                                        <TableCell className="py-2 px-4">{order.customer_name}</TableCell>
                                        <TableCell className="py-2 px-4">{formatDate(order.date)}</TableCell>
                                        <TableCell className="py-2 px-4 flex space-x-2">
                                            <Tooltip title="View Receipt">
                                                <Button
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<Visibility />}
                                                    onClick={() => viewOrderReceipt(order)}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Delete Receipt">
                                                <Button
                                                    color="secondary"
                                                    size="small"
                                                    startIcon={<Delete />}
                                                    onClick={() => handleDeleteReceipt(order.id)}
                                                />
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="outlined"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Previous
                    </Button>

                    <Typography sx={{ mx: 2 }}>
                        Page {currentPage} of {totalPages}
                    </Typography>

                    <Button
                        variant="outlined"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </Button>
                </Box>

                {/* Receipt Modal */}
                {selectedOrder && (
                    <Receipt
                        isOpen={isReceiptModalOpen}
                        onClose={closeReceiptModal}
                        selectedOrder={selectedOrder}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default InventoryManagement;