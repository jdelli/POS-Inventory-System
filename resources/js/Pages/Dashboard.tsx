import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import apiService from './Services/ApiService';
import { LayoutDashboard, TrendingUp, Target, ShoppingCart, DollarSign } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface SalesData {
    month: string;
    sales: number;
}

interface User {
    name: string;
}

const MonthlySalesDashboard: React.FC = () => {
    const { auth } = usePage().props as { auth: { user: User } };
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [totalSales, setTotalSales] = useState<number>(0);
    const [salesTarget, setSalesTarget] = useState<number>(0);
    const [totalSalesOrders, setTotalSalesOrders] = useState<number | null>(null);
    const [totalSalesToday, setTotalSalesToday] = useState<number | null>(null);
    const [dailySales, setDailySales] = useState<number>(0);
    const monthlyTarget = salesTarget / 12;
    const COLORS = ['#0F766E', '#F59E0B'];

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        apiService.get<{ success: boolean; data: number }>('/get-sales-target', {
            params: { user_name: auth.user.name }
        })
        .then((response) => {
            if (response.data.success) {
                setSalesTarget(response.data.data);
            }
        })
        .catch((error) => console.error("Error fetching sales target:", error));
    }, [auth.user.name]);

    useEffect(() => {
        apiService.get<{ success: boolean; data: SalesData[] }>('/get-monthly-sales', {
            params: { user_name: auth.user.name }
        })
            .then((response) => {
                const data = response.data.data;
                if (Array.isArray(data)) {
                    setSalesData(data);
                    setTotalSales(data.reduce((acc, item) => acc + item.sales, 0));
                }
            })
            .catch((error) => console.error("Error fetching monthly sales data:", error));

        apiService.get<{ success: boolean; data: number }>('/get-total-clients', {
            params: { user_name: auth.user.name }
        })
            .then((response) => {
                if (response.data.success) {
                    setTotalSalesOrders(response.data.data);
                }
            })
            .catch((error) => console.error("Error fetching total sales orders data:", error));

        apiService.get<{ success: boolean; data: number }>('/get-total-daily-sales-orders', {
            params: { user_name: auth.user.name }
        })
            .then((response) => {
                if (response.data.success) {
                    setTotalSalesToday(response.data.data);
                }
            })
            .catch((error) => console.error("Error fetching total products data:", error));

        apiService.get<{ success: boolean; data: number }>('/get-total-daily-sales', {
            params: { user_name: auth.user.name },
        })
            .then((response) => {
                if (response.data.success) {
                    setDailySales(response.data.data);
                }
            })
            .catch((error) => console.error("Error fetching daily sales data:", error));
    }, [auth.user.name]);

    const totalSalesData = [
        { name: 'Total Sales', value: totalSales },
        { name: 'Remaining', value: Math.max(0, salesTarget - totalSales) },
    ];

    const monthlySalesWithTarget = salesData.map((data) => ({
        ...data,
        target: monthlyTarget,
    }));

    const progressPercentage = salesTarget > 0 ? Math.min((totalSales / salesTarget) * 100, 100) : 0;

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}>
            <Head title="Dashboard" />
            <SharedStyles />

            <div className="user-page">
                <div className="page-header">
                    <h1 className="page-title">
                        <LayoutDashboard size={20} />
                        Sales Dashboard
                    </h1>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-box">
                        <div className="stat-label">Total Sales Orders</div>
                        <div className="stat-value primary">{totalSalesOrders !== null ? totalSalesOrders : '-'}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Orders Today</div>
                        <div className="stat-value">{totalSalesToday !== null ? totalSalesToday : '-'}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Daily Sales</div>
                        <div className="stat-value success">{formatCurrency(dailySales)}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Yearly Total</div>
                        <div className="stat-value primary">{formatCurrency(totalSales)}</div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid-2 mb-3">
                    {/* Monthly Sales Chart */}
                    <div className="chart-panel">
                        <div className="chart-title">
                            <TrendingUp size={14} />
                            Monthly Sales Target vs Actual
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlySalesWithTarget}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: '11px' }} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Bar dataKey="sales" fill="#0F766E" name="Actual Sales" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="target" fill="#F59E0B" name="Target" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Performance */}
                    <div className="chart-panel">
                        <div className="chart-title">
                            <Target size={14} />
                            Monthly Sales Performance
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: '11px' }} />
                                <Line type="monotone" dataKey="sales" stroke="#0F766E" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Target Progress Panel */}
                <div className="panel">
                    <div className="panel-header">
                        <Target size={14} />
                        Yearly Sales Target Progress
                    </div>
                    <div className="panel-body">
                        <div className="grid-2">
                            <div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={totalSalesData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                        >
                                            {totalSalesData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div className="mb-2">
                                    <div className="stat-label">Target Progress</div>
                                    <div className="progress" style={{ height: 10, marginTop: 4 }}>
                                        <div className="progress-bar" style={{ width: `${progressPercentage}%`, background: progressPercentage >= 100 ? '#059669' : '#0F766E' }}></div>
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.6875rem', marginTop: 4 }}>{progressPercentage.toFixed(1)}% achieved</div>
                                </div>
                                <div className="info-grid mt-2">
                                    <div className="info-item">
                                        <div className="info-label">Target</div>
                                        <div className="info-value">{formatCurrency(salesTarget)}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Achieved</div>
                                        <div className="info-value text-primary">{formatCurrency(totalSales)}</div>
                                    </div>
                                </div>
                                <div className={`mt-2 text-center ${totalSales >= salesTarget ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                    {totalSales >= salesTarget
                                        ? '🎉 Target achieved!'
                                        : `${formatCurrency(salesTarget - totalSales)} more needed`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MonthlySalesDashboard;
