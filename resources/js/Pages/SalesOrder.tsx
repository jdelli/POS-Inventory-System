import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import Receipt from './Props/Receipt';
import axios from 'axios';
import { Receipt as ReceiptIcon, Plus, Eye, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface InventoryItem { id: number; name: string; quantity: number; price: number; }
interface Item { product_code: string; name: string; price: number; quantity: number; id: number; }
interface SalesOrderItem { id: number; product_name: string; price: number; quantity: number; }
interface SalesOrder { id: number; customer_name: string; receipt_number: string; date: string; items: SalesOrderItem[]; payment_method: string; }
interface Auth { user: { name: string } }

const InventoryManagement: React.FC<{ auth: Auth }> = ({ auth }) => {
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
    const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState<boolean>(false);
    const [receiptItems, setReceiptItems] = useState<Item[]>([{ product_code: '', name: '', price: 0, quantity: 0, id: 0 }]);
    const [productSuggestions, setProductSuggestions] = useState<InventoryItem[][]>([]);
    const [searchTerms, setSearchTerms] = useState<string[]>(['']);
    const [client, setClient] = useState<string>('');
    const [receiptNumber, setReceiptNumber] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [paymentOption, setPaymentOption] = useState<string>('');

    const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    const openReceiptModal = () => setIsReceiptModalOpen(true);
    const closeReceiptModal = () => { setIsReceiptModalOpen(false); resetReceiptForm(); };
    const closeOrderDetailModal = () => { setIsOrderDetailModalOpen(false); setSelectedOrder(null); };
    const resetReceiptForm = () => { setReceiptItems([{ product_code: '', name: '', price: 0, quantity: 0, id: 0 }]); setProductSuggestions([]); setSearchTerms(['']); setClient(''); setReceiptNumber(''); setDate(''); setPaymentOption(''); };
    const handleItemChange = (index: number, field: string, value: string | number) => { setReceiptItems(receiptItems.map((item, i) => i === index ? { ...item, [field]: field === 'price' || field === 'quantity' ? parseFloat(value as string) : value } : item)); };
    const addReceiptItem = () => { setReceiptItems([...receiptItems, { product_code: '', name: '', price: 0, quantity: 0, id: 0 }]); setProductSuggestions([...productSuggestions, []]); setSearchTerms([...searchTerms, '']); };
    const removeReceiptItem = (index: number) => setReceiptItems(receiptItems.filter((_, i) => i !== index));
    const viewOrderDetails = (order: SalesOrder) => { setSelectedOrder(order); setIsOrderDetailModalOpen(true); };
    const calculateTotal = () => receiptItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const handleSearchTermChange = (index: number, value: string) => { setSearchTerms(searchTerms.map((t, i) => i === index ? value : t)); handleItemChange(index, 'name', value); };

    const handleSuggestionClick = (index: number, product: any) => {
        setReceiptItems(receiptItems.map((item, i) => i === index ? { ...item, id: product.id, name: product.name, price: product.price, product_code: product.product_code } : item));
        setSearchTerms(searchTerms.map((t, i) => i === index ? '' : t));
        setProductSuggestions(productSuggestions.map((s, i) => i === index ? [] : s));
    };

    const submitSalesOrder = async () => {
        if (isSubmitting) return;
        if (!client || !receiptNumber || !date || !paymentOption || receiptItems.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) { alert('Please fill in all fields correctly.'); return; }
        setIsSubmitting(true);
        try {
            const response = await apiService.post('/add-sales-order', { customer_name: client, receipt_number: receiptNumber, date, payment_option: paymentOption, items: receiptItems.map(item => ({ id: item.id, product_code: item.product_code, product_name: item.name, price: item.price, quantity: item.quantity, total: item.price * item.quantity })), branch_id: auth.user.name });
            if (!response.data.success) throw new Error(response.data.message);
            alert('Sales order submitted successfully!');
            closeReceiptModal();
        } catch (error: any) {
            alert(axios.isAxiosError(error) ? error.response?.data?.message || 'Error' : error.message || 'Error');
        } finally { setIsSubmitting(false); fetchSalesReceipts(); }
    };

    useEffect(() => {
        searchTerms.forEach((term, index) => {
            if (term.length > 0) {
                apiService.get('/search-products', { params: { q: term, user_name: auth.user.name } })
                    .then((response) => setProductSuggestions(productSuggestions.map((s, i) => i === index ? response.data : s)))
                    .catch((error) => console.error('Error:', error));
            } else { setProductSuggestions(productSuggestions.map((s, i) => i === index ? [] : s)); }
        });
    }, [searchTerms]);

    const fetchSalesReceipts = async () => {
        setLoading(true);
        try {
            let url = `/fetch-sales-orders?sort_by=date&page=${currentPage}&limit=10&user_name=${auth.user.name}`;
            if (selectedMonth) url += `&month=${selectedMonth}`;
            if (selectedYear) url += `&year=${selectedYear}`;
            const response = await apiService.get(url);
            setFilteredOrders(response.data.salesOrders);
            setTotalPages(response.data.last_page);
        } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchSalesReceipts(); }, [currentPage, selectedMonth, selectedYear]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Order</h2>}>
            <Head title="Sales Order" />
            <SharedStyles />

            <div className="user-page">
                <div className="page-header">
                    <h1 className="page-title"><ReceiptIcon size={20} />Sales Orders</h1>
                    <button className="btn btn-primary" onClick={openReceiptModal}><Plus size={14} /> New Order</button>
                </div>

                <div className="filter-bar">
                    <select className="form-control form-select" value={selectedMonth ?? ''} onChange={(e) => { setSelectedMonth(parseInt(e.target.value) || null); setCurrentPage(1); }} style={{ width: 140 }}>
                        <option value="">All Months</option>
                        {months.map((month, i) => <option key={i} value={i + 1}>{month}</option>)}
                    </select>
                    <select className="form-control form-select" value={selectedYear ?? ''} onChange={(e) => { setSelectedYear(parseInt(e.target.value) || null); setCurrentPage(1); }} style={{ width: 100 }}>
                        <option value="">All Years</option>
                        {years.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{filteredOrders.length} orders</span>
                </div>

                <div className="table-container">
                    {loading ? <div className="loading"><div className="spinner"></div>Loading...</div> : (
                        <>
                            <table className="data-table">
                                <thead><tr><th>Date</th><th>Receipt #</th><th>Customer</th><th>Items</th><th>Action</th></tr></thead>
                                <tbody>
                                    {filteredOrders.length > 0 ? filteredOrders.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{formatDate(entry.date)}</td>
                                            <td><span className="code">{entry.receipt_number}</span></td>
                                            <td style={{ fontWeight: 500 }}>{entry.customer_name}</td>
                                            <td><span className="badge badge-primary">{entry.items.length}</span></td>
                                            <td><button className="btn btn-sm btn-primary" onClick={() => viewOrderDetails(entry)}><Eye size={14} /></button></td>
                                        </tr>
                                    )) : <tr><td colSpan={5}><div className="empty-state"><ReceiptIcon size={24} /><div className="empty-state-text">No records</div></div></td></tr>}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
                                    <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* New Order Modal */}
            {isReceiptModalOpen && (
                <div className="modal-backdrop" onClick={closeReceiptModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">New Sales Order</h3>
                            <button className="modal-close" onClick={closeReceiptModal}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="grid-2 mb-3">
                                <div className="form-group"><label className="form-label">Client Name</label><input type="text" className="form-control" value={client} onChange={(e) => setClient(e.target.value)} required /></div>
                                <div className="form-group"><label className="form-label">Receipt Number</label><input type="text" className="form-control" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} required /></div>
                                <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
                                <div className="form-group">
                                    <label className="form-label">Payment Option</label>
                                    <select className="form-control form-select" value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)} required>
                                        <option value="" disabled>Select</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Gcash">Gcash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>

                            <div className="panel-header flex-between mb-2"><span>Items</span><button className="btn btn-sm btn-primary" onClick={addReceiptItem}><Plus size={12} /> Add</button></div>
                            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {receiptItems.map((item, index) => (
                                    <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'flex-end' }}>
                                        <div style={{ width: 80 }}><label className="form-label">Code</label><input type="text" className="form-control" value={item.product_code} readOnly style={{ background: '#F3F4F6' }} /></div>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <label className="form-label">Item</label>
                                            <input type="text" className="form-control" value={item.name} onChange={(e) => handleSearchTermChange(index, e.target.value)} placeholder="Search..." />
                                            {productSuggestions[index]?.length > 0 && (
                                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #D1D5DB', borderRadius: 3, maxHeight: 120, overflowY: 'auto', zIndex: 10 }}>
                                                    {productSuggestions[index].map((p) => (
                                                        <div key={p.id} onClick={() => handleSuggestionClick(index, p)} style={{ padding: '5px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>{p.name}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ width: 90 }}><label className="form-label">Price</label><input type="number" className="form-control" value={item.price || ''} onChange={(e) => handleItemChange(index, 'price', e.target.value)} /></div>
                                        <div style={{ width: 70 }}><label className="form-label">Qty</label><input type="number" className="form-control" value={item.quantity || ''} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} /></div>
                                        <div style={{ width: 100 }}><label className="form-label">Total</label><div className="form-control currency" style={{ background: '#F3F4F6' }}>{formatCurrency(item.price * item.quantity)}</div></div>
                                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => removeReceiptItem(index)}><Trash2 size={12} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-between mt-3" style={{ padding: '0.5rem', background: '#CCFBF1', borderRadius: 3 }}>
                                <span className="font-bold">Total:</span>
                                <span className="currency font-bold">{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeReceiptModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitSalesOrder} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
                        </div>
                    </div>
                </div>
            )}

            {isOrderDetailModalOpen && selectedOrder && (
                <Receipt isOpen={isOrderDetailModalOpen} onClose={closeOrderDetailModal} selectedOrder={selectedOrder} />
            )}
        </AuthenticatedLayout>
    );
};

export default InventoryManagement;
