import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    LineChart,
    Line,
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
    AreaChart,
    Area,
} from 'recharts';
import apiService from '../Services/ApiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pusher from 'pusher-js';
import { Package, AlertTriangle, Truck, DollarSign, TrendingUp, ChevronRight, MoreVertical } from 'lucide-react';
import echo from '../echo';

(window as any).Pusher = Pusher;

interface SalesData {
    branch_id: number;
    total_sales: number;
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
    status: boolean;
}

interface Product {
    id: number;
    name: string;
    quantity: number;
    minimum_stock?: number;
    warehouse?: string;
}

interface StockMovement {
    id: number;
    product_name: string;
    type: string;
    quantity: number;
    warehouse: string;
    created_at: string;
    handled_by?: string;
}

interface TopProduct {
    product_name: string;
    total_quantity: number;
}

export default function Dashboard() {
    const [yearlySalesData, setYearlySalesData] = useState<SalesData[]>([]);
    const [yearlyChartData, setYearlyChartData] = useState<{ name: string; sales: number }[]>([]);
    const [dailySales, setDailySales] = useState<SalesData[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectYear, setSelectYear] = useState<number>(new Date().getFullYear());
    const [users, setUsers] = useState<User[]>([]);
    const [reloadTrigger, setReloadTrigger] = useState(0);

    // New state for dashboard data
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [stockAlerts, setStockAlerts] = useState<number>(0);
    const [totalSuppliers, setTotalSuppliers] = useState<number>(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
    const [topSellingProducts, setTopSellingProducts] = useState<TopProduct[]>([]);
    const [recentStockMovements, setRecentStockMovements] = useState<StockMovement[]>([]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDateWithoutTimezone = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const channel = echo.channel('daily-sales');
        channel.listen('.new-sales-update', (event: { date: string; branchId: number }) => {
            if (formatDateWithoutTimezone(selectedDate as Date) === event.date) {
                setReloadTrigger(prev => prev + 1);
            }
        });
        return () => {
            echo.leave('daily-sales');
        };
    }, [selectedDate]);

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

    const fetchDataDailySales = async () => {
        if (!selectedDate) return;
        try {
            const formattedDate = formatDateWithoutTimezone(selectedDate);
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

    useEffect(() => {
        fetchDataDailySales();
    }, [selectedDate, reloadTrigger]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiService.get('/users');
                const usersWithStatus = response.data.map((user: any) => ({
                    ...user,
                    status: user.is_online,
                }));
                setUsers(usersWithStatus);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
        echo.channel('user-status').listen('.UserStatusUpdated', (data: any) => {
            setUsers((prev) => {
                return prev.map((user) =>
                    user.id === data.userId ? { ...user, status: data.status } : user
                );
            });
        });
        return () => echo.disconnect();
    }, []);

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                // Fetch total products
                const productsResponse = await apiService.get('/fetch-products-by-branch', {
                    params: { user_name: 'branch1' }
                });
                if (productsResponse.data.warehouse?.data) {
                    setTotalProducts(productsResponse.data.warehouse.total || productsResponse.data.warehouse.data.length);

                    // Calculate low stock items
                    const lowStock = productsResponse.data.warehouse.data.filter((product: any) =>
                        product.quantity < (product.minimum_stock || 30)
                    );
                    setLowStockItems(lowStock.slice(0, 4));
                    setStockAlerts(lowStock.length);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchDashboardStats();
    }, []);

    // Fetch monthly revenue
    useEffect(() => {
        const fetchMonthlyRevenue = async () => {
            try {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                const response = await apiService.get('/monthly-sales', {
                    params: { month: currentMonth, year: currentYear }
                });

                if (response.data.success) {
                    const total = response.data.data.reduce((sum: number, item: any) => sum + item.total_sales, 0);
                    setMonthlyRevenue(total);
                }
            } catch (error) {
                console.error('Error fetching monthly revenue:', error);
            }
        };

        fetchMonthlyRevenue();
    }, []);

    // Fetch top selling products
    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await apiService.get('/top-selling-products');
                if (response.data) {
                    setTopSellingProducts(response.data.slice(0, 4));
                }
            } catch (error) {
                console.error('Error fetching top products:', error);
            }
        };

        fetchTopProducts();
    }, []);

    // Fetch recent stock movements
    useEffect(() => {
        const fetchStockMovements = async () => {
            try {
                const response = await apiService.get('/stock-movements');
                if (response.data) {
                    setRecentStockMovements(response.data.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching stock movements:', error);
            }
        };

        fetchStockMovements();
    }, []);

    // Fetch total suppliers
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await apiService.get('/suppliers');
                if (response.data) {
                    setTotalSuppliers(response.data.length);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };

        fetchSuppliers();
    }, []);

    // Convert daily sales data for the area chart
    const salesChartData = dailySales.map((sale, index) => ({
        month: String(index + 1).padStart(2, '0'),
        sales: sale.total_sales,
        expense: sale.total_sales * 0.7 // Mock expense data (70% of sales)
    }));

    // Calculate total sales and expenses for legend
    const totalSales = dailySales.reduce((sum, sale) => sum + sale.total_sales, 0);
    const totalExpense = totalSales * 0.7;

    // Mock supplier performance (in production, fetch from /supplier-performance endpoint)
    const supplierPerformance = [
        { name: 'FreshFarm Co', performance: 98 },
        { name: 'HarvestGoods Inc', performance: 86 },
        { name: 'WorldGrocer Ltd', performance: 90 },
    ];

    const getStockStatus = (current: number, minimum: number) => {
        const percentage = (current / minimum) * 100;
        if (percentage <= 30) return 'Critical';
        if (percentage <= 50) return 'Urgent';
        if (percentage <= 70) return 'Low';
        return 'Reorder Needed';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Critical':
            case 'Urgent':
                return 'text-red-600 bg-red-50';
            case 'Low':
                return 'text-orange-600 bg-orange-50';
            case 'Reorder Needed':
                return 'text-pink-600 bg-pink-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const pieChartColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F97316'];

    const topProductsWithColors = topSellingProducts.map((product, index) => ({
        name: product.product_name,
        value: product.total_quantity,
        color: pieChartColors[index % pieChartColors.length]
    }));

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                .dashboard-container {
                    font-family: 'Inter', sans-serif;
                    background: #F8F9FB;
                    min-height: 100vh;
                    padding: 2rem;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .dashboard-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1F2937;
                }

                .date-selector {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #E5E7EB;
                    position: relative;
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                }

                .stat-icon {
                    color: #D946EF;
                }

                .stat-title {
                    font-size: 0.875rem;
                    color: #6B7280;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin-bottom: 0.25rem;
                }

                .stat-description {
                    font-size: 0.875rem;
                    color: #9CA3AF;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #E5E7EB;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .card-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1F2937;
                }

                .card-link {
                    color: #D946EF;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    cursor: pointer;
                    font-weight: 500;
                }

                .supplier-item {
                    margin-bottom: 1.25rem;
                }

                .supplier-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .supplier-name {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #1F2937;
                }

                .supplier-percentage {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #8B5CF6;
                }

                .progress-bar {
                    height: 8px;
                    background: #F3F4F6;
                    border-radius: 999px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: #8B5CF6;
                    border-radius: 999px;
                    transition: width 0.3s ease;
                }

                .supplier-subtitle {
                    font-size: 0.75rem;
                    color: #9CA3AF;
                    margin-top: 0.25rem;
                }

                .stock-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                .stock-table thead th {
                    background: #F9FAFB;
                    padding: 0.75rem 1rem;
                    text-align: left;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6B7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid #E5E7EB;
                }

                .stock-table tbody td {
                    padding: 1rem;
                    font-size: 0.875rem;
                    color: #1F2937;
                    border-bottom: 1px solid #F3F4F6;
                }

                .status-badge {
                    padding: 0.375rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-block;
                }

                .chart-section {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .chart-legend {
                    display: flex;
                    justify-content: flex-end;
                    gap: 2rem;
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .pie-legend {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .pie-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .pie-legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .pie-legend-label {
                    font-size: 0.8125rem;
                    color: #6B7280;
                    flex: 1;
                }

                .pie-legend-value {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1F2937;
                }

                .recent-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                .recent-table thead th {
                    background: #F9FAFB;
                    padding: 0.875rem 1rem;
                    text-align: left;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #6B7280;
                    border-bottom: 1px solid #E5E7EB;
                }

                .recent-table tbody td {
                    padding: 1rem;
                    font-size: 0.875rem;
                    color: #1F2937;
                    border-bottom: 1px solid #F3F4F6;
                }

                .type-badge {
                    padding: 0.25rem 0.625rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-block;
                }

                .type-in {
                    background: #D1FAE5;
                    color: #059669;
                }

                .type-out {
                    background: #FEE2E2;
                    color: #DC2626;
                }

                @media (max-width: 1280px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .content-grid,
                    .chart-section {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div className="date-selector">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                            <rect x="2" y="3" width="12" height="11" rx="2" strokeWidth="1.5"/>
                            <path d="M11 1.5V4.5" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M5 1.5V4.5" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M2 7H14" strokeWidth="1.5"/>
                        </svg>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>This Month</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M3 4.5L6 7.5L9 4.5"/>
                        </svg>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">
                                <Package className="stat-icon" size={16} />
                                Total Products
                            </div>
                            <MoreVertical size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="stat-value">{totalProducts.toLocaleString()}</div>
                        <div className="stat-description">Number of active products</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">
                                <AlertTriangle className="stat-icon" size={16} />
                                Stock Alerts
                            </div>
                            <MoreVertical size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="stat-value">{stockAlerts}</div>
                        <div className="stat-description">Items running low on stock</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">
                                <Truck className="stat-icon" size={16} />
                                Total Suppliers
                            </div>
                            <MoreVertical size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="stat-value">{totalSuppliers}</div>
                        <div className="stat-description">Registered suppliers</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">
                                <DollarSign className="stat-icon" size={16} />
                                Monthly Revenue
                            </div>
                            <MoreVertical size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="stat-value">{formatCurrency(monthlyRevenue)}</div>
                        <div className="stat-description">Total sales this month</div>
                    </div>
                </div>

                {/* Supplier Performance & Low Stock Items */}
                <div className="content-grid">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Supplier Performance</h2>
                            <div className="card-link">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                        {supplierPerformance.map((supplier, index) => (
                            <div key={index} className="supplier-item">
                                <div className="supplier-header">
                                    <span className="supplier-name">{supplier.name}</span>
                                    <span className="supplier-percentage">{supplier.performance}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${supplier.performance}%` }}></div>
                                </div>
                                <div className="supplier-subtitle">On-Time Delivery (%)</div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Low Stock Items</h2>
                        </div>
                        {lowStockItems.length > 0 ? (
                            <table className="stock-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Current</th>
                                        <th>Min</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockItems.map((item, index) => {
                                        const minStock = item.minimum_stock || 30;
                                        const status = getStockStatus(item.quantity, minStock);
                                        return (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: '500' }}>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{minStock}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusColor(status)}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                                No low stock items
                            </div>
                        )}
                    </div>
                </div>

                {/* Sales Chart & Top Selling Products */}
                <div className="chart-section">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Sales Chart</h2>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <div className="legend-dot" style={{ background: '#8B5CF6' }}></div>
                                    <span style={{ fontWeight: '500' }}>Total Sales : {formatCurrency(totalSales)}</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-dot" style={{ background: '#EC4899' }}></div>
                                    <span style={{ fontWeight: '500' }}>Total Expense : {formatCurrency(totalExpense)}</span>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesChartData}>
                                <defs>
                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                                    </linearGradient>
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '0.75rem' }}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '0.75rem' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    fill="url(#salesGradient)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#EC4899"
                                    strokeWidth={2}
                                    fill="url(#expenseGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Top Selling Products</h2>
                            <div className="card-link">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                        {topProductsWithColors.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={topProductsWithColors}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            dataKey="value"
                                            paddingAngle={2}
                                        >
                                            {topProductsWithColors.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-legend">
                                    {topProductsWithColors.map((product, index) => (
                                        <div key={index} className="pie-legend-item">
                                            <div className="pie-legend-dot" style={{ background: product.color }}></div>
                                            <span className="pie-legend-label">{product.name}</span>
                                            <span className="pie-legend-value">{product.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{
                                    textAlign: 'center',
                                    marginTop: '1rem',
                                    fontSize: '0.875rem',
                                    color: '#6B7280',
                                    fontWeight: '500'
                                }}>
                                    Total: {topProductsWithColors.reduce((sum, p) => sum + p.value, 0).toLocaleString()}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Stock In/Out Table */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Recent Stock In/Out Table</h2>
                        <div className="date-selector">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
                                <circle cx="7" cy="7" r="6" strokeWidth="1.5"/>
                                <path d="M7 3.5V7L9.5 9.5" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Newest</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                <path d="M3 4.5L6 7.5L9 4.5"/>
                            </svg>
                        </div>
                    </div>
                    {recentStockMovements.length > 0 ? (
                        <table className="recent-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Warehouse</th>
                                    <th>Status</th>
                                    <th>Handle By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentStockMovements.map((movement) => (
                                    <tr key={movement.id}>
                                        <td>{formatDate(movement.created_at)}</td>
                                        <td style={{ fontWeight: '500' }}>{movement.product_name}</td>
                                        <td>
                                            <span className={`type-badge ${movement.type === 'IN' ? 'type-in' : 'type-out'}`}>
                                                {movement.type}
                                            </span>
                                        </td>
                                        <td>{movement.quantity}</td>
                                        <td>{movement.warehouse}</td>
                                        <td>
                                            <span className="status-badge text-green-600 bg-green-50">
                                                Available
                                            </span>
                                        </td>
                                        <td>{movement.handled_by || 'Admin'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                            No recent stock movements
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
