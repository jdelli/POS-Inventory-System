import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface Product {
  name: string;
  quantity: number;
  price: number;
}

const SalesInvoice: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [customerName, setCustomerName] = React.useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  const addProduct = () => {
    setProducts([...products, { name: '', quantity: 0, price: 0 }]);
  };

  const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
    const newProducts = [...products];
    if (field === 'price' || field === 'quantity') {
      newProducts[index][field] = Number(value);
    } else {
      newProducts[index][field] = value as string;
    }
    setProducts(newProducts);
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.quantity * product.price, 0);
  };

  const removeItem = (index: number) => {
    setProducts((prevItems) => prevItems.filter((_, i) => i !== index));
  };
  
 const handleExportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    // Add Quotation Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const title = "CCTV Quotation";
    doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 100);

    // Customer and invoice date details
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Client: ${customerName}`, 40, 130);
    doc.text(`Date: ${currentDate}`, 40, 150);

    // Table settings
    const startX = 40;
    const startY = 180;
    const tableWidth = pageWidth - 2 * startX;
    const tableColumns = ["Product Name", "Quantity", "Price", "Total"];
    const columnWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.15, tableWidth * 0.2];

    // Table header with background color
    doc.setFillColor(230, 230, 230); // Light grey background
    doc.rect(startX, startY - 20, tableWidth, 20, 'F'); // Header background
    doc.setFont("helvetica", "bold");

    // Header text
    tableColumns.forEach((col, i) => {
        doc.text(col, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, startY - 5);
    });

    // Product rows with alternating background color
    products.forEach((product, index) => {
        const rowY = startY + 20 + index * 30;

        // Alternating row color
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245); // Light grey for even rows
            doc.rect(startX, rowY - 10, tableWidth, 30, 'F'); // Row background
        }

        // Product details
        doc.setFont("helvetica", "normal");
        doc.text(product.name, startX + 10, rowY);
        doc.text(`${product.quantity}`, startX + columnWidths[0] + 10, rowY);
        doc.text(`${product.price.toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + 10, rowY);
        doc.text(`${(product.quantity * product.price).toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 10, rowY);
    });

    // Grand Total
    const grandTotal = calculateTotal().toLocaleString();
    const rowAfterProducts = startY + 20 + products.length * 30;

    // Adjust spacing by adding more Y-distance between "Grand Total:" and the value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Grand total:", startX + columnWidths[0] + columnWidths[1] + 1, rowAfterProducts + 40); // Increased space before the value
    doc.text(`${grandTotal}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 10, rowAfterProducts + 40); // Increased Y-coordinate for the grand total value


    // Footer
    const footerY = rowAfterProducts + 80;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for your business!", startX, footerY);
    doc.text("For any inquiries, contact us at 09063229966 Globe", startX, footerY + 15);
    doc.text("Contact Person: Darel", startX, footerY + 30);

    // Save PDF
    doc.save('quotation.pdf');
};

  const isProductEmpty = products.length === 0;


  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Generate Quotation</h2>}>
      <Head title="Generate Quotation" />

      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Sales Quotation</h1>

          <label className="block text-lg font-medium mb-2" htmlFor="customer-name">Client:</label>
          <input
            type="text"
            id="customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mb-6 p-3 border border-gray-300 rounded shadow-md w-full focus:outline-none focus:border-blue-500"
            placeholder="Enter client name"
            aria-label="Customer Name"
          />

          <h2 className="text-xl font-semibold mb-4">Products</h2>

          {products.map((product, index) => (
            <div key={index} className="grid grid-cols-5 gap-6 mb-6 items-center">
              <input
                type="text"
                placeholder="Product Name"
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                className="p-3 border border-gray-300 rounded shadow-sm w-full focus:outline-none focus:border-blue-500"
                aria-label={`Product ${index + 1} Name`}
              />
              
              <input
                type="number"
                placeholder="Quantity"
                value={product.quantity || ""}
                onChange={(e) => handleProductChange(index, 'quantity', e.target.value.replace(/[^0-9]/g, ''))}
                className="p-3 border border-gray-300 rounded shadow-sm w-full focus:outline-none focus:border-blue-500"
                aria-label={`Product ${index + 1} Quantity`}
              />

              <input
                type="number"
                placeholder="Price"
                value={product.price || ""}
                onChange={(e) => handleProductChange(index, 'price', e.target.value.replace(/[^0-9.]/g, ''))}
                className="p-3 border border-gray-300 rounded shadow-sm w-full focus:outline-none focus:border-blue-500"
                aria-label={`Product ${index + 1} Price`}
              />

              <p className="text-lg font-semibold text-gray-800">
                Total: ₱{(product.quantity * product.price).toLocaleString()}
              </p>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 ml-1 font-bold"
                aria-label="Remove Item"
              >
                &times;
              </button>
            </div>
          ))}

          <button
            onClick={addProduct}
            className="bg-blue-500 text-white py-3 px-6 rounded mb-6 w-full font-semibold hover:bg-blue-600 shadow-md focus:outline-none"
            aria-label="Add Product"
          >
            Add Product
          </button>

          <div ref={invoiceRef} className="border-t-2 pt-6 mt-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">Client: {customerName}</h3>
            <table className="w-full mt-4 table-auto border-collapse">
              <thead>
                <tr className="text-left bg-gray-200 text-gray-700">
                  <th className="py-3 px-6 border border-gray-300">Product Name</th>
                  <th className="py-3 px-6 border border-gray-300">Quantity</th>
                  <th className="py-3 px-6 border border-gray-300">Price per unit</th>
                  <th className="py-3 px-6 border border-gray-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-3 px-6 border border-gray-300">{product.name}</td>
                    <td className="py-3 px-6 border border-gray-300">{product.quantity}</td>
                    <td className="py-3 px-6 border border-gray-300">₱  {product.price.toLocaleString()}</td>
                    <td className="py-3 px-6 border border-gray-300">₱  {(product.quantity * product.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-6 text-2xl font-bold text-blue-700">
              Grand Total: ₱ {calculateTotal().toLocaleString()}
            </div>
          </div>

          <div className="flex gap-6 mt-8 justify-center">
            <button
              onClick={handleExportPDF}
              className="bg-blue-500 text-white py-3 px-8 rounded shadow-md hover:bg-blue-600 focus:outline-none"
              disabled={isProductEmpty}
              aria-label="Download PDF Invoice"
            >
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default SalesInvoice;
