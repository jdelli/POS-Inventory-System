import React, { useRef, useEffect, useState } from 'react';
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
import apiService from './Services/ApiService';

interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface InventoryItem {
  id: number;
  name: string;
  price: number;
  product_code: string;
}

const SalesInvoice: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const addProduct = () => {
    setProducts([...products, { name: '', quantity: 0, price: 0 }]);
    setSearchTerms([...searchTerms, '']);
    setProductSuggestions([...productSuggestions, []]);
  };

  const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = products.map((product, i) =>
      i === index ? { ...product, [field]: field === 'quantity' || field === 'price' ? Number(value) : value } : product
    );
    setProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.quantity * product.price, 0);
  };

  const removeItem = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
    setSearchTerms((prev) => prev.filter((_, i) => i !== index));
    setProductSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSearchTermChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);

    const updatedProducts = [...products];
    updatedProducts[index].name = value;
    setProducts(updatedProducts);
  };

  useEffect(() => {
    searchTerms.forEach((term, index) => {
      if (term.length > 0) {
        apiService
          .get('/search-products', { params: { q: term, user_name: 'warehouse' } })
          .then((response) => {
            const updatedSuggestions = [...productSuggestions];
            updatedSuggestions[index] = response.data;
            setProductSuggestions(updatedSuggestions);
          })
          .catch((error) => {
            console.error('Error fetching product suggestions:', error);
          });
      } else {
        const updatedSuggestions = [...productSuggestions];
        updatedSuggestions[index] = [];
        setProductSuggestions(updatedSuggestions);
      }
    });
  }, [searchTerms]);

  const handleSuggestionClick = (index: number, product: InventoryItem) => {
    const updatedProducts = products.map((p, i) =>
      i === index ? { name: product.name, quantity: 1, price: product.price } : p
    );
    setProducts(updatedProducts);

    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = '';
    setSearchTerms(updatedSearchTerms);

    const updatedSuggestions = [...productSuggestions];
    updatedSuggestions[index] = [];
    setProductSuggestions(updatedSuggestions);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = 'Quotation';
    doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 100);

    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Client: ${customerName}`, 40, 130);
    doc.text(`Date: ${currentDate}`, 40, 150);

    const startX = 40;
    const startY = 180;
    const tableWidth = pageWidth - 2 * startX;
    const tableColumns = ['Product Name', 'Quantity', 'Price', 'Total'];
    const columnWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.15, tableWidth * 0.2];

    doc.setFillColor(230, 230, 230);
    doc.rect(startX, startY - 20, tableWidth, 20, 'F');
    doc.setFont('helvetica', 'bold');

    tableColumns.forEach((col, i) => {
      doc.text(col, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, startY - 5);
    });

    products.forEach((product, index) => {
      const rowY = startY + 20 + index * 30;

      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(startX, rowY - 10, tableWidth, 30, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.text(product.name, startX + 10, rowY);
      doc.text(`${product.quantity}`, startX + columnWidths[0] + 10, rowY);
      doc.text(`${product.price.toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + 10, rowY);
      doc.text(`${(product.quantity * product.price).toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 10, rowY);
    });

    const grandTotal = calculateTotal().toLocaleString();
    const rowAfterProducts = startY + 20 + products.length * 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Grand total:', startX + columnWidths[0] + columnWidths[1] + 1, rowAfterProducts + 40);
    doc.text(`${grandTotal}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 10, rowAfterProducts + 40);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', startX, rowAfterProducts + 80);

    doc.save(`${customerName}.pdf`);
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

          <TextField
            fullWidth
            variant="outlined"
            label="Enter client name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ mb: 4 }}
          />

          {products.map((product, index) => (
            <Box key={index} display="flex" alignItems="center" gap={2} mb={3}>
              <TextField
                variant="outlined"
                label="Product Name"
                value={searchTerms[index] || product.name}
                onChange={(e) => handleSearchTermChange(index, e.target.value)}
                sx={{ flex: 1 }}
              />
              {productSuggestions[index]?.length > 0 && (
                <ul className="absolute z-10 bg-white border rounded shadow-md max-h-40 overflow-y-auto">
                  {productSuggestions[index].map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(index, suggestion)}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                    >
                      {suggestion.name} ({suggestion.product_code}) - ₱{suggestion.price}
                    </li>
                  ))}
                </ul>
              )}
              <TextField
                label="Quantity"
                type="number"
                value={product.quantity || ''}
                onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
                sx={{ width: '120px' }}
              />
              <TextField
                label="Price/unit"
                type="number"
                value={product.price || ''}
                onChange={(e) => handleProductChange(index, 'price', Number(e.target.value))}
                sx={{ width: '150px' }}
              />
              <Typography fontWeight="bold" color="text.secondary">
                ₱{(product.quantity * product.price).toLocaleString()}
              </Typography>
              <IconButton color="error" onClick={() => removeItem(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button variant="contained" color="primary" onClick={addProduct} sx={{ mt: 2 }}>
            Add Product
          </Button>

          <Box ref={invoiceRef} sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
              Quotation Summary
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price/unit</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>₱{product.price}</TableCell>
                      <TableCell>₱{(product.quantity * product.price).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box textAlign="right" mt={2}>
              <Typography variant="h5" fontWeight="bold">
                Grand Total: ₱{calculateTotal().toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleExportPDF}
            disabled={isProductEmpty}
            sx={{ mt: 4 }}
          >
            Download PDF
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default SalesInvoice;