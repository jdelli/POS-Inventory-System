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
import { StringDecoder } from 'node:string_decoder';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
    const [yearlySalesData, setYearlySalesData] = useState<SalesData[]>([]);
    const [yearlyChartData, setYearlyChartData] = useState<{ name: string; sales: number }[]>([]);
    const [dailySales, setDailySales] = useState<SalesData[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectYear, setSelectYear] = useState<number>(new Date().getFullYear());
    const [productSalesData, setProductSalesData] = useState<ProductSalesData[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    

    // Fetch yearly sales data by branch
    useEffect(() => {
        const fetchYearlySalesByBranch = async () => {
            try {
                const response = await apiService.get<ApiResponse<SalesData>>('/sales-by-branch', {
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
                const response = await apiService.get<ApiResponse<SalesData>>('/daily-sales-by-branch', {
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

    useEffect(() => {
        if (branches.length > 0) {
            setSelectedBranch;
        }
    }, [branches]);

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

                {/* Product Sales Pie Chart Section */}
                <div className="bg-white shadow-lg rounded-lg p-6 transition hover:shadow-xl mt-6 border-2 border-white">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Mostly Sold Products</h3>
                    <div className="mb-6">
                        <label className="text-gray-700 font-semibold mb-2 block">Select Branch:</label>
                        <select
                        value={selectedBranch || ''}
                        onChange={(e) => {
                        setSelectedBranch(e.target.value);
                        
                        }}
                        className="border rounded-md py-2 px-3 w-full md:w-auto"
                        aria-label="Select Branch"
                    >
                        <option value="" disabled>
                        Select Branch
                        </option>
                        {branches.map((branch) => (
                        <option key={branch.id} value={branch.name}>
                            {branch.name}
                        </option>
                        ))}
                    </select>
                    </div>
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
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminLayout>
    );
}