import React from "react";
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantityIn: number;
  quantityOut: number;
  date: string;
}

const dummyData: InventoryItem[] = [
  { id: 1, name: "Laptop", category: "Electronics", quantityIn: 10, quantityOut: 2, date: "2025-01-30" },
  { id: 2, name: "Desk Chair", category: "Furniture", quantityIn: 5, quantityOut: 1, date: "2025-01-29" },
  { id: 3, name: "Monitor", category: "Electronics", quantityIn: 8, quantityOut: 3, date: "2025-01-28" },
  { id: 4, name: "Keyboard", category: "Accessories", quantityIn: 15, quantityOut: 5, date: "2025-01-27" },
  { id: 5, name: "Mouse", category: "Accessories", quantityIn: 20, quantityOut: 8, date: "2025-01-26" },
];

const InventoryReport: React.FC = () => {
  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800">Dashboard</h2>}>
      <Head title="Dashboard" />
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Inventory Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Item Name</th>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Quantity In</th>
                <th className="border px-4 py-2">Quantity Out</th>
                <th className="border px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item) => (
                <tr key={item.id} className="text-center border-b">
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2">{item.category}</td>
                  <td className="border px-4 py-2 text-green-600">{item.quantityIn}</td>
                  <td className="border px-4 py-2 text-red-600">{item.quantityOut}</td>
                  <td className="border px-4 py-2">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InventoryReport;