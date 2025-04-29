import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import apiService from '../Services/ApiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import echo from '../echo';

// Attach Pusher to the window object globally
(window as any).Pusher = Pusher;

interface SalesData {
    branch_id: number;
    total_sales: number;
}

interface ProductSalesData {
    product_name: string;
    total_quantity: number;
}

interface Branch {
    id: number;
    name: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T[];
}

interface User {
    id: number;
    name: string;
    usertype: string;
    status: boolean; // Reflects online/offline status
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
    const [yearlySalesData, setYearlySalesData] = useState<SalesData[]>([]);
    const [yearlyChartData, setYearlyChartData] = useState<{ name: string; sales: number }[]>([]);
    const [dailySales, setDailySales] = useState<SalesData[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectYear, setSelectYear] = useState<number>(new Date().getFullYear());
    const [users, setUsers] = useState<User[]>([]);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    


    // Helper function to format the date as YYYY-MM-DD
    const formatDateWithoutTimezone = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    // Helper function to format currency as ₱100,000 without decimals
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0, // No minimum decimal places
            maximumFractionDigits: 0, // No maximum decimal places
        }).format(amount);
    };





    // Echo listener
    useEffect(() => {
        const channel = echo.channel('daily-sales');

        channel.listen('.new-sales-update', (event: { date: string; branchId: number }) => {
            console.log('Daily sales updated:', event);

            if (formatDateWithoutTimezone(selectedDate as Date) === event.date) {
                setReloadTrigger(prev => prev + 1);  // 👈 Trigger a re-fetch
            }
        });

        return () => {
            echo.leave('daily-sales');
        };
    }, [selectedDate]);
    




    // Fetch yearly sales data by branch
    useEffect(() => {
        const fetchYearlySalesByBranch = async () => {
            try {
                const response = await apiService.get<ApiResponse<SalesData>>('/sales-by-branch', {
                    params: { year: selectYear },
                });
                if (response.data.success) {
                    setYearlySalesData(response.data.data);
                    setYearlyChartData(
                        response.data.data.map((item) => ({
                            name: `Branch ${item.branch_id}`,
                            sales: item.total_sales,
                        }))
                    );
                }
            } catch (error) {
                console.error('Error fetching yearly sales data:', error);
            }
        };
        fetchYearlySalesByBranch();
    }, [selectYear]);
    

        // Fetch daily sales data
        const fetchDataDailySales = async () => {
            if (!selectedDate) return;
            try {
                const formattedDate = formatDateWithoutTimezone(selectedDate);
                console.log('Fetching data for date:', formattedDate);

                const response = await apiService.get<ApiResponse<SalesData>>('/daily-sales-by-branch', {
                    params: { date: formattedDate },
                });

                if (response.data.success) {
                    setDailySales(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching daily sales data:', error);
            }
        };

        // Fetch when either selectedDate or reloadTrigger changes
        useEffect(() => {
            fetchDataDailySales();
        }, [selectedDate, reloadTrigger]);  // 👈 Added reloadTrigger




    // Initialize Pusher and listen for user status updates
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();

                const usersWithStatus = data.map((user: any) => ({
                    ...user,
                    status: user.is_online, // Use backend value instead of setting false
                }));

                setUsers(usersWithStatus);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();


        echo.channel('user-status').listen('.UserStatusUpdated', (data: any) => {
            setUsers((prev) => {
                const updatedUsers = prev.map((user) =>
                    user.id === data.userId ? { ...user, status: data.status } : user
                );
                return updatedUsers;
            });
        });

        // Cleanup Pusher on component unmount
        return () => echo.disconnect();
    }, []);

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '2rem', px: 4 }}>
                {/* Main Dashboard Content */}
                <Box sx={{ flexGrow: 1 }}>
                    {/* Cards Section */}
                    <Box
                        sx={{
                            background: 'white',
                            boxShadow: 3,
                            borderRadius: 2,
                            p: 6,
                            transition: 'box-shadow 0.3s',
                            '&:hover': { boxShadow: 5 },
                            mt: 6,
                            border: '2px solid white',
                        }}
                    >
                        {/* Date Picker for Daily Sales */}
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="body1" sx={{ color: 'gray.700', fontWeight: 'bold', mb: 2 }}>
                                Select Date:
                            </Typography>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                className="border border-gray-300 p-2 rounded"
                            />
                        </Box>
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                            gap: 6, 
                            mt: 4 
                        }}>
                            {dailySales.map((branch) => {
                                const salesAmount = branch.total_sales || 0; // Default to 0 if no sales data exists

                                return (
                                    <Box
                                        key={branch.branch_id}
                                        sx={{
                                            background: 'linear-gradient(to right, #4CAF50, #388E3C)',
                                            color: '#121212',
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                            borderRadius: 3,
                                            p: 4,
                                            textAlign: 'center',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.03)',
                                                boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.3)',
                                            },
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {/* Branch Name */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 'bold',
                                                mb: 2,
                                                color: '#FFFFFF',
                                            }}
                                        >
                                            {branch.branch_id}
                                        </Typography>

                                        {/* Sales Amount */}
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontWeight: 'bold',
                                                mb: 2,
                                                color: '#FFFFFF',
                                            }}
                                        >
                                            {formatCurrency(salesAmount)} {/* Format the sales amount */}
                                        </Typography>

                                        {/* Sales Status */}
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: salesAmount > 0 ? '#FFFFFF' : '#FF9800',
                                                fontWeight: salesAmount > 0 ? 'normal' : 'bold',
                                            }}
                                        >
                                            {salesAmount > 0 ? "Today's Sales" : 'No Sales Today'}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Daily Sales Section */}
                    <Box
                        sx={{
                            background: 'white',
                            boxShadow: 3,
                            borderRadius: 2,
                            p: 6,
                            mt: 6,
                            border: '2px solid white',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Daily Sales
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={dailySales.map((item) => ({ name: `Branch ${item.branch_id}`, sales: item.total_sales }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                {/* Updated Tooltip to use formatCurrency */}
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="sales" fill="url(#colorDaily)" barSize={40} />
                                <defs>
                                    <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFA726" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#FFA726" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                                        {/* Year Picker and Yearly Sales Section */}
                    <Box
                        sx={{
                            background: 'white',
                            boxShadow: 3,
                            borderRadius: 2,
                            p: 6,
                            mt: 6,
                            border: '2px solid white',
                        }}
                    >
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="body1" sx={{ color: 'gray.700', fontWeight: 'bold', mb: 2 }}>
                                Select Year:
                            </Typography>
                            <DatePicker
                                selected={new Date(selectYear, 0)}
                                onChange={(date) => setSelectYear(date ? date.getFullYear() : new Date().getFullYear())}
                                showYearPicker
                                dateFormat="yyyy"
                                className="border border-gray-300 p-2 rounded"
                            />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Accumulative Sales by Branch
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={yearlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                {/* Updated Tooltip to use formatCurrency */}
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="sales" fill="url(#colorUv)" barSize={40} />
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                    
                </Box>

                {/* User Status Section */}
                <Box sx={{ width: '300px', background: 'white', boxShadow: 3, borderRadius: 2, p: 4, mt: 6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Branch Status
                    </Typography>
                    {users.length === 0 ? (
                        <Typography variant="body1">No user status yet</Typography>
                    ) : (
                        <List>
                            {users.map((user) => (
                                <ListItem key={user.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ListItemText primary={user.name} />
                                    <Chip
                                        label={user.status ? 'Online' : 'Offline'}
                                        color={user.status ? 'success' : 'error'}
                                        size="small"
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        </AdminLayout>
    );
}