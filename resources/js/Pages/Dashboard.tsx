import React, { useEffect, useState } from 'react';
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

const MonthlySalesDashboard: React.FC = () => {
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [totalSales, setTotalSales] = useState<number>(0);
    const [salesTarget, setSalesTarget] = useState<number>(3000000);
    const [totalSalesOrders, setTotalSalesOrders] = useState<number>(0); // New state for total clients
    const [totalProducts, setTotalProducts] = useState<number>(0); // New state for total clients
    const monthlyTarget = salesTarget / 12;
    const COLORS = ['#1E90FF', '#FF6347'];

    useEffect(() => {
        apiService.get<{ success: boolean; monthlySales: SalesData[] }>('/get-monthly-sales')
            .then((response) => {
                const data = response.data.monthlySales;
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

        // Fetch total clients and products
        apiService.get<{ success: boolean; totalSalesOrders: number }>('/get-total-clients')
            .then((response) => {
                if (response.data.success) {
                    setTotalSalesOrders(response.data.totalSalesOrders);
                }
            })
            .catch((error) => {
                console.error("Error fetching total clients data:", error);
            });

            apiService.get<{ success: boolean; totalProducts: number }>('/get-total-products')
            .then((response) => {
                if (response.data.success) {
                    setTotalProducts(response.data.totalProducts);
                }
            })
            .catch((error) => {
                console.error("Error fetching total products data:", error);
            });
    }, []);

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
                    {/* Card for Total Clients */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Total Sales Order:</h3>
                            <p className="text-3xl font-semibold text-blue-600">{totalSalesOrders.toLocaleString()}</p>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl">
                           <h3 className="text-lg font-bold text-gray-800 mb-2">Total Products:</h3> {/* Corrected title */}
                            <p className="text-3xl font-semibold text-blue-600">{totalProducts.toLocaleString()}</p>
                        </div>
                        {/* Add more cards here if needed */}
                    </div>

                    

                    {/* Existing Dashboard Content */}
                    {/* Monthly Sales Target vs Actual Bar Chart */}
                    <div className="bg-white shadow-lg rounded-lg p-6 transition hover:bg-gray-50 hover:shadow-xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Sales Target vs. Actual</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlySalesWithTarget}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
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
                                    <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
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
                                    <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center mt-4 text-lg font-semibold">
                                Yearly Total Sales: ₱{totalSales.toLocaleString()}
                            </div>
                            <div className={`text-center mt-4 ${totalSales >= salesTarget ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                                {totalSales >= salesTarget
                                    ? 'Fantastic! You have met or exceeded the sales target!'
                                    : `You need ₱${(salesTarget - totalSales).toLocaleString()} more to meet your sales target.`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MonthlySalesDashboard;
