import React, { useEffect, useState } from "react";
import { usePage, Head } from "@inertiajs/react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import apiService from "./Services/ApiService";

interface SalesOrderItem {
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface SalesOrder {
  id: number;
  receipt_number: string;
  customer_name: string;
  date: string;
  items: SalesOrderItem[];
  total_sales: number;
}

interface Product {
  product_code: string;
  product_name: string;
  total_quantity_sold: number;
  total_sales: number;
  category: string;
}

const DailySalesReport: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesOrder[]>([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { auth } = usePage().props as { auth: { user: { name: string } } };
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [monthlySales, setMonthlySales] = useState<Product[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [grandTotal, setGrandTotal] = useState<Product[]>([]);
  const [isCashBreakdownModalOpen, setIsCashBreakdownModalOpen] = useState(false);
  const [cashBreakdown, setCashBreakdown] = useState<{ [key: number]: number }>({});


  useEffect(() => {
    if (!auth?.user?.name) return;

    axios
      .get("/api/sales-report/daily", {
        params: { user_name: auth.user.name },
      })
      .then((response) => setSalesData(response.data))
      .catch((error) => console.error("Error fetching sales data:", error));
  }, [auth?.user?.name]);

  const handleOpenModal = (date: string) => {
    setLoading(true);
    axios
      .get(`/api/sales-orders-by-date?date=${date}`, {
        params: { user_name: auth.user.name },
      })
      .then((response) => setSelectedSalesOrder(response.data))
      .catch((error) => console.error("Error fetching sales orders:", error))
      .finally(() => setLoading(false));

    setIsModalOpen(true);
  };

  const fetchMonthlySales = async () => {
  try {
    const response = await apiService.get("/fetch-monthly-sales", {
      params: { month: selectedMonth, year: selectedYear },
    });

    console.log("API Response:", response.data); // Debugging

    if (!Array.isArray(response.data.monthlySales)) {
      throw new Error("Expected an array but got: " + JSON.stringify(response.data));
    }

    const sortedSales = response.data.monthlySales.sort(
      (a: Product, b: Product) => b.total_quantity_sold - a.total_quantity_sold
    );

    setMonthlySales(sortedSales);
    setGrandTotal(response.data.grandTotal); // Store grandTotal separately
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
  }
};

  const openSalesModal = () => {
    setIsSalesModalOpen(true);
    fetchMonthlySales();
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  const handlePrintAll = () => {
    if (!selectedSalesOrder.length) return;
    const printContent = document.getElementById("print-section-all");
    if (printContent) {
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(`
        <html>
          <head>
            <title>Sales Orders - ${selectedSalesOrder[0].date}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .receipt { margin-bottom: 20px; border-bottom: 1px solid black; padding-bottom: 10px; }
              .grand-total { margin-top: 20px; font-weight: bold; text-align: right; }
              .border-separation { margin-top: 20px; border-top: 2px solid black; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h2>Sales Orders for ${selectedSalesOrder[0].date}</h2>
            ${selectedSalesOrder.map(
              (order, index) => `
              <div class="receipt">
                <p><strong>Receipt #${index + 1}:</strong> ${order.receipt_number}</p>
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                <p><strong>Total Sales:</strong> $${order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</p>
              </div>
            `
            ).join("")}
            <div class="border-separation grand-total">
              Grand Total: $
              ${selectedSalesOrder.reduce(
                (acc, order) => acc + order.items.reduce((orderAcc, item) => orderAcc + item.price * item.quantity, 0),
                0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      newWindow?.document.close();
    }
  };

  const handlePrintMonthlyReport = () => {
    const printContent = document.getElementById("print-section-monthly");
    if (printContent) {
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(`
        <html>
          <head>
            <title>Monthly Sales Report - ${selectedMonth}/${selectedYear}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .grand-total { margin-top: 20px; font-weight: bold; text-align: right; }
            </style>
          </head>
          <body>
            <h2>Monthly Sales Report for ${new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" })} ${selectedYear}</h2>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      newWindow?.document.close();
    }
  };

  const openCashBreakdownModal = () => {
    setIsCashBreakdownModalOpen(true);
  };

  const closeCashBreakdownModal = () => {
    setIsCashBreakdownModalOpen(false);
  };

  const handlePrintCashBreakdown = () => {
    const printContent = document.getElementById("print-section-cash-breakdown");
    if (printContent) {
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(`
        <html>
          <head>
            <title>Cash Breakdown</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
            </style>
          </head>
          <body>
            <h2>Cash Breakdown</h2>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      newWindow?.document.close();
    }
  };

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Report</h2>}>
      <Head title="Sales Report" />
      <div className="p-4 bg-white shadow rounded-lg">
        <button
          onClick={openSalesModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          View Monthly Sales
        </button>

        <button
          onClick={openCashBreakdownModal}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-600"
        >
          Cash Breakdown
        </button>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total_sales" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>

       <div className="flex flex-wrap lg:flex-nowrap gap-4 mt-4 w-full">
  {/* Daily Sales Report Table */}
  <div className="w-full lg:w-1/2">
    <h1 className="text-center font-bold">Daily Sales Report</h1>
    <table className="w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">#</th>
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Sales ($)</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {salesData.map((data, index) => (
          <tr key={data.id} className="text-center border">
            <td className="p-2 border">{index + 1}</td>
            <td className="p-2 border">{data.date}</td>
            <td className="p-2 border">${data.total_sales.toLocaleString()}</td>
            <td className="p-2 border text-green-600 font-semibold">Completed</td>
            <td className="p-2 border">
              <button onClick={() => handleOpenModal(data.date)} className="mr-2 text-blue-500">
                View Items
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Top-Selling Products Table with Left Border */}
  <div className="w-full lg:w-1/2 lg:border-l border-gray-600 pl-4">
    <h1 className="text-center font-bold">Top-Selling Products</h1>
    <table className="w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">Product Name</th>
          <th className="p-2 border">Quantity Sold</th>
          <th className="p-2 border">Total Revenue ($)</th>
        </tr>
      </thead>
      <tbody>
        <tr className="text-center border">
          <td className="p-2 border"></td>
          <td className="p-2 border"></td>
          <td className="p-2 border">$</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


        
                                                    
        {isModalOpen && selectedSalesOrder.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-3/4 max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Sales Orders for {selectedSalesOrder[0].date}</h2>
                <button onClick={handlePrintAll} className="px-4 py-2 bg-blue-500 text-white rounded">
                  Print
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <div id="print-section-all">
                  {selectedSalesOrder.map((order, index) => (
                    <div key={order.id} className="mb-4 border-b pb-4">
                      <p>{index + 1}</p>
                      <p><strong>Receipt #:</strong> {order.receipt_number}</p>
                      <p><strong>Customer:</strong> {order.customer_name}</p>
                      <p><strong>Total Sales:</strong> ${order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="mt-4 p-4 bg-gray-100 font-bold text-right border-t">
                    Grand Total: $
                    {selectedSalesOrder.reduce((acc, order) => acc + order.items.reduce((orderAcc, item) => orderAcc + item.price * item.quantity, 0), 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              )}

              <button onClick={() => setIsModalOpen(false)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded w-full">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Monthly Sales Modal */}
        {isSalesModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Monthly Sales Report</h2>
                <button onClick={handlePrintMonthlyReport} className="px-4 py-2 bg-blue-500 text-white rounded">
                  Print
                </button>
              </div>
              <div className="flex mb-4">
                <select value={selectedMonth} onChange={handleMonthChange} className="mr-2 p-2 border rounded">
                  {[...Array(12).keys()].map((month) => (
                    <option key={month + 1} value={month + 1}>
                      {new Date(0, month).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <select value={selectedYear} onChange={handleYearChange} className="p-2 border rounded">
                  {[...Array(10).keys()].map((year) => (
                    <option key={year + (new Date().getFullYear() - 5)} value={year + (new Date().getFullYear() - 5)}>
                      {year + (new Date().getFullYear() - 5)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchMonthlySales}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
                >
                  Filter
                </button>
              </div>
              <div id="print-section-monthly">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 bg-gray-300 text-left">Product Name</th>
                      <th className="py-2 px-4 bg-gray-300 text-left">Total Quantity Sold</th>
                      <th className="py-2 px-4 bg-gray-300 text-left">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySales.length > 0 ? (
                      monthlySales.map((product) => (
                        <tr key={product.product_code} className="border-b hover:bg-gray-200">
                          <td className="py-2 px-4">{product.product_name}</td>
                          <td className="py-2 px-4 text-green-600">{product.total_quantity_sold.toLocaleString()}</td>
                          <td className="py-2 px-4 text-green-600">${product.total_sales.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4">No sales data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="mt-4 p-4 bg-gray-100 font-bold text-right border-t">
                  Grand Total: ${grandTotal.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setIsSalesModalOpen(false)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

       {/* Cash Breakdown Modal */}
{isCashBreakdownModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-2xl max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cash Breakdown</h2>
        <button onClick={handlePrintCashBreakdown} className="px-4 py-2 bg-blue-500 text-white rounded">
          Print
        </button>
      </div>
      <div id="print-section-cash-breakdown">
        {/* Cash Breakdown Form */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { denom: 1000, label: "₱1,000" },
            { denom: 500, label: "₱500" },
            { denom: 200, label: "₱200" },
            { denom: 100, label: "₱100" },
            { denom: 50, label: "₱50" },
            { denom: 20, label: "₱20" },
            { denom: 10, label: "₱10" },
            { denom: 5, label: "₱5" },
            { denom: 1, label: "₱1" },
          ].map(({ denom, label }) => (
            <div key={denom} className="flex items-center space-x-2">
              <label className="w-20">{label}</label>
              <input
                type="number"
                min="0"
                value={cashBreakdown[denom] || ""}
                onChange={(e) => setCashBreakdown({ ...cashBreakdown, [denom]: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          ))}
        </div>

        {/* Total Display */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-lg font-semibold">
          Total: ₱{Object.entries(cashBreakdown).reduce((sum, [denom, qty]) => sum + parseInt(denom) * qty, 0)}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={() => alert("Create Cash Breakdown")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create
        </button>
        <button
          onClick={closeCashBreakdownModal}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </AuthenticatedLayout>
  );
};

export default DailySalesReport;