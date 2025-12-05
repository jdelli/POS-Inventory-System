import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    AreaChart,
    Area,
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
} from 'recharts';
import apiService from '../Services/ApiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pusher from 'pusher-js';
import { LayoutDashboard, Package, AlertTriangle, Truck, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import echo from '../echo';
import SharedStyles from './SharedStyles';

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

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const productsResponse = await apiService.get('/fetch-products-by-branch', {
                    params: { user_name: 'branch1' }
                });
                if (productsResponse.data.warehouse?.data) {
                    setTotalProducts(productsResponse.data.warehouse.total || productsResponse.data.warehouse.data.length);
                    const lowStock = productsResponse.data.warehouse.data.filter((product: any) =>
                        product.quantity < (product.minimum_stock || 30)
                    );
                    setLowStockItems(lowStock.slice(0, 5));
                    setStockAlerts(lowStock.length);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        fetchDashboardStats();
    }, []);

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

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await apiService.get('/top-selling-products');
                if (response.data) {
                    setTopSellingProducts(response.data.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching top products:', error);
            }
        };
        fetchTopProducts();
    }, []);

    useEffect(() => {
        const fetchStockMovements = async () => {
            try {
                const response = await apiService.get('/stock-movements');
                if (response.data) {
                    setRecentStockMovements(response.data.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching stock movements:', error);
            }
        };
        fetchStockMovements();
    }, []);

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

    const salesChartData = dailySales.map((sale, index) => ({
        name: `B${index + 1}`,
        sales: sale.total_sales,
    }));

    const totalSales = dailySales.reduce((sum, sale) => sum + sale.total_sales, 0);

    const supplierPerformance = [
        { name: 'FreshFarm Co', performance: 98 },
        { name: 'HarvestGoods Inc', performance: 86 },
        { name: 'WorldGrocer Ltd', performance: 90 },
    ];

    const getStockStatus = (current: number, minimum: number) => {
        const percentage = (current / minimum) * 100;
        if (percentage <= 30) return { label: 'Critical', class: 'badge-danger' };
        if (percentage <= 50) return { label: 'Urgent', class: 'badge-warning' };
        if (percentage <= 70) return { label: 'Low', class: 'badge-warning' };
        return { label: 'Reorder', class: 'badge-info' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const pieColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981'];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />
            <SharedStyles />

            <div className="admin-page">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">
                        <LayoutDashboard size={20} />
                        Dashboard Overview
                    </h1>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-box">
                        <div className="stat-label">Total Products</div>
                        <div className="stat-value">{totalProducts.toLocaleString()}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Stock Alerts</div>
                        <div className="stat-value danger">{stockAlerts}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Total Suppliers</div>
                        <div className="stat-value">{totalSuppliers}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Monthly Revenue</div>
                        <div className="stat-value success">{formatCurrency(monthlyRevenue)}</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid-3 mb-3">
                    {/* Sales Chart */}
                    <div className="chart-panel" style={{ gridColumn: 'span 2' }}>
                        <div className="chart-title">
                            <TrendingUp size={14} />
                            Daily Sales by Branch
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={salesChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `₱${(v/1000)}k`} />
                                <Tooltip 
                                    formatter={(value: number) => [formatCurrency(value), 'Sales']}
                                    contentStyle={{ fontSize: '12px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                                />
                                <Bar dataKey="sales" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex-between mt-2" style={{ fontSize: '0.75rem' }}>
                            <span className="text-muted">Total Sales Today:</span>
                            <span className="currency font-bold">{formatCurrency(totalSales)}</span>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="chart-panel">
                        <div className="chart-title">
                            <Package size={14} />
                            Top Selling Products
                        </div>
                        {topSellingProducts.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                        <Pie
                                            data={topSellingProducts.map((p, i) => ({ name: p.product_name, value: p.total_quantity }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={35}
                                            outerRadius={55}
                                            dataKey="value"
                                        >
                                            {topSellingProducts.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ fontSize: '0.6875rem' }}>
                                    {topSellingProducts.slice(0, 3).map((product, i) => (
                                        <div key={i} className="flex-between mb-1">
                                            <span className="flex gap-1" style={{ alignItems: 'center' }}>
                                                <span style={{ width: 8, height: 8, borderRadius: 2, background: pieColors[i] }}></span>
                                                {product.product_name.substring(0, 15)}...
                                            </span>
                                            <span className="font-bold">{product.total_quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <Package size={24} />
                                <div className="empty-state-text">No data</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid-2">
                    {/* Supplier Performance */}
                    <div className="panel">
                        <div className="panel-header">
                            <Truck size={14} />
                            Supplier Performance
                        </div>
                        <div className="panel-body">
                            {supplierPerformance.map((supplier, index) => (
                                <div key={index} className="mb-2">
                                    <div className="flex-between mb-1" style={{ fontSize: '0.75rem' }}>
                                        <span>{supplier.name}</span>
                                        <span className="font-bold text-primary">{supplier.performance}%</span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: `${supplier.performance}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Items */}
                    <div className="panel">
                        <div className="panel-header">
                            <AlertTriangle size={14} />
                            Low Stock Items
                        </div>
                        {lowStockItems.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Current</th>
                                        <th>Min</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockItems.map((item) => {
                                        const minStock = item.minimum_stock || 30;
                                        const status = getStockStatus(item.quantity, minStock);
                                        return (
                                            <tr key={item.id}>
                                                <td>{item.name.substring(0, 20)}...</td>
                                                <td className="font-bold">{item.quantity}</td>
                                                <td className="text-muted">{minStock}</td>
                                                <td><span className={`badge ${status.class}`}>{status.label}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <Package size={24} />
                                <div className="empty-state-text">No low stock items</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Stock Movements */}
                <div className="table-container">
                    <div className="panel-header">
                        <Package size={14} />
                        Recent Stock Movements
                    </div>
                    {recentStockMovements.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Qty</th>
                                    <th>Warehouse</th>
                                    <th>Handler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentStockMovements.map((movement) => (
                                    <tr key={movement.id}>
                                        <td>{formatDate(movement.created_at)}</td>
                                        <td>{movement.product_name}</td>
                                        <td>
                                            <span className={`badge ${movement.type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                                                {movement.type}
                                            </span>
                                        </td>
                                        <td className="font-bold">{movement.quantity}</td>
                                        <td>{movement.warehouse}</td>
                                        <td className="text-muted">{movement.handled_by || 'Admin'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <Package size={32} />
                            <div className="empty-state-text">No recent movements</div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
