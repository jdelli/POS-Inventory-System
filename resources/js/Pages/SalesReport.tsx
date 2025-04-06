import React, { useEffect, useState } from "react";
import { usePage, Head } from "@inertiajs/react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import apiService from './Services/ApiService';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';

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
  payment_method: string;
}

interface Product {
  product_code: string;
  product_name: string;
  total_quantity_sold: number;
  total_sales: number;
  category: string;
}




interface Remittance {
  id: number;
  date_start: string;
  date_end: string;
  total_sales: number;
  total_cash: number;
  total_expenses: number;
  remaining_cash: number;
  cash_breakdown: string; // Assuming JSON string
  expenses?: { particular: string; amount: number }[];
  status: 'Pending' | 'Received' | 'Rejected';  
  online_payments: number;
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
  const [expenses, setExpenses] = useState<{ particular: string; amount: number }[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [startDate, setStartDate] = useState(""); // User input for start date
  const [endDate, setEndDate] = useState(""); // User input for end date
  const [totalCash, setTotalCash] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [remittances, setRemittances] = useState([]);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);
  const [isRemittanceModalOpen, setIsRemittanceModalOpen] = useState(false);
  const [selectedRemittance, setSelectedRemittance] = useState<Remittance | null>(null);
  const [onlinePayments, setOnlinePayments] = useState(0);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [currentPageRemittances, setCurrentPageRemittances] = useState(1); // Track current page
  const [totalPagesRemittances, setTotalPagesRemittances] = useState(1); // Track total pages
  




  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingCash = totalSales - totalExpensesAmount;



  useEffect(() => {
    if (!auth?.user?.name) return;

    // Fetch sales data with pagination
    apiService
      .get("/sales-report/daily", {
        params: { 
          user_name: auth.user.name,
          page: currentPage, // Add current page to the API request
        },
      })
      .then((response) => {
        setSalesData(response.data.data); // Set sales data from response
        setTotalPages(response.data.last_page); // Set the total pages from the API response
      })
      .catch((error) => console.error("Error fetching sales data:", error));
  }, [auth?.user?.name, currentPage]); // Re-fetch when page or user changes

  // Handle page change
  const handlePageChange = (page: any) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };




  useEffect(() => {
    const calculatedTotalCash = Object.entries(cashBreakdown).reduce(
      (sum, [denom, qty]) => sum + parseInt(denom) * qty,
      0
    );
    setTotalCash(calculatedTotalCash);

  }, [cashBreakdown, expenses]);


   // Fetch all remittance records
   const fetchRemittances = async () => {
    try {
      const response = await apiService.get("/cash-breakdowns", {
        params: { branch_id: auth.user.name, page: currentPageRemittances }, // Send current page
      });

      if (!response.data.success) {
        alert("No remittances found for this branch.");
        return;
      }

      setRemittances(response.data.data || []);
      setTotalPagesRemittances(response.data.last_page); // Set total pages from response
    } catch (error) {
      console.error("Error fetching remittances:", error);
      alert("Failed to fetch remittances.");
    }
  };

  useEffect(() => {
    fetchRemittances();
  }, [currentPageRemittances]); // Fetch data when currentPage changes

  const handlePageChangeRemittance = (page: any) => {
    if (page > 0 && page <= totalPagesRemittances) {
      setCurrentPageRemittances(page);
    }
  };
  
  

  // Open modal with selected remittance data
  const handleViewDetails = async (id: number) => {
    try {
      const response = await apiService.get(`/cash-breakdowns/${id}`, {
        params: { branch_id: auth.user.name }, // Ensure branch filtering
      });
  
      console.log("Fetched data:", response.data); // Debugging
  
      if (!response.data.success) {
        alert("No remittance found for this branch.");
        return;
      }
  
      const data = {
        ...response.data.data,
        expenses:
          typeof response.data.data.expenses === "string"
            ? JSON.parse(response.data.data.expenses) // Parse only if it's a string
            : response.data.data.expenses || [], // Default to an empty array
      };
  
      setSelectedRemittance(data);
      setIsRemittanceModalOpen(true);
    } catch (error) {
      console.error("Error fetching remittance details:", error);
      alert("Error retrieving remittance details.");
    }
  };
  
  


  const submitCashBreakdown = async () => {
    try {
      const response = await apiService.post("/cash-breakdowns", {
        user_name: auth.user.name,
        date_start: startDate,
        date_end: endDate,
        total_sales: totalSalesAmount,
        cash_breakdown: cashBreakdown,
        total_cash: totalSales,
        expenses: expenses,
        total_expenses: totalExpenses,
        remaining_cash: remainingCash,
        online_payments: onlinePayments
      });
  
      alert("Cash Breakdown Created Successfully!");
      closeCashBreakdownModal();
      fetchRemittances();
    } catch (error) {
      console.error("Error creating cash breakdown:", error);
    }
  };
  



  const fetchTotalSales = async () => {
  if (!startDate || !endDate) {
    alert("Please select a date range.");
    return;
  }

  try {
    const response = await fetch(
      `/api/sales-total?start_date=${startDate}&end_date=${endDate}&user_name=${auth.user.name}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    setTotalSales(data.cash_sales);
    setOnlinePayments(data.online_sales);
    setTotalSalesAmount(data.total_sales);
  } catch (error) {
    console.error("Error fetching total sales:", error);
  }
};


const deleteCashBreakdown = async (id: number) => {
  try {
    const response = await apiService.delete(`/cash-breakdowns/${id}`);

    if (response.data.success) {
      alert("Cash Breakdown deleted successfully");
      setIsCashBreakdownModalOpen(false);
    } else {
      alert("Failed to delete cash breakdown");
    }
  } catch (error) {
    console.error("Error deleting cash breakdown:", error);
  }
  fetchRemittances();
};







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
      params: { month: selectedMonth, year: selectedYear, user_name: auth.user.name },
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
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .grand-total { margin-top: 20px; font-weight: bold; text-align: right; }
            </style>
          </head>
          <body>
            <h2>Sales Orders for ${selectedSalesOrder[0].date}</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Receipt #</th>
                  <th>Customer</th>
                  <th>Total Sales ($)</th>
                  <th>Mode of Payment</th>
                </tr>
              </thead>
              <tbody>
                ${selectedSalesOrder.map((order, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${order.receipt_number}</td>
                    <td>${order.customer_name}</td>
                    <td style="text-align: right;">${order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</td>
                    <td>${order.payment_method}</td>
                  </tr>
                `).join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold;">Grand Total:</td>
                  <td style="text-align: right; font-weight: bold;">
                    ${selectedSalesOrder.reduce(
                      (acc, order) => acc + order.items.reduce((orderAcc, item) => orderAcc + item.price * item.quantity, 0),
                      0
                    ).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
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
        <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" />
          <YAxis domain={['auto']} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
          <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, "Total Sales"]} />
          <Bar dataKey="total_sales" fill="#82ca9d" barSize={40} radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>


       <div className="flex flex-wrap lg:flex-nowrap gap-4 mt-4 w-full">
      {/* Daily Sales Report Table */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-center font-bold">Daily Sales Report</h1>
        <TableContainer component={Paper} elevation={3}>
                <Table className="w-full" aria-label="sales data table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableCell align="center" className="font-semibold">#</TableCell>
                      <TableCell align="center" className="font-semibold">Date</TableCell>
                      <TableCell align="center" className="font-semibold">Total Sales</TableCell>
                      <TableCell align="center" className="font-semibold">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.length > 0 ? (
                      salesData.map((data, index) => (
                        <TableRow key={data.date} hover className="text-center">
                          <TableCell align="center">{(currentPage - 1) * 10 + index + 1}</TableCell>
                          <TableCell align="center">{data.date}</TableCell>
                          <TableCell align="center">₱{data.total_sales.toLocaleString()}</TableCell>
                          <TableCell align="center">
                            <Button
                              onClick={() => handleOpenModal(data.date)}
                              variant="contained"
                              color="primary"
                              size="small"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No Daily Sales records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

                  {/* Pagination Controls */}
                  <div className="flex justify-center mt-4">
                  <Stack direction="row" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, value) => handlePageChange(value)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Stack>
        </div>
     </div>

      {/* Remittance Table */}
          <div className="w-full lg:w-1/2 lg:border-l border-gray-600 pl-4">
              <h1 className="text-center font-bold">Remittance</h1>
              <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                    <TableCell>Date Start</TableCell>
                    <TableCell>Date End</TableCell>
                    <TableCell>Total Sales</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {remittances.length > 0 ? (
                    remittances.map((remit: Remittance) => (
                      <TableRow key={remit.id} hover>
                        <TableCell>{remit.date_start}</TableCell>
                        <TableCell>{remit.date_end}</TableCell>
                        <TableCell>₱{remit.total_sales.toLocaleString()}</TableCell>
                        <TableCell>
                        <Typography
                          fontWeight={600}
                          color={
                            remit.status === 'Received'
                              ? 'green'
                              : remit.status === 'Rejected'
                              ? 'red'
                              : 'Orange'
                          }
                        >
                          {remit.status === 'Received' ? (
                            <span style={{ color: 'green' }}>Received</span>
                          ) : remit.status === 'Rejected' ? (
                            <span style={{ color: 'red' }}>Rejected</span>
                          ) : (
                            <span style={{ color: 'Orange' }}>Pending</span>
                          )}
                        </Typography>
                      </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleViewDetails(remit.id)}
                            >
                              View Details
                            </Button>

                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => deleteCashBreakdown(remit.id)}
                              disabled={remit.status === 'Received'}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No remittance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
                  {/* Pagination Controls */}
                  <div className="flex justify-center mt-4">
                  <Stack direction="row" justifyContent="center" alignItems="center" mt={3}>
                    <Pagination
                      count={totalPagesRemittances}
                      page={currentPageRemittances}
                      onChange={(_, value) => handlePageChangeRemittance(value)}
                      color="primary"
                      shape="rounded"
                      size="medium"
                      showFirstButton
                      showLastButton
                    />
                  </Stack>
                </div>
      

      {/* MODAL */}
      {isRemittanceModalOpen && selectedRemittance && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-[80vh] overflow-y-auto flex flex-col">
            <h2 className="text-xl font-bold text-center mb-4">Remittance Details</h2>
            <table className="w-full border">
              <tbody>
                <tr>
                  <td className="p-2 border font-bold">Date From:</td>
                  <td className="p-2 border">{selectedRemittance.date_start}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">Date To:</td>
                  <td className="p-2 border">{selectedRemittance.date_end}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">Total Sales:</td>
                  <td className="p-2 border">{selectedRemittance.total_sales}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">Total Cash:</td>
                  <td className="p-2 border">{selectedRemittance.total_cash}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">Total Online Payments:</td>
                  <td className="p-2 border">{selectedRemittance.online_payments}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">Total Expenses:</td>
                  <td className="p-2 border">{Array.isArray(selectedRemittance.expenses)
                    ? selectedRemittance.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0).toFixed(2)
                    : "0.00"}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">Remaining Cash:</td>
                  <td className="p-2 border">{selectedRemittance.remaining_cash}</td>
                </tr>
              </tbody>
            </table>

            {/* CASH BREAKDOWN */}
            <div className="mt-4">
              <h3 className="text-lg font-bold">Cash Breakdown</h3>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Denomination</th>
                    <th className="p-2 border">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                {Object.entries(
                      JSON.parse(selectedRemittance.cash_breakdown) as Record<string, number>
                    ).map(([denomination, count]) => (
                      <tr key={denomination}>
                        <td className="p-2 border">{denomination}</td>
                        <td className="p-2 border">{count}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* EXPENSES */}
            {selectedRemittance.expenses && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">Expenses</h3>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border">Expense Type</th>
                      <th className="p-2 border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedRemittance.expenses) ? (
                      selectedRemittance.expenses.map((expense, index) => (
                        <tr key={index}>
                          <td className="p-2 border">{expense.particular}</td>
                          <td className="p-2 border">{expense.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="p-2 border text-center text-gray-500">
                          No expenses recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsRemittanceModalOpen(false)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
  

  
                                           
        {/* Daily Sales Order */}                                   
        {isModalOpen && selectedSalesOrder.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-3/4 max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Daily Sales Report for {selectedSalesOrder[0].date}</h2>
                <button onClick={handlePrintAll} className="px-4 py-2 bg-blue-500 text-white rounded">
                  Print
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <div id="print-section-all">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-2 py-1">#</th>
                      <th className="border border-gray-300 px-2 py-1">Receipt #</th>
                      <th className="border border-gray-300 px-2 py-1">Customer</th>
                      <th className="border border-gray-300 px-2 py-1">Total Sales (₱)</th>
                      <th className="border border-gray-300 px-2 py-1">Mode of Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSalesOrder.map((order, index) => (
                      <tr key={order.id} className="border border-gray-300">
                        <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-1">{order.receipt_number}</td>
                        <td className="border border-gray-300 px-2 py-1">{order.customer_name}</td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">{order.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-1 text-right">Grand Total:</td>
                      <td className="border border-gray-300 px-2 py-1 text-right">₱
                        {selectedSalesOrder.reduce(
                          (acc, order) => acc + order.items.reduce((orderAcc, item) => orderAcc + item.price * item.quantity, 0),
                          0
                        ).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="border border-gray-300 px-2 py-1"></td>
                    </tr>
                  </tfoot>
                </table>
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
            <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
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
                          <td className="py-2 px-4 text-green-600">₱{product.total_sales.toLocaleString()}</td>
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
                  Grand Total: ₱{grandTotal.toLocaleString()}
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
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cash Breakdown</h2>
      </div>

      {/* Date Range Selection */}
      <div className="flex space-x-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2 py-1 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1 border rounded"
        />
        <button
          onClick={fetchTotalSales}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Get Sales Total
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
                onChange={(e) =>
                  setCashBreakdown({
                    ...cashBreakdown,
                    [denom]: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          ))}
        </div>
        
        {/* Total Display */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-lg font-semibold">
          Total: ₱
          {Object.entries(cashBreakdown).reduce(
            (sum, [denom, qty]) => sum + parseInt(denom) * qty,
            0
          )}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Expenses</h3>
        {expenses.map((expense, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 items-center mb-2 relative">
            <input
              type="text"
              placeholder="Particular"
              value={expense.particular}
              onChange={(e) =>
                setExpenses(
                  expenses.map((exp, i) =>
                    i === index ? { ...exp, particular: e.target.value } : exp
                  )
                )
              }
              className="px-2 py-1 border rounded w-full"
            />
            <input
              type="number"
              placeholder="How Much"
              min="0"
              value={expense.amount}
              onChange={(e) =>
                setExpenses(
                  expenses.map((exp, i) =>
                    i === index ? { ...exp, amount: parseFloat(e.target.value) || 0 } : exp
                  )
                )
              }
              className="px-2 py-1 border rounded w-full"
            />
            <button
              onClick={() => setExpenses(expenses.filter((_, i) => i !== index))}
              className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500 text-xl"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setExpenses([...expenses, { particular: "", amount: 0 }])}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Expense
        </button>
        
        {/* Overall Expenses Total */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-lg font-semibold">
          Total Expenses: ₱{expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)}
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-lg font-semibold">
        Total Sales Cash: ₱{totalSales}
      </div>
      <div className="mt-4 p-2 bg-gray-100 rounded text-lg font-semibold">
        Total Sales Online Payment: ₱{onlinePayments}
      </div>
      <div className="mt-4 p-2 bg-yellow-100 rounded text-lg font-semibold">
        Remaining Cash: ₱{remainingCash}
      </div>
      <div className="mt-4 p-2 bg-green-100 rounded text-lg font-semibold">
        Total Sales: ₱{totalSalesAmount}
      </div>
      
      
      {/* Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
      <button
        onClick={submitCashBreakdown}
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