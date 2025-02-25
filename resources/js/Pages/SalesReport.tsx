import React, { useEffect, useState } from "react";
import { usePage, Head } from "@inertiajs/react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; // Ensure this is the correct import path

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

const DailySalesReport: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesOrder[]>([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { auth } = usePage().props as { auth: { user: { name: string } } };

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

  const calculateTotal = (items: SalesOrderItem[]): number =>
    items.reduce((total, item) => total + item.price * item.quantity, 0);

  const computeGrandTotal = (orders: SalesOrder[]): number =>
    orders.reduce((grandTotal, order) => grandTotal + calculateTotal(order.items), 0);

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
            </style>
          </head>
          <body>
            <h2>Sales Orders for ${selectedSalesOrder[0].date}</h2>
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

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_sales" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>

        <div className="overflow-x-auto mt-4">
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
                <tr key={index} className="text-center border">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{data.date}</td>
                  <td className="p-2 border">
                    ${data.total_sales}
                  </td>
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
                  {selectedSalesOrder.map((order) => (
                    <div key={order.id} className="mb-4 border-b pb-4">
                      <p><strong>Receipt #:</strong> {order.receipt_number}</p>
                      <p><strong>Customer:</strong> {order.customer_name}</p>

                      <table className="w-full border mt-4">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="p-2 border">Product</th>
                            <th className="p-2 border">Quantity</th>
                            <th className="p-2 border">Price ($)</th>
                            <th className="p-2 border">Total ($)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index} className="border">
                              <td className="p-2 border">{item.product_name} ({item.product_code})</td>
                              <td className="p-2 border">{item.quantity}</td>
                              <td className="p-2 border">${item.price}</td>
                              <td className="p-2 border">${(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  {/* Grand Total */}
          <div className="mt-4 p-4 bg-gray-100 font-bold text-right border-t">
            Grand Total: $
            {computeGrandTotal(selectedSalesOrder).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
                </div>
              )}

              <button onClick={() => setIsModalOpen(false)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded w-full">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default DailySalesReport;
