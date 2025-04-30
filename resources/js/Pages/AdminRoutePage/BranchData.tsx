import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import apiService from '../Services/ApiService';
import { MenuItem, Select, Box, Typography, Button } from '@mui/material';

interface SalesData {
    month: string;
    sales: number;
}

interface Branch {
    id: number;
    name: string;
}

interface User {
    name: string;
}

interface ProductSalesData {
    product_name: string;
    total_quantity: number;
}

const AdminMonthlySalesDashboard: React.FC = () => {
    const { auth } = usePage().props as { auth: { user: User } };
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [totalSales, setTotalSales] = useState<number>(0);
    const [salesTarget, setSalesTarget] = useState<number>(0);
    const [totalSalesOrders, setTotalSalesOrders] = useState<number | null>(null);
    const [totalSalesToday, setTotalSalesToday] = useState<number | null>(null);
    const [dailySalesAmount, setDailySalesAmount] = useState<number | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const monthlyTarget = salesTarget / 12;
    const COLORS = ['#1E90FF', '#FF6347'];
    const [productSalesData, setProductSalesData] = useState<ProductSalesData[]>([]);

       // ➕ NEW STATE FOR SALES TARGET MODAL
       const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
       const [modalTargetSales, setModalTargetSales] = useState<number>(0);



    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

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

    // Fetch product sales data
    useEffect(() => {
        const fetchProductSalesData = async () => {
            if (!selectedBranch) return;
            try {
                const response = await apiService.get('/most-sold-product', {
                    params: { branch_id: selectedBranch },
                });
                if (response.data.success && response.data.data.length > 0) {
                    setProductSalesData(response.data.data);
                } else {
                    setProductSalesData([]); // Ensure empty state is handled
                }
            } catch (error) {
                console.error('Error fetching product sales data:', error);
            }
        };
        fetchProductSalesData();
    }, [selectedBranch]);

    // Fetch all sales data based on selected branch
    useEffect(() => {
        if (!selectedBranch) return;

        apiService.get<{ success: boolean; data: number }>('/get-sales-target', {
            params: { user_name: selectedBranch },
        })
            .then((response) => {
                if (response.data.success) {
                    setSalesTarget(response.data.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching sales target:', error);
            });

        apiService.get<{ success: boolean; data: SalesData[] }>('/get-monthly-sales', {
            params: { user_name: selectedBranch },
        })
            .then((response) => {
                const data = response.data.data;
                if (Array.isArray(data)) {
                    setSalesData(data);
                    setTotalSales(data.reduce((acc, item) => acc + item.sales, 0));
                }
            })
            .catch((error) => {
                console.error('Error fetching monthly sales:', error);
            });

        apiService.get<{ success: boolean; data: number }>('/get-total-clients', {
            params: { user_name: selectedBranch },
        })
            .then((response) => {
                if (response.data.success) {
                    setTotalSalesOrders(response.data.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching total sales orders:', error);
            });

        apiService.get<{ success: boolean; data: number }>('/get-total-daily-sales-orders', {
            params: { user_name: selectedBranch },
        })
            .then((response) => {
                if (response.data.success) {
                    setTotalSalesToday(response.data.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching daily sales orders:', error);
            });

        apiService.get<{ success: boolean; data: number }>('/get-total-daily-sales', {
            params: { user_name: selectedBranch },
        })
            .then((response) => {
                if (response.data.success) {
                    setDailySalesAmount(response.data.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching daily sales amount:', error);
            });
    }, [selectedBranch]);

    // Data for pie chart
    const totalSalesData = [
        { name: 'Total Sales', value: totalSales },
        { name: 'Remaining', value: Math.max(0, salesTarget - totalSales) },
    ];

    const monthlySalesWithTarget = salesData.map((data) => ({
        ...data,
        target: monthlyTarget,
    }));

    // ➕ HANDLE SAVING THE TARGET TO SERVER
    const handleSaveTarget = async () => {
        if (!selectedBranch || !modalTargetSales) return;

        try {
            await apiService.post('/sales-target', {
                branch_id: selectedBranch,
                target_sales: modalTargetSales,
            });

            setSalesTarget(modalTargetSales); // Update UI
            setIsTargetModalOpen(false);
        } catch (error) {
            alert('Failed to save sales target.');
            console.error('Error saving sales target:', error);
        }
    };

    return (
       <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Branch Data</h2>}>
            <Head title="Admin Dashboard" />
            <div className="py-12 bg-gray-100 overflow-y-auto max-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Branch Selector */}
                    <div className="mb-6">
                        <Select
                            value={selectedBranch || ''}
                            onChange={(e) => setSelectedBranch(e.target.value as string)}
                            displayEmpty
                            variant="outlined"
                            fullWidth
                            aria-label="Select Branch"
                        >
                            <MenuItem value="" disabled>Select Branch</MenuItem>
                            {branches.map((branch) => (
                                <MenuItem key={branch.id} value={branch.name}>
                                    {branch.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>

                    {selectedBranch && (
                        <>
                            {/* Total Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white shadow-lg rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-2">Total Sales Orders:</h3>
                                    <p className="text-3xl font-semibold text-blue-600">
                                        {totalSalesOrders !== null ? totalSalesOrders : 'Loading...'}
                                    </p>
                                </div>
                                <div className="bg-white shadow-lg rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-2">Sales Orders Today:</h3>
                                    <p className="text-3xl font-semibold text-blue-600">
                                        {totalSalesToday !== null ? totalSalesToday : 'Loading...'}
                                    </p>
                                </div>
                                <div className="bg-white shadow-lg rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-2">Daily Sales:</h3>
                                    <p className="text-3xl font-semibold text-blue-600">
                                        {dailySalesAmount !== null
                                            ? formatCurrency(dailySalesAmount)
                                            : 'Loading...'}
                                    </p>
                                </div>
                            </div>
                            {/* Button to Open Target Modal */}
                            <div className="mb-6">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        setModalTargetSales(salesTarget);
                                        setIsTargetModalOpen(true);
                                    }}
                                >
                                    Set/Edit Sales Target
                                </Button>
                            </div>

                            {/* Monthly Sales vs Target Chart */}
                            <div className="bg-white shadow-lg rounded-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">Monthly Sales Target vs. Actual</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlySalesWithTarget}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar
                                            dataKey="sales"
                                            fill="#1E90FF"
                                            name="Actual Sales"
                                           
                                        />
                                        <Bar dataKey="target" fill="#FF6347" name="Sales Target" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Rest of the charts */}
                            <div className="flex flex-col lg:flex-row lg:space-x-4 mt-8">
                                <div className="bg-white shadow-lg rounded-lg p-6 flex-1">
                                    <h3 className="text-xl font-semibold mb-4">Monthly Sales Performance</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Line type="monotone" dataKey="sales" stroke="#1E90FF" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-white shadow-lg rounded-lg p-6 flex-1">
                                    <h3 className="text-xl font-semibold mb-4">Yearly Sales Target Status</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={totalSalesData} dataKey="value" nameKey="name" outerRadius={100} label>
                                                {totalSalesData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="text-center mt-4 font-semibold">
                                        Yearly Total Sales: {formatCurrency(totalSales)}
                                    </div>
                                    <div className={`text-center mt-2 ${totalSales >= salesTarget ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                                        {totalSales >= salesTarget
                                            ? 'Fantastic! You have met or exceeded the sales target!'
                                            : `You need ${formatCurrency(salesTarget - totalSales)} more to meet your sales target.`}
                                    </div>
                                </div>
                            </div>

                            {/* Mostly Sold Products Chart */}
                            <Box sx={{ background: 'white', boxShadow: 3, borderRadius: 2, p: 6, mt: 6, border: '2px solid white' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Mostly Sold Products</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={productSalesData}
                                            dataKey="total_amount"
                                            nameKey="product_name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        >
                                            {productSalesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </>
                    )}
                </div>

                {/* ➕ Sales Target Modal */}
                {isTargetModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                            <h3 className="text-xl font-semibold mb-4">
                                Set Sales Target for {selectedBranch}
                            </h3>

                            {/* Formatted Editable Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Sales (PHP)
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatCurrency(modalTargetSales)}
                                    onChange={(e) => {
                                        // Remove everything except digits
                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                        const parsedValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
                                        setModalTargetSales(parsedValue);
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="₱1,000,000"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsTargetModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTarget}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Target
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminMonthlySalesDashboard;