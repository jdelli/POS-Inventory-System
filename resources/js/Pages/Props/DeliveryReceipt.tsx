// import React, { useEffect, useState } from 'react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import apiService from '../Services/ApiService';

// interface StockEntry {
//   id: number;
//   DRNumber: string;
//   deliveredBy: string;
//   quantity: number;
//   date: string;
// }

// const StockEntriesTable: React.FC = () => {
//   const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // Fetch stock entries data
//   const fetchStockEntries = async () => {
//     setLoading(true);
//     try {
//       const response = await apiService.get('/stock-entries');
//       setStockEntries(response.data);
//     } catch (error) {
//       console.error('Error fetching stock entries:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStockEntries();
//   }, []);

//   const handleDelete = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this stock entry?')) return;
//     try {
//       await apiService.delete(`/delete-delivery-receipt/${id}`);
//       fetchStockEntries();
//     } catch (error) {
//       console.error('Error deleting stock entry:', error);
//     }
//   }

//   return (
//     <AuthenticatedLayout>
//       <div className="p-4">
//         <h1 className="text-xl font-bold mb-4">Stock Entries</h1>

//         <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//           <table className="min-w-full table-auto border border-gray-200">
//             <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
//               <tr>
//                 <th className="py-3 px-6 text-left">Delivery Receipt</th>
//                 <th className="py-3 px-6 text-left">Delivered By</th>
//                 <th className="py-3 px-6 text-left">Quantity</th>
//                 <th className="py-3 px-6 text-left">Date</th>
//               </tr>
//             </thead>
//             <tbody className="text-gray-700 text-sm">
//               {loading ? (
//                 <tr>
//                   <td colSpan={4} className="text-center py-4">Loading...</td>
//                 </tr>
//               ) : stockEntries.length > 0 ? (
//                 stockEntries.map((entry) => (
//                   <tr key={entry.id} className="border-b border-gray-200">
//                     <td className="py-3 px-6">{entry.DRNumber}</td>
//                     <td className="py-3 px-6">{entry.deliveredBy}</td>
//                     <td className="py-3 px-6">{entry.quantity}</td>
//                     <td className="py-3 px-6">{new Date(entry.date).toLocaleDateString()}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={4} className="text-center py-4">No records found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </AuthenticatedLayout>
//   );
// };

// export default StockEntriesTable;
