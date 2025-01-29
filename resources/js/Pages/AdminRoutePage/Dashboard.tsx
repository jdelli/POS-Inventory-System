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
} from 'recharts';
import apiService from '../Services/ApiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SalesData {
    branch_id: number;
    total_sales: number;
}

interface ApiResponse {
    success: boolean;
    data: SalesData[];
}

export default function Dashboard() {
    const [yearlySalesData, setYearlySalesData] = useState<SalesData[]>([]);
    const [yearlyChartData, setYearlyChartData] = useState<{ name: string; sales: number }[]>([]);
    const [dailySales, setDailySales] = useState<SalesData[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectYear, setSelectYear] = useState<number>(new Date().getFullYear());

    // Fetch yearly sales data by branch
    useEffect(() => {
        const fetchYearlySalesByBranch = async () => {
            try {
                const response = await apiService.get<ApiResponse>('/sales-by-branch', {
                    params: { year: selectYear },
                });

                if (response.data.success) {
                    setYearlySalesData(response.data.data);
                    setYearlyChartData(response.data.data.map((item) => ({
                        name: `Branch ${item.branch_id}`,
                        sales: item.total_sales,
                    })));
                }
            } catch (error) {
                console.error('Error fetching yearly sales data:', error);
            }
        };
        fetchYearlySalesByBranch();
    }, [selectYear]);

    // Fetch daily sales data
    useEffect(() => {
        const fetchDataDailySales = async () => {
            if (!selectedDate) return;

            try {
                const response = await apiService.get<ApiResponse>('/daily-sales-by-branch', {
                    params: { date: selectedDate?.toISOString().split('T')[0] },
                });
                if (response.data.success) {
                    setDailySales(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching daily sales data:', error);
            }
        };
        fetchDataDailySales();
    }, [selectedDate]);

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="py-8 px-4 max-w-7xl mx-auto space-y-10">
                {/* Cards Section */}
                <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl mt-6 border-2 border-white">
                    {/* Date Picker for Daily Sales */}
                    <div className="mb-6">
                        <label className="text-gray-700 font-semibold mb-2 block">Select Date:</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            className="border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dailySales.map((branch) => {
                            const salesAmount = branch.total_sales || 0;
                            return (
                                <div
                                    key={branch.branch_id}
                                    className="bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-200 border-2 border-white"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Branch {branch.branch_id}</h3>
                                    <p className="text-3xl font-bold">₱{salesAmount.toLocaleString()}</p>
                                    <p className="text-sm opacity-75">{salesAmount > 0 ? 'Today\'s Sales' : 'No Sales Today'}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Sales Section */}
                <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl mt-6 border-2 border-white">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Sales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailySales.map((item) => ({ name: `Branch ${item.branch_id}`, sales: item.total_sales }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                            <Bar dataKey="sales" fill="url(#colorDaily)" barSize={40} />
                            <defs>
                                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFA726" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#FFA726" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Year Picker and Yearly Sales Section */}
                <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl mt-6 border-2 border-white">
                    <div className="mb-6">
                        <label className="text-gray-700 font-semibold mb-2 block">Select Year:</label>
                        <DatePicker
                            selected={new Date(selectYear, 0)} // Create a date object with the selected year
                            onChange={(date) => setSelectYear(date ? date.getFullYear() : new Date().getFullYear())}
                            showYearPicker
                            dateFormat="yyyy"
                            className="border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Yearly Total Sales by Branch</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={yearlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                            <Bar dataKey="sales" fill="url(#colorUv)" barSize={40} />
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminLayout>
    );
}