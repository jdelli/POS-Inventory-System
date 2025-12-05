import React, { useRef, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FileText, Plus, Trash2, Download } from 'lucide-react';
import apiService from './Services/ApiService';
import SharedStyles from './SharedStyles';

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

    const calculateTotal = () => products.reduce((sum, product) => sum + product.quantity * product.price, 0);

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
                apiService.get('/search-products', { params: { q: term, user_name: 'warehouse' } })
                    .then((response) => {
                        const updatedSuggestions = [...productSuggestions];
                        updatedSuggestions[index] = response.data;
                        setProductSuggestions(updatedSuggestions);
                    })
                    .catch((error) => console.error('Error fetching product suggestions:', error));
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
        setSearchTerms((prev) => prev.map((term, i) => (i === index ? '' : term)));
        setProductSuggestions((prev) => prev.map((suggestions, i) => (i === index ? [] : suggestions)));
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    const handleExportPDF = () => {
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.width;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Quotation', (pageWidth - doc.getTextWidth('Quotation')) / 2, 100);

        doc.setFontSize(12);
        doc.text(`Client: ${customerName}`, 40, 130);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 40, 150);

        const startX = 40, startY = 180;
        const tableWidth = pageWidth - 80;
        const columnWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.15, tableWidth * 0.2];

        doc.setFillColor(230, 230, 230);
        doc.rect(startX, startY - 20, tableWidth, 20, 'F');
        doc.setFont('helvetica', 'bold');
        ['Product Name', 'Quantity', 'Price', 'Total'].forEach((col, i) => {
            doc.text(col, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, startY - 5);
        });

        products.forEach((product, index) => {
            const rowY = startY + 20 + index * 30;
            if (index % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(startX, rowY - 10, tableWidth, 30, 'F'); }
            doc.setFont('helvetica', 'normal');
            doc.text(product.name, startX + 10, rowY);
            doc.text(`${product.quantity}`, startX + columnWidths[0] + 10, rowY);
            doc.text(`${product.price.toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + 10, rowY);
            doc.text(`${(product.quantity * product.price).toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 10, rowY);
        });

        const rowAfterProducts = startY + 20 + products.length * 30;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Grand total:', startX + columnWidths[0] + columnWidths[1] + 1, rowAfterProducts + 40);
        doc.text(`${calculateTotal().toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 10, rowAfterProducts + 40);

        doc.save(`${customerName || 'quotation'}.pdf`);
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Generate Quotation</h2>}>
            <Head title="Generate Quotation" />
            <SharedStyles />

            <div className="user-page">
                <div className="page-header">
                    <h1 className="page-title"><FileText size={20} />Generate Quotation</h1>
                </div>

                <div className="panel">
                    <div className="panel-header">Client Information</div>
                    <div className="panel-body">
                        <div className="form-group">
                            <label className="form-label">Client Name</label>
                            <input type="text" className="form-control" placeholder="Enter client name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ maxWidth: 400 }} />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-header flex-between">
                        <span>Products</span>
                        <button className="btn btn-sm btn-primary" onClick={addProduct}><Plus size={14} /> Add Product</button>
                    </div>
                    <div className="panel-body">
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'flex-end' }}>
                                    <div style={{ flex: 2, position: 'relative' }}>
                                        <label className="form-label">Product Name</label>
                                        <input type="text" className="form-control" value={searchTerms[index] || product.name} onChange={(e) => handleSearchTermChange(index, e.target.value)} placeholder="Search product..." />
                                        {productSuggestions[index]?.length > 0 && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #D1D5DB', borderRadius: 3, maxHeight: 150, overflowY: 'auto', zIndex: 10 }}>
                                                {productSuggestions[index].map((suggestion) => (
                                                    <div key={suggestion.id} onClick={() => handleSuggestionClick(index, suggestion)} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem' }} className="hover:bg-gray-100">
                                                        {suggestion.name} ({suggestion.product_code}) - {formatCurrency(suggestion.price)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ width: 100 }}>
                                        <label className="form-label">Qty</label>
                                        <input type="number" className="form-control" value={product.quantity || ''} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} />
                                    </div>
                                    <div style={{ width: 120 }}>
                                        <label className="form-label">Price</label>
                                        <input type="number" className="form-control" value={product.price || ''} onChange={(e) => handleProductChange(index, 'price', e.target.value)} />
                                    </div>
                                    <div style={{ width: 120 }}>
                                        <label className="form-label">Total</label>
                                        <div className="form-control currency" style={{ background: '#F3F4F6' }}>{formatCurrency(product.quantity * product.price)}</div>
                                    </div>
                                    <button className="btn btn-sm btn-danger btn-icon" onClick={() => removeItem(index)}><Trash2 size={14} /></button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state"><FileText size={24} /><div className="empty-state-text">No products added</div></div>
                        )}
                    </div>
                </div>

                {products.length > 0 && (
                    <div className="panel">
                        <div className="panel-header">Summary</div>
                        <div className="panel-body">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.name}</td>
                                            <td>{product.quantity}</td>
                                            <td>{formatCurrency(product.price)}</td>
                                            <td className="currency">{formatCurrency(product.quantity * product.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: '#CCFBF1' }}>
                                        <td colSpan={3} className="text-right font-bold">Grand Total:</td>
                                        <td className="currency font-bold">{formatCurrency(calculateTotal())}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div className="mt-3">
                                <button className="btn btn-primary" onClick={handleExportPDF} disabled={products.length === 0}>
                                    <Download size={14} /> Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default SalesInvoice;
