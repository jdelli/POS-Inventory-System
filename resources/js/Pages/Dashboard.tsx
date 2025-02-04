import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import apiService from './Services/ApiService';

interface SalesData {
    month: string;
    sales: number;
}

interface DailySalesData {
    date: string;
    sales: number;
}

interface User {
    name: string;
}

const MonthlySalesDashboard: React.FC = () => {
    const { auth } = usePage().props as { auth: { user: User } };
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [totalSales, setTotalSales] = useState<number>(0);
    const [salesTarget, setSalesTarget] = useState<number>(3000000);
    const [totalSalesOrders, setTotalSalesOrders] = useState<number | null>(null);
    const [totalSalesToday, setTotalSalesToday] = useState<number | null>(null);
    const [dailySales, setDailySales] = useState<number | DailySalesData[]>(0);
    const monthlyTarget = salesTarget / 12;
    const COLORS = ['#1E90FF', '#FF6347'];

    useEffect(() => {
        // Fetch monthly sales data
        apiService.get<{ success: boolean; data: SalesData[] }>('/get-monthly-sales', {
            params: { user_name: auth.user.name }
        })
            .then((response) => {
                console.log("Monthly Sales Data:", response.data);
                const data = response.data.data;
                if (Array.isArray(data)) {
                    setSalesData(data);
                    setTotalSales(data.reduce((acc, item) => acc + item.sales, 0));
                } else {
                    throw new Error("Data is not an array");
                }
            })
            .catch((error) => {
                console.error("Error fetching monthly sales data:", error);
            });

        // Fetch total sales orders
        apiService.get<{ success: boolean; data: number }>('/get-total-clients', {
            params: { user_name: auth.user.name }
        })
            .then((response) => {
                console.log("Total Sales Orders Data:", response.data);
                if (response.data.success) {
                    setTotalSalesOrders(response.data.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching total sales orders data:", error);
            });

        // Fetch total orders for today
        apiService.get<{ success: boolean; data: number }>('/get-total-daily-sales-orders', {
            params: { user_name: auth.user.name }
        })
            .then((response) => {
                console.log("Total Products Data:", response.data);
                if (response.data.success) {
                    setTotalSalesToday(response.data.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching total products data:", error);
            });

        // Fetch daily sales data
        apiService.get<{ success: boolean; data: number }>('/get-total-daily-sales', {
            params: { user_name: auth.user.name },
        })
            .then((response) => {
                console.log("Daily Sales Data:", response.data);
                if (response.data.success) {
                    setDailySales(response.data.data); // `data` is now a single number
                }
            })
            .catch((error) => {
                console.error("Error fetching daily sales data:", error);
            });
            }, [auth.user.name]);

            const totalSalesData = [
                { name: 'Total Sales', value: totalSales },
                { name: 'Remaining', value: Math.max(0, salesTarget - totalSales) },
            ];

            const monthlySalesWithTarget = salesData.map((data) => ({
                ...data,
                target: monthlyTarget,
            }));

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Sales Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-100 overflow-y-auto max-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Card for Total Sales Orders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Total Sales Orders:</h3>
                            <p className="text-3xl font-semibold text-blue-600">
                                {totalSalesOrders !== null ? totalSalesOrders : 'Loading...'}
                            </p>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl">
                            <h3 className="text-lg font-bold text-gray-800 mb-2"> Sales Orders Today:</h3>
                            <p className="text-3xl font-semibold text-blue-600">
                                {totalSalesToday !== null ? totalSalesToday : 'Loading...'}
                            </p>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Daily Sales:</h3>
                            <p className="text-3xl font-semibold text-blue-600">
                                {typeof dailySales === 'number'
                                    ? `₱${dailySales}`
                                    : dailySales.length > 0
                                    ? dailySales.map((item) => `₱${item.sales}`).join(', ')
                                    : 'No sales today'}
                            </p>
                        </div>
                        {/* Add more cards here if needed */}
                    </div>

                    {/* Monthly Sales Target vs Actual Bar Chart */}
                    <div className="bg-white shadow-lg rounded-lg p-6 transition hover:bg-gray-50 hover:shadow-xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Sales Target vs. Actual</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlySalesWithTarget}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `₱${value}`} />
                                <Legend />
                                <Bar dataKey="sales" fill="#1E90FF" name="Actual Sales" />
                                <Bar dataKey="target" fill="#FF6347" name="Sales Target" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Side-by-side layout for Monthly Sales Performance and Yearly Sales Target Status */}
                    <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-8 lg:space-y-0">
                        {/* Monthly Sales Performance Line Chart */}
                        <div className="bg-white shadow-lg rounded-lg p-6 transition hover:bg-gray-50 hover:shadow-xl flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Sales Performance</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => `₱${value}`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="sales" stroke="#1E90FF" name="Sales Performance" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Total Sales Pie Chart */}
                        <div className="bg-white shadow-lg rounded-lg p-6 transition hover:bg-gray-50 hover:shadow-xl flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Yearly Sales Target Status</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={totalSalesData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {totalSalesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₱${value}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center mt-4 text-lg font-semibold">
                                Yearly Total Sales: ₱{totalSales}
                            </div>
                            <div className={`text-center mt-4 ${totalSales >= salesTarget ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                                {totalSales >= salesTarget
                                    ? 'Fantastic! You have met or exceeded the sales target!'
                                    : `You need ₱${salesTarget - totalSales} more to meet your sales target.`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MonthlySalesDashboard;