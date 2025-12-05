import React, { useEffect, useState } from "react";
import { usePage, Head } from "@inertiajs/react";
import axios from "axios";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import apiService from './Services/ApiService';
import { BarChart3, Eye, Printer, X, Plus, Trash2, ChevronLeft, ChevronRight, Wallet, Check, AlertCircle } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface SalesOrderItem { product_code: string; product_name: string; quantity: number; price: number; }
interface SalesOrder { id: number; receipt_number: string; customer_name: string; date: string; items: SalesOrderItem[]; total_sales: number; payment_method: string; }
interface Product { product_code: string; product_name: string; total_quantity_sold: number; total_sales: number; category: string; }
interface Remittance { id: number; date_start: string; date_end: string; total_sales: number; total_cash: number; total_expenses: number; remaining_cash: number; cash_breakdown: string; expenses?: { particular: string; amount: number }[]; status: 'Pending' | 'Received' | 'Rejected'; online_payments: number; }

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
    const [grandTotal, setGrandTotal] = useState<number>(0);
    const [isCashBreakdownModalOpen, setIsCashBreakdownModalOpen] = useState(false);
    const [cashBreakdown, setCashBreakdown] = useState<{ [key: number]: number }>({});
    const [expenses, setExpenses] = useState<{ particular: string; amount: number }[]>([]);
    const [totalSales, setTotalSales] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [remittances, setRemittances] = useState<Remittance[]>([]);
    const [isRemittanceModalOpen, setIsRemittanceModalOpen] = useState(false);
    const [selectedRemittance, setSelectedRemittance] = useState<Remittance | null>(null);
    const [onlinePayments, setOnlinePayments] = useState(0);
    const [totalSalesAmount, setTotalSalesAmount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPageRemittances, setCurrentPageRemittances] = useState(1);
    const [totalPagesRemittances, setTotalPagesRemittances] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalExpensesAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const remainingCash = totalSales - totalExpensesAmount;

    const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    useEffect(() => {
        if (!auth?.user?.name) return;
        apiService.get("/sales-report/daily", { params: { user_name: auth.user.name, page: currentPage } })
            .then((response) => { setSalesData(response.data.data); setTotalPages(response.data.last_page); })
            .catch((error) => console.error("Error:", error));
    }, [auth?.user?.name, currentPage]);

    const fetchRemittances = async () => {
        try {
            const response = await apiService.get("/cash-breakdowns", { params: { branch_id: auth.user.name, page: currentPageRemittances } });
            if (response.data.success) { setRemittances(response.data.data || []); setTotalPagesRemittances(response.data.last_page); }
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => { fetchRemittances(); }, [currentPageRemittances]);

    const handleViewDetails = async (id: number) => {
        try {
            const response = await apiService.get(`/cash-breakdowns/${id}`, { params: { branch_id: auth.user.name } });
            if (response.data.success) {
                setSelectedRemittance({ ...response.data.data, expenses: typeof response.data.data.expenses === "string" ? JSON.parse(response.data.data.expenses) : response.data.data.expenses || [] });
                setIsRemittanceModalOpen(true);
            }
        } catch (error) { console.error("Error:", error); }
    };

    const submitCashBreakdown = async () => {
        setIsSubmitting(true);
        try {
            await apiService.post("/cash-breakdowns", { user_name: auth.user.name, date_start: startDate, date_end: endDate, total_sales: totalSalesAmount, cash_breakdown: cashBreakdown, total_cash: totalSales, expenses, total_expenses: totalExpensesAmount, remaining_cash: remainingCash, online_payments: onlinePayments });
            setIsCashBreakdownModalOpen(false);
            fetchRemittances();
            resetCashBreakdownForm();
        } catch (error) { console.error("Error:", error); } finally { setIsSubmitting(false); }
    };

    const resetCashBreakdownForm = () => { setStartDate(''); setEndDate(''); setTotalSalesAmount(0); setCashBreakdown({}); setTotalSales(0); setExpenses([]); setOnlinePayments(0); };

    const fetchTotalSales = async () => {
        if (!startDate || !endDate) return;
        try {
            const response = await fetch(`/api/sales-total?start_date=${startDate}&end_date=${endDate}&user_name=${auth.user.name}`);
            const data = await response.json();
            setTotalSales(data.cash_sales); setOnlinePayments(data.online_sales); setTotalSalesAmount(data.total_sales);
        } catch (error) { console.error("Error:", error); }
    };

    const deleteCashBreakdown = async (id: number) => {
        try { await apiService.delete(`/cash-breakdowns/${id}`); fetchRemittances(); } catch (error) { console.error("Error:", error); }
    };

    const handleOpenModal = (date: string) => {
        setLoading(true);
        axios.get(`/api/sales-orders-by-date?date=${date}`, { params: { user_name: auth.user.name } })
            .then((response) => setSelectedSalesOrder(response.data))
            .finally(() => setLoading(false));
        setIsModalOpen(true);
    };

    const fetchMonthlySales = async () => {
        try {
            const response = await apiService.get("/fetch-monthly-sales", { params: { month: selectedMonth, year: selectedYear, user_name: auth.user.name } });
            if (Array.isArray(response.data.monthlySales)) {
                setMonthlySales(response.data.monthlySales.sort((a: Product, b: Product) => b.total_quantity_sold - a.total_quantity_sold));
                setGrandTotal(response.data.grandTotal);
            }
        } catch (error) { console.error("Error:", error); }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'Received') return 'badge-success';
        if (status === 'Rejected') return 'badge-danger';
        return 'badge-warning';
    };

    const totalCash = Object.entries(cashBreakdown).reduce((sum, [denom, qty]) => sum + parseInt(denom) * qty, 0);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Report</h2>}>
            <Head title="Sales Report" />
            <SharedStyles />

            <div className="user-page">
                <div className="page-header">
                    <h1 className="page-title"><BarChart3 size={20} />Sales Report</h1>
                    <div className="flex gap-2">
                        <button className="btn btn-success" onClick={() => { setIsSalesModalOpen(true); fetchMonthlySales(); }}>Monthly Sales</button>
                        <button className="btn btn-primary" onClick={() => setIsCashBreakdownModalOpen(true)}><Wallet size={14} /> Remittance</button>
                    </div>
                </div>

                {/* Chart */}
                <div className="chart-panel mb-3">
                    <div className="chart-title"><BarChart3 size={14} />Daily Sales Overview</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-15} textAnchor="end" height={50} />
                            <YAxis tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#6B7280' }} />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), "Sales"]} contentStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="total_sales" fill="#0F766E" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tables Grid */}
                <div className="grid-2">
                    {/* Daily Sales Table */}
                    <div className="table-container">
                        <div className="panel-header">Daily Sales Report</div>
                        <table className="data-table">
                            <thead><tr><th>#</th><th>Date</th><th>Total</th><th>Action</th></tr></thead>
                            <tbody>
                                {salesData.length > 0 ? salesData.map((data, i) => (
                                    <tr key={data.date}>
                                        <td>{(currentPage - 1) * 10 + i + 1}</td>
                                        <td>{data.date}</td>
                                        <td className="currency">{formatCurrency(data.total_sales || 0)}</td>
                                        <td><button className="btn btn-sm btn-primary" onClick={() => handleOpenModal(data.date)}><Eye size={12} /></button></td>
                                    </tr>
                                )) : <tr><td colSpan={4}><div className="empty-state"><BarChart3 size={24} /><div className="empty-state-text">No data</div></div></td></tr>}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
                            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                            <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
                        </div>
                    </div>

                    {/* Remittance Table */}
                    <div className="table-container">
                        <div className="panel-header">Remittance</div>
                        <table className="data-table">
                            <thead><tr><th>Start</th><th>End</th><th>Sales</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {remittances.length > 0 ? remittances.map((remit) => (
                                    <tr key={remit.id}>
                                        <td>{remit.date_start}</td>
                                        <td>{remit.date_end}</td>
                                        <td className="currency">{formatCurrency(remit.total_sales || 0)}</td>
                                        <td><span className={`badge ${getStatusBadge(remit.status)}`}>{remit.status}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleViewDetails(remit.id)}><Eye size={12} /></button>
                                                {remit.status !== 'Received' && <button className="btn btn-sm btn-danger btn-icon" onClick={() => deleteCashBreakdown(remit.id)}><Trash2 size={12} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={5}><div className="empty-state"><Wallet size={24} /><div className="empty-state-text">No data</div></div></td></tr>}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPageRemittances(p => Math.max(1, p-1))} disabled={currentPageRemittances === 1}><ChevronLeft size={14} /></button>
                            <span className="pagination-info">Page {currentPageRemittances} of {totalPagesRemittances}</span>
                            <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPageRemittances(p => Math.min(totalPagesRemittances, p+1))} disabled={currentPageRemittances === totalPagesRemittances}><ChevronRight size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Sales Modal */}
            {isModalOpen && selectedSalesOrder.length > 0 && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Sales - {selectedSalesOrder[0].date}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            {loading ? <div className="loading"><div className="spinner"></div></div> : (
                                <table className="data-table">
                                    <thead><tr><th>#</th><th>Receipt</th><th>Customer</th><th>Total</th><th>Payment</th></tr></thead>
                                    <tbody>
                                        {selectedSalesOrder.map((order, i) => (
                                            <tr key={order.id}>
                                                <td>{i + 1}</td>
                                                <td><span className="code">{order.receipt_number}</span></td>
                                                <td>{order.customer_name}</td>
                                                <td className="currency">{formatCurrency(order.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</td>
                                                <td><span className="badge badge-info">{order.payment_method}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#CCFBF1' }}>
                                            <td colSpan={3} className="text-right font-bold">Grand Total:</td>
                                            <td className="currency font-bold">{formatCurrency(selectedSalesOrder.reduce((acc, o) => acc + o.items.reduce((a, i) => a + i.price * i.quantity, 0), 0))}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Sales Modal */}
            {isSalesModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsSalesModalOpen(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Monthly Sales Report</h3>
                            <button className="modal-close" onClick={() => setIsSalesModalOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="flex gap-2 mb-3">
                                <select className="form-control form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={{ width: 130 }}>
                                    {[...Array(12)].map((_, m) => <option key={m} value={m + 1}>{new Date(0, m).toLocaleString("default", { month: "long" })}</option>)}
                                </select>
                                <select className="form-control form-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ width: 100 }}>
                                    {[...Array(10)].map((_, y) => <option key={y} value={new Date().getFullYear() - 5 + y}>{new Date().getFullYear() - 5 + y}</option>)}
                                </select>
                                <button className="btn btn-primary" onClick={fetchMonthlySales}>Filter</button>
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Product</th><th>Qty Sold</th><th>Total</th></tr></thead>
                                <tbody>
                                    {monthlySales.length > 0 ? monthlySales.map((p) => (
                                        <tr key={p.product_code}>
                                            <td>{p.product_name}</td>
                                            <td className="font-bold text-primary">{p.total_quantity_sold.toLocaleString()}</td>
                                            <td className="currency">{formatCurrency(p.total_sales || 0)}</td>
                                        </tr>
                                    )) : <tr><td colSpan={3}><div className="empty-state"><BarChart3 size={24} /><div className="empty-state-text">No data</div></div></td></tr>}
                                </tbody>
                            </table>
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#CCFBF1', borderRadius: 3, textAlign: 'right', fontWeight: 700 }}>
                                Grand Total: {formatCurrency(grandTotal || 0)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remittance Details Modal */}
            {isRemittanceModalOpen && selectedRemittance && (
                <div className="modal-backdrop" onClick={() => setIsRemittanceModalOpen(false)}>
                    <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Remittance Details</h3>
                            <button className="modal-close" onClick={() => setIsRemittanceModalOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="info-grid mb-3">
                                <div className="info-item"><div className="info-label">Date From</div><div className="info-value">{selectedRemittance.date_start}</div></div>
                                <div className="info-item"><div className="info-label">Date To</div><div className="info-value">{selectedRemittance.date_end}</div></div>
                                <div className="info-item"><div className="info-label">Total Sales</div><div className="info-value currency">{formatCurrency(selectedRemittance.total_sales || 0)}</div></div>
                                <div className="info-item"><div className="info-label">Cash</div><div className="info-value">{formatCurrency(selectedRemittance.total_cash || 0)}</div></div>
                                <div className="info-item"><div className="info-label">Online</div><div className="info-value">{formatCurrency(selectedRemittance.online_payments || 0)}</div></div>
                                <div className="info-item"><div className="info-label">Expenses</div><div className="info-value text-danger">{Array.isArray(selectedRemittance.expenses) ? formatCurrency(selectedRemittance.expenses.reduce((s, e) => s + Number(e.amount), 0)) : '₱0'}</div></div>
                            </div>
                            <div className="info-item mb-3" style={{ background: '#CCFBF1' }}><div className="info-label">Remaining Cash</div><div className="info-value text-primary font-bold">{formatCurrency(selectedRemittance.remaining_cash || 0)}</div></div>
                            <table className="data-table">
                                <thead><tr><th>Denomination</th><th>Qty</th></tr></thead>
                                <tbody>
                                    {Object.entries(JSON.parse(selectedRemittance.cash_breakdown) as Record<string, number>).map(([denom, count]) => (
                                        <tr key={denom}><td>{denom}</td><td>{count}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Cash Breakdown Modal */}
            {isCashBreakdownModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsCashBreakdownModalOpen(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Cash Breakdown</h3>
                            <button className="modal-close" onClick={() => setIsCashBreakdownModalOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="flex gap-2 mb-3">
                                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                <button className="btn btn-primary" onClick={fetchTotalSales}>Get Sales</button>
                            </div>

                            <div className="grid-3 mb-3">
                                {[1000, 500, 200, 100, 50, 20, 10, 5, 1].map((denom) => (
                                    <div key={denom} className="form-group">
                                        <label className="form-label">₱{denom}</label>
                                        <input type="number" min="0" className="form-control" value={cashBreakdown[denom] || ''} onChange={(e) => setCashBreakdown({ ...cashBreakdown, [denom]: parseInt(e.target.value) || 0 })} />
                                    </div>
                                ))}
                            </div>

                            <div className="info-item mb-3"><div className="info-label">Cash Total</div><div className="info-value">{formatCurrency(totalCash)}</div></div>

                            <div className="panel-header flex-between mb-2"><span>Expenses</span><button className="btn btn-sm btn-primary" onClick={() => setExpenses([...expenses, { particular: '', amount: 0 }])}><Plus size={12} /> Add</button></div>
                            {expenses.map((exp, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input type="text" className="form-control" placeholder="Particular" value={exp.particular} onChange={(e) => setExpenses(expenses.map((x, j) => j === i ? { ...x, particular: e.target.value } : x))} style={{ flex: 1 }} />
                                    <input type="number" className="form-control" placeholder="Amount" value={exp.amount || ''} onChange={(e) => setExpenses(expenses.map((x, j) => j === i ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} style={{ width: 120 }} />
                                    <button className="btn btn-sm btn-danger btn-icon" onClick={() => setExpenses(expenses.filter((_, j) => j !== i))}><Trash2 size={12} /></button>
                                </div>
                            ))}

                            <div className="grid-2 mt-3">
                                <div className="info-item"><div className="info-label">Cash Sales</div><div className="info-value">{formatCurrency(totalSales)}</div></div>
                                <div className="info-item"><div className="info-label">Online Sales</div><div className="info-value">{formatCurrency(onlinePayments)}</div></div>
                                <div className="info-item"><div className="info-label">Total Expenses</div><div className="info-value text-danger">{formatCurrency(totalExpensesAmount)}</div></div>
                                <div className="info-item" style={{ background: '#FEF3C7' }}><div className="info-label">Remaining Cash</div><div className="info-value">{formatCurrency(remainingCash)}</div></div>
                            </div>
                            <div className="info-item mt-2" style={{ background: '#CCFBF1' }}><div className="info-label">Total Sales</div><div className="info-value font-bold">{formatCurrency(totalSalesAmount)}</div></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsCashBreakdownModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitCashBreakdown} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default DailySalesReport;
