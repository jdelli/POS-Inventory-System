import React, { useEffect, useState } from "react";
import { usePage, Head } from "@inertiajs/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import AdminLayout from "@/Layouts/AdminLayout";
import apiService from '../Services/ApiService';
import { Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead, TableRow,
  Button,
  Paper,
  Pagination,
  Stack,
  Typography
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
  const [remittances, setRemittances] = useState([]);
  const [isRemittanceModalOpen, setIsRemittanceModalOpen] = useState(false);
  const [selectedRemittance, setSelectedRemittance] = useState<Remittance | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [currentPageRemittances, setCurrentPageRemittances] = useState(1); // Track current page
  const [totalPagesRemittances, setTotalPagesRemittances] = useState(1); // Track total pages
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [selectedMonthDaily, setSelectedMonthDaily] = useState(new Date().getMonth().toString());
  const [selectedYearDaily, setSelectedYearDaily] = useState(new Date().getFullYear().toString());
  
  
  
  // Get an array of month names
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate a list of years (e.g., 5 years before and after the current year)
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());


  // Helper function to format currency as ₱100,000 without decimals
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 0, // No decimal places
          maximumFractionDigits: 0, // No decimal places
      }).format(amount);
    };



    useEffect(() => {
      if (!auth?.user?.name || !selectedBranchName) return;
    
      apiService
        .get("/sales-report/daily", {
          params: { 
            user_name: selectedBranchName,
            page: currentPage,
            month: selectedMonthDaily,
            year: selectedYearDaily,
          },
        })
        .then((response) => {
          setSalesData(response.data.data);
          setTotalPages(response.data.last_page);
        })
        .catch((error) => console.error("Error fetching sales data:", error));
    }, [auth?.user?.name, selectedBranchName, currentPage, selectedMonthDaily, selectedYearDaily]);
    
  

  // Handle page change
  const handlePageChange = (page: any) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };



   // Fetch all remittance records
   const fetchRemittances = async () => {
    try {
      const response = await apiService.get("/cash-breakdowns", {
        params: { 
          branch_id: selectedBranchName,
          page: currentPageRemittances,
          month: selectedMonthDaily,
          year: selectedYearDaily,
        },
      });
  
      if (!response.data.success) {
        alert("No remittances found for this branch.");
        return;
      }
  
      setRemittances(response.data.data || []);
      setTotalPagesRemittances(response.data.last_page);
    } catch (error) {
      console.error("Error fetching remittances:", error);
    }
  };
  

  useEffect(() => {
    fetchRemittances();
  }, [currentPageRemittances, selectedBranchName, selectedMonthDaily, selectedYearDaily]); // Fetch data when currentPage changes

  const handlePageChangeRemittance = (page: any) => {
    if (page > 0 && page <= totalPagesRemittances) {
      setCurrentPageRemittances(page);
    }
  };
  
  

  // Open modal with selected remittance data
  const handleViewDetails = async (id: number) => {
    try {
      const response = await apiService.get(`/cash-breakdowns/${id}`, {
        params: { branch_id: selectedBranchName }, // Ensure branch filtering
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



  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiService.put(`/remittance/${id}/update-status`, { status });
      setIsRemittanceModalOpen(false);
      fetchRemittances(); // Refresh the data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  


  // Fetch branches on mount
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




  const handleOpenModal = (date: string) => {
    setLoading(true);
    apiService
      .get(`/api/sales-orders-by-date?date=${date}`, {
        params: { user_name: selectedBranchName },
      })
      .then((response) => setSelectedSalesOrder(response.data))
      .catch((error) => console.error("Error fetching sales orders:", error))
      .finally(() => setLoading(false));

    setIsModalOpen(true);
  };

  const fetchMonthlySales = async () => {
  try {
    const response = await apiService.get("/fetch-monthly-sales", {
      params: { month: selectedMonth, year: selectedYear, user_name: selectedBranchName },
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
                  <th>Total Sales (₱)</th>
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




  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight"> Sales Report</h2>}>
      <Head title="Admin Sales Report" />
      <div className="p-4 bg-white shadow rounded-lg">
         <div className="flex flex-wrap items-center gap-4">
          {/* Left side (Branch, Month, Year) */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Branch Selection Dropdown */}
            <select
              value={selectedBranchName || ""}
              onChange={(e) => {
                setSelectedBranchName(e.target.value);
                setCurrentPage(1); // Reset pagination when branch changes
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

            {/* Month and Year Selectors */}
            <div className="flex items-center gap-2">
              <label htmlFor="month">Month:</label>
              <select
                id="month"
                value={selectedMonthDaily}
                onChange={(e) => setSelectedMonthDaily(e.target.value)}
                className="border rounded-md py-2 px-3"
              >
                {months.map((month, index) => (
                  <option key={index} value={index.toString()}>
                    {month}
                  </option>
                ))}
              </select>

              <label htmlFor="year" className="ml-2">Year:</label>
              <select
                id="year"
                value={selectedYearDaily}
                onChange={(e) => setSelectedYearDaily(e.target.value)}
                className="border rounded-md py-2 px-3"
              >
                {years.map((year, index) => (
                  <option key={index} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right side (View Monthly Sales Button) */}
          <div className="ml-auto">
            <button
              onClick={openSalesModal}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              View Monthly Sales
            </button>
          </div>
        </div>





          <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" />
              {/* Updated YAxis to use formatCurrency */}
              <YAxis domain={['auto']} tickFormatter={(value) => formatCurrency(value)} />
              {/* Updated Tooltip to use formatCurrency */}
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Total Sales"]} />
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
                                  <TableCell align="center">
                                      {/* Format Total Sales */}
                                      {formatCurrency(data.total_sales || 0)}
                                  </TableCell>
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
                                    <TableCell>
                                        {/* Format Total Sales */}
                                        {formatCurrency(remit.total_sales || 0)}
                                    </TableCell>
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
                              <td className="p-2 border">
                                  {formatCurrency(selectedRemittance.total_sales || 0)}
                              </td>
                          </tr>
                          <tr>
                              <td className="p-2 border font-bold">Total Cash:</td>
                              <td className="p-2 border">
                                  {formatCurrency(selectedRemittance.total_cash || 0)}
                              </td>
                          </tr>
                          <tr>
                              <td className="p-2 border font-bold">Total Online Payments:</td>
                              <td className="p-2 border">
                                  {formatCurrency(selectedRemittance.online_payments || 0)}
                              </td>
                          </tr>
                          <tr>
                              <td className="p-2 border font-bold">Total Expenses:</td>
                              <td className="p-2 border">
                                  {Array.isArray(selectedRemittance.expenses)
                                      ? formatCurrency(
                                            selectedRemittance.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0
                                        )
                                      : formatCurrency(0)}
                              </td>
                          </tr>
                          <tr>
                              <td className="p-2 border font-bold">Remaining Cash:</td>
                              <td className="p-2 border">
                                  {formatCurrency(selectedRemittance.remaining_cash || 0)}
                              </td>
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
                              {Object.entries(JSON.parse(selectedRemittance.cash_breakdown) as Record<string, number>).map(
                                  ([denomination, count]) => (
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
                                              <td className="p-2 border">
                                                  {formatCurrency(Number(expense.amount) || 0)}
                                              </td>
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

                  {/* ACTION BUTTONS */}
                  <div className="mt-4 flex space-x-4">
                      <button
                          onClick={() => handleUpdateStatus(selectedRemittance.id, "Received")}
                          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                          Received
                      </button>
                      <button
                          onClick={() => handleUpdateStatus(selectedRemittance.id, "Rejected")}
                          className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                          Reject
                      </button>
                  </div>

                  {/* CLOSE BUTTON */}
                  <button
                      onClick={() => setIsRemittanceModalOpen(false)}
                      className="mt-4 w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
                                                {/* Format individual order total */}
                                                {formatCurrency(
                                                    order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
                                                )}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1">{order.payment_method}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100 font-bold">
                                        <td colSpan={3} className="border border-gray-300 px-2 py-1 text-right">Grand Total:</td>
                                        <td className="border border-gray-300 px-2 py-1 text-right">
                                            {/* Format grand total */}
                                            {formatCurrency(
                                                selectedSalesOrder.reduce(
                                                    (acc, order) =>
                                                        acc +
                                                        order.items.reduce((orderAcc, item) => orderAcc + item.price * item.quantity, 0),
                                                    0
                                                )
                                            )}
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
                                            <td className="py-2 px-4 text-green-600">
                                                {product.total_quantity_sold.toLocaleString()}
                                            </td>
                                            <td className="py-2 px-4 text-green-600">
                                                {/* Format Total Sales */}
                                                {formatCurrency(product.total_sales || 0)}
                                            </td>
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
                            {/* Format Grand Total */}
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

      </div>
    </AdminLayout>
  );
};

export default DailySalesReport;