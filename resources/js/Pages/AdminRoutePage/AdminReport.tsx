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
import AdminLayout from "@/Layouts/AdminLayout";
import apiService from '../Services/ApiService';

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
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  




  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingCash = totalSales - totalExpensesAmount;



  useEffect(() => {
    if (!auth?.user?.name || !selectedBranchName) return;
  
    // Fetch sales data with pagination and branch filtering
    apiService
      .get("/sales-report/daily", {
        params: { 
          
          user_name: selectedBranchName, // Pass selected branch
          page: currentPage, // Pagination
        },
      })
      .then((response) => {
        setSalesData(response.data.data); // Update sales data
        setTotalPages(response.data.last_page); // Update total pages
      })
      .catch((error) => console.error("Error fetching sales data:", error));
  }, [auth?.user?.name, selectedBranchName, currentPage]); 
  // Re-fetch when user, branch, or page changes
  

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
        params: { branch_id: selectedBranchName, page: currentPageRemittances }, // Send current page
      });

      if (!response.data.success) {
        alert("No remittances found for this branch.");
        return;
      }

      setRemittances(response.data.data || []);
      setTotalPagesRemittances(response.data.last_page); // Set total pages from response
    } catch (error) {
      console.error("Error fetching remittances:", error);
    }
  };

  useEffect(() => {
    fetchRemittances();
  }, [currentPageRemittances, selectedBranchName]); // Fetch data when currentPage changes

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
    axios
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
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Sales Report</h2>}>
      <Head title="Admin Sales Report" />
      <div className="p-4 bg-white shadow rounded-lg">
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

            {/* View Monthly Sales Button */}
            <button
              onClick={openSalesModal}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              View Monthly Sales
            </button>
          </div>



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
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Total Sales</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((data, index) => (
              <tr key={data.date} className="text-center border">
                <td className="p-2 border">{(currentPage - 1) * 10 + index + 1}</td>
                <td className="p-2 border">{data.date}</td>
                <td className="p-2 border">₱{data.total_sales.toLocaleString()}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleOpenModal(data.date)}
                    className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded-l hover:bg-gray-400"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded-r hover:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>

        {/* Remittance Table */}
          <div className="w-full lg:w-1/2 lg:border-l border-gray-600 pl-4">
              <h1 className="text-center font-bold">Remittance</h1>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Date Start</th>
                    <th className="p-2 border">Date End</th>
                    <th className="p-2 border">Total Sales</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {remittances.length > 0 ? (
                    remittances.map((remit: Remittance) => (
                      <tr key={remit.id} className="text-center border">
                        <td className="p-2 border">{remit.date_start}</td>
                        <td className="p-2 border">{remit.date_end}</td>
                        <td className="p-2 border">₱{remit.total_sales}</td>
                        <td className="p-2 border font-semibold">
                  {remit.status === 'Received' ? (
                    <span className="text-green-600">Received</span>
                  ) : remit.status === 'Rejected' ? (
                    <span className="text-red-600">Rejected</span>
                  ) : (
                    <span className="text-yellow-500">Pending</span>
                  )}
                </td>

                <td className="p-2 border">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleViewDetails(remit.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Details
                    </button>
                  </div>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No remittance records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChangeRemittance(currentPageRemittances - 1)}
            disabled={currentPageRemittances === 1}
            className="px-4 py-2 bg-gray-300 rounded-l hover:bg-gray-400"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            {currentPageRemittances} / {totalPagesRemittances}
          </span>
          <button
            onClick={() => handlePageChangeRemittance(currentPageRemittances + 1)}
            disabled={currentPageRemittances === totalPagesRemittances}
            className="px-4 py-2 bg-gray-300 rounded-r hover:bg-gray-400"
          >
            Next
          </button>
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
            {/* STATUS ACTION BUTTONS */}
            <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleUpdateStatus(selectedRemittance.id, 'Received')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                 Received
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRemittance.id, 'Rejected')}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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

      </div>
    </AdminLayout>
  );
};

export default DailySalesReport;