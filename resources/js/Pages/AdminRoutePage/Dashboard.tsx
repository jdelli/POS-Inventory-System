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
    Legend,
    ResponsiveContainer,
} from 'recharts';
import apiService from '../Services/ApiService';

interface SalesData {
    branch_id: number;
    total_sales: number;
}

interface ApiResponse {
    success: boolean;
    data: SalesData[];
}

export default function Dashboard() {
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [chartData, setChartData] = useState<{ name: string; sales: number }[]>([]);
    const [dailySales, setDailySales] = useState<SalesData[]>([]);

    useEffect(() => {
        const fetchDataSalesByBranch = async () => {
            try {
                const response = await apiService.get<ApiResponse>('/sales-by-branch');
                if (response.data.success) {
                    setSalesData(response.data.data);

                    const chartFormattedData = response.data.data.map((item: SalesData) => ({
                        name: `${item.branch_id} Branch`,
                        sales: item.total_sales,
                    }));
                    setChartData(chartFormattedData);
                }
            } catch (error) {
                console.error('Error fetching sales data:', error);
            }
        };

        fetchDataSalesByBranch();
    }, []);

    useEffect(() => {
        const fetchDataDailySales = async () => {
            try {
                const response = await apiService.get<ApiResponse>('/daily-sales-by-branch');
                if (response.data.success) {
                    setDailySales(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching daily sales data:', error);
            }
        };

        fetchDataDailySales();
    }, []);

    // Ensure cards are displayed for all branches, even with no sales
    const branchCards = salesData.map((branch) => {
        const dailySalesForBranch = dailySales.find((item) => item.branch_id === branch.branch_id);
        const salesAmount = dailySalesForBranch ? dailySalesForBranch.total_sales : 0;

        return (
            <div
                key={branch.branch_id}
                className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-200"
            >
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Branch {branch.branch_id}</h3>
                <p
                    className={`text-2xl font-bold ${
                        salesAmount > 0 ? 'text-blue-600' : 'text-gray-400'
                    }`}
                >
                    ₱{salesAmount}
                </p>
                {salesAmount === 0 && <p className="text-sm text-gray-500">No sales today</p>}
            </div>
        );
    });

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Cards Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{branchCards}</div>

                    {/* Bar Chart Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-bold mb-4">Total Sales by Branch</h3>
                            <div style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="sales" fill="#8884d8" barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
