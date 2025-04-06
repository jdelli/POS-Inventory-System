import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
  Typography,
  TextField,
  IconButton,
  Box,
  Button,
  Divider,
  
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
 

} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
    const title = "Quotation";
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
    doc.save((customerName) + ".pdf");
};

  const isProductEmpty = products.length === 0;


  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Generate Quotation</h2>}>
      <Head title="Generate Quotation" />

      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-8xl mx-auto">
        <Box textAlign="center" mb={4}>
            <Typography variant="h3" fontWeight="bold" color="primary">
              Generate Sales Quotation
            </Typography>
          </Box>

          <Typography variant="h6" mb={1}>
            Client:
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            label="Enter client name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Typography variant="h5" fontWeight="bold" mb={2}>
            Products
          </Typography>

          {products.map((product, index) => (
            <Box
              key={index}
              display="flex"
              flexWrap="wrap"
              gap={2}
              alignItems="center"
              mb={3}
            >
              <TextField
                label="Product Name"
                variant="outlined"
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                sx={{ flex: 1, minWidth: '150px' }}
              />

              <TextField
                label="Quantity"
                variant="outlined"
                type="number"
                value={product.quantity || ""}
                onChange={(e) =>
                  handleProductChange(index, 'quantity', e.target.value.replace(/[^0-9]/g, ''))
                }
                sx={{ width: '120px' }}
              />

              <TextField
                label="Price"
                variant="outlined"
                type="number"
                value={product.price || ""}
                onChange={(e) =>
                  handleProductChange(index, 'price', e.target.value.replace(/[^0-9.]/g, ''))
                }
                sx={{ width: '150px' }}
              />

              <Typography fontWeight="bold" color="text.secondary">
                ₱{(product.quantity * product.price).toLocaleString()}
              </Typography>

              <IconButton
                color="error"
                onClick={() => removeItem(index)}
                aria-label="Remove Item"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />

          <Button variant="contained" color="primary" onClick={addProduct}>
            Add Product
          </Button>

      

          <Box
            ref={invoiceRef}
            sx={{
              borderTop: 2,
              pt: 4,
              mt: 4,
              backgroundColor: 'grey.100',
              px: 2,
              pb: 4,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
              Client: {customerName}
            </Typography>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.200' }}>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price per unit</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>₱ {product.price.toLocaleString()}</TableCell>
                      <TableCell>₱ {(product.quantity * product.price).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 4 }} />

            <Box textAlign="right">
              <Typography variant="h5" fontWeight="bold" color="primary">
                Grand Total: ₱ {calculateTotal().toLocaleString()}
              </Typography>
            </Box>
          </Box>

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
