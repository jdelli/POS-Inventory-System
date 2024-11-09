import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
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

    // Set up fonts and styles
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Add Invoice Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const title = "Sales Invoice";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (doc.internal.pageSize.width - titleWidth) / 2, 100); // Centered title
    doc.setFont("helvetica", "normal");
    
    // Add customer name and invoice date
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Customer: ${customerName}`, 40, 120);
    doc.text(`Invoice Date: ${currentDate}`, 40, 135);

    // Table headers and structure
    const startY = 160;
    const tableColumns = ["Product Name", "Quantity", "Price", "Total"];
    const columnWidths = [180, 100, 100, 100];  // Adjust column widths to fit content

    // Draw table header background and columns
    doc.setFillColor(220, 220, 220); // Light grey for header background
    doc.rect(40, startY - 20, 460, 20, 'F'); // Header background

    // Set header text to bold
    doc.setFont("helvetica", "bold");
    tableColumns.forEach((col, i) => {
        doc.text(col, 40 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), startY - 5);
    });

    doc.setFont("helvetica", "normal");

    // Add product rows with borders and padding
    products.forEach((product, index) => {
        const rowY = startY + 20 + index * 30;
        doc.text(product.name, 40, rowY);
        doc.text(`${product.quantity}`, 40 + columnWidths[0], rowY);
        doc.text(`${product.price.toLocaleString()}`, 40 + columnWidths[0] + columnWidths[1], rowY);
        doc.text(`${(product.quantity * product.price).toLocaleString()}`, 40 + columnWidths[0] + columnWidths[1] + columnWidths[2], rowY);
    });

    // Draw border for the table
    doc.rect(40, startY - 20, 460, 30 + products.length * 30, 'S'); // Outline for table

    // Grand Total Section with separator
    const grandTotal = calculateTotal().toLocaleString();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ${grandTotal}`, 40, startY + 20 + products.length * 30 + 20);
    doc.setFont("helvetica", "normal");

   

    // Footer with company info or notes
    doc.setFontSize(10);
    doc.text("Thank you for your business!", 40, startY + 60 + products.length * 30);
    doc.text("For any inquiries, contact us at 09063229966 Globe", 40, startY + 75 + products.length * 30);
  

    // Save the PDF
    doc.save('quotation.pdf');
};


  const isProductEmpty = products.length === 0;

  

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Generate Quotation</h2>}>
      <Head title="Generate Quotation" />

      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Sales Quotation</h1>

        <label className="block text-lg font-medium mb-2" htmlFor="customer-name">Customer Name:</label>
        <input
          type="text"
          id="customer-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mb-6 p-3 border rounded shadow-md w-full"
          placeholder="Enter customer name"
          aria-label="Customer Name"
        />

        <h2 className="text-xl font-semibold mb-4">Products</h2>

        {products.map((product, index) => (
        <div key={index} className="grid grid-cols-5 gap-6 mb-6 items-center">
          {/* Product Name */}
          <input
            type="text"
            placeholder="Product Name"
            value={product.name}
            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
            className="p-3 border rounded shadow-sm w-full"
            aria-label={`Product ${index + 1} Name`}
          />
          
          {/* Quantity */}
          <input
            type="number"
            placeholder="Quantity"
            value={product.quantity ? product.quantity : ""}  // Show placeholder if quantity is 0 or empty
            onChange={(e) => handleProductChange(index, 'quantity', e.target.value.replace(/[^0-9]/g, ''))}
            className="p-3 border rounded shadow-sm w-full"
            aria-label={`Product ${index + 1} Quantity`}
          />

          {/* Price */}
          <input
            type="number"
            placeholder="Price"
            value={product.price ? product.price : ""}  // Show placeholder if price is 0 or empty
            onChange={(e) => handleProductChange(index, 'price', e.target.value.replace(/[^0-9.]/g, ''))}
            className="p-3 border rounded shadow-sm w-full"
            aria-label={`Product ${index + 1} Price`}
          />

          
          {/* Total */}
          <p className="text-lg font-semibold mr-1">
            Total: ₱{(product.quantity * product.price).toLocaleString()}
          </p>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-red-500 hover:text-red-700 ml-1"
            aria-label="Remove Item"
          >
            &times;
          </button>
        </div>
  ))}

   

    <button
      onClick={addProduct}
      className="bg-blue-500 text-white py-3 px-6 rounded mb-6 w-full"
      aria-label="Add Product"
    >
      Add Product
    </button>

    <div ref={invoiceRef} className="border-t-2 pt-6 mt-6 bg-gray-50">
      <h3 className="text-lg font-semibold text-blue-600">Customer: {customerName}</h3>
      <table className="w-full mt-4 table-auto border-collapse">
        <thead>
          <tr className="text-left bg-gray-200">
            <th className="py-3 px-6 border-b">Product Name</th>
            <th className="py-3 px-6 border-b">Quantity</th>
            <th className="py-3 px-6 border-b">Price</th>
            <th className="py-3 px-6 border-b">Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="py-3 px-6 border-b">{product.name}</td>
              <td className="py-3 px-6 border-b">{product.quantity}</td>
              <td className="py-3 px-6 border-b">₱{product.price.toLocaleString()}</td>
              <td className="py-3 px-6 border-b">₱{(product.quantity * product.price).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right mt-6 text-3xl font-semibold">
        Grand Total: ₱{calculateTotal().toLocaleString()}
      </div>
    </div>

    <div className="flex gap-6 mt-8 justify-center">
      <button
        onClick={handleExportPDF}
        className="bg-blue-500 text-white py-3 px-8 rounded shadow-md"
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
