import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import ViewItemsModal from './Props/ViewDelivery';
import RequestStocks from './Props/RequestStocks';
import { Package, Eye, ChevronLeft, ChevronRight, FileBox } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface DeliveryItem { id: number; product_name: string; quantity: number; date: string; }
interface StockEntry { id: number; delivery_number: string; delivered_by: string; date: string; items: DeliveryItem[]; }
interface Auth { user: { name: string } }

const StockEntriesTable: React.FC<{ auth: Auth }> = ({ auth }) => {
    const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>([]);
    const [isRequestStockModalOpen, setIsRequestStockModalOpen] = useState<boolean>(false);

    const fetchDeliveryReceipts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort_by: 'date', page: page.toString(), per_page: '10', user_name: auth.user.name,
                month: selectedMonth ? selectedMonth.toString() : '', year: selectedYear ? selectedYear.toString() : '',
            });
            const response = await apiService.get(`/fetch-delivery-receipts?${params.toString()}`);
            setStockEntries(response.data.deliveryReceipts);
            setTotalPages(response.data.last_page);
        } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchDeliveryReceipts(); }, [page, selectedMonth, selectedYear]);

    const openModal = (items: DeliveryItem[]) => { setSelectedItems(items); setModalOpen(true); };
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stocks Entries</h2>}>
            <Head title="Stock Entries" />
            <SharedStyles />

            <div className="user-page">
                <div className="page-header">
                    <h1 className="page-title"><Package size={20} />Stock Entries</h1>
                    <button className="btn btn-success" onClick={() => setIsRequestStockModalOpen(true)}>
                        <FileBox size={14} /> Request Stock
                    </button>
                </div>

                <div className="filter-bar">
                    <select className="form-control form-select" value={selectedMonth ?? ''} onChange={(e) => { setSelectedMonth(parseInt(e.target.value) || null); setPage(1); }} style={{ width: 140 }}>
                        <option value="">All Months</option>
                        {months.map((month, i) => <option key={i} value={i + 1}>{month}</option>)}
                    </select>
                    <select className="form-control form-select" value={selectedYear ?? ''} onChange={(e) => { setSelectedYear(parseInt(e.target.value) || null); setPage(1); }} style={{ width: 100 }}>
                        <option value="">All Years</option>
                        {years.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{stockEntries.length} entries</span>
                </div>

                <div className="table-container">
                    {loading ? <div className="loading"><div className="spinner"></div>Loading...</div> : (
                        <>
                            <table className="data-table">
                                <thead><tr><th>DR No.</th><th>Delivered By</th><th>Date</th><th>Items</th><th>Action</th></tr></thead>
                                <tbody>
                                    {stockEntries.length > 0 ? stockEntries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td><span className="code">{entry.delivery_number}</span></td>
                                            <td style={{ fontWeight: 500 }}>{entry.delivered_by}</td>
                                            <td>{formatDate(entry.date)}</td>
                                            <td><span className="badge badge-primary">{entry.items.length}</span></td>
                                            <td><button className="btn btn-sm btn-primary" onClick={() => openModal(entry.items)}><Eye size={14} /> View</button></td>
                                        </tr>
                                    )) : <tr><td colSpan={5}><div className="empty-state"><Package size={24} /><div className="empty-state-text">No records</div></div></td></tr>}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
                                    <span className="pagination-info">Page {page} of {totalPages}</span>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <ViewItemsModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} items={selectedItems} />
            <RequestStocks isOpen={isRequestStockModalOpen} onClose={() => setIsRequestStockModalOpen(false)} auth={auth} />
        </AuthenticatedLayout>
    );
};

export default StockEntriesTable;
