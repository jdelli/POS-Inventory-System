import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import Receipt from './Props/Receipt';
import BarcodeScanner from '@/Components/BarcodeScanner';
import axios from 'axios';
import {
    Receipt as ReceiptIcon,
    Plus,
    Minus,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Trash2,
    Search,
    ShoppingCart,
    Camera,
    Wifi,
    HardDrive,
    Bell,
    Settings,
    Radio,
    Fingerprint,
    Package,
    Grid3X3,
    List
} from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    product_code: string;
    category: string;
    image_url: string;
}

interface CartItem {
    id: number;
    product_code: string;
    name: string;
    price: number;
    quantity: number;
    maxStock: number;
}

interface SalesOrderItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
}

interface SalesOrder {
    id: number;
    customer_name: string;
    receipt_number: string;
    date: string;
    items: SalesOrderItem[];
    payment_method: string;
}

interface Auth {
    user: { name: string };
}

const categoryOptions = [
    { name: 'All', icon: Grid3X3 },
    { name: 'Analog/IP Cameras', icon: Camera },
    { name: 'WIFI Cameras', icon: Wifi },
    { name: 'DVR/NVR', icon: HardDrive },
    { name: 'HDD', icon: HardDrive },
    { name: 'Home Alarms', icon: Bell },
    { name: 'Accessories', icon: Settings },
    { name: 'Radios', icon: Radio },
    { name: 'Biometrics', icon: Fingerprint },
];

const POSSalesOrder: React.FC<{ auth: Auth }> = ({ auth }) => {
    // View state
    const [viewMode, setViewMode] = useState<'pos' | 'history'>('pos');

    // POS state
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);

    // Order form state
    const [client, setClient] = useState<string>('');
    const [receiptNumber, setReceiptNumber] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentOption, setPaymentOption] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // History state
    const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
    const [historyPage, setHistoryPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [historyLoading, setHistoryLoading] = useState<boolean>(true);
    const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

    const formatCurrency = (amount: number): string =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateString: string): string =>
        new Date(dateString).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });

    // Fetch products
    const fetchProducts = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await apiService.get('/fetch-products-by-branch', {
                params: { user_name: auth.user.name, page, limit: 50 },
            });
            const branchData = response.data.branch;
            setProducts(Array.isArray(branchData.data) ? branchData.data : []);
            setCurrentPage(response.data.current_page || 1);
            setLastPage(response.data.last_page || 1);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch sales history
    const fetchSalesReceipts = async () => {
        setHistoryLoading(true);
        try {
            let url = `/fetch-sales-orders?sort_by=date&page=${historyPage}&limit=10&user_name=${auth.user.name}`;
            if (selectedMonth) url += `&month=${selectedMonth}`;
            if (selectedYear) url += `&year=${selectedYear}`;
            const response = await apiService.get(url);
            setFilteredOrders(response.data.salesOrders);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [auth.user.name]);

    useEffect(() => {
        if (viewMode === 'history') {
            fetchSalesReceipts();
        }
    }, [historyPage, selectedMonth, selectedYear, viewMode]);

    // Filter products by category and search
    const filteredProducts = products.filter((product) => {
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Cart functions
    const addToCart = (product: Product) => {
        const existingItem = cart.find((item) => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.quantity) {
                setCart(cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
        } else {
            if (product.quantity > 0) {
                setCart([...cart, {
                    id: product.id,
                    product_code: product.product_code,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    maxStock: product.quantity,
                }]);
            }
        }
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map((item) =>
                item.id === productId
                    ? { ...item, quantity: Math.min(newQuantity, item.maxStock) }
                    : item
            ));
        }
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setClient('');
        setReceiptNumber('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentOption('');
    };

    const calculateTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    // Submit order
    const submitSalesOrder = async () => {
        if (isSubmitting) return;
        if (!client || !receiptNumber || !date || !paymentOption || cart.length === 0) {
            alert('Please fill in all fields and add items to cart.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await apiService.post('/add-sales-order', {
                customer_name: client,
                receipt_number: receiptNumber,
                date,
                payment_option: paymentOption,
                items: cart.map((item) => ({
                    id: item.id,
                    product_code: item.product_code,
                    product_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity,
                })),
                branch_id: auth.user.name,
            });
            if (!response.data.success) throw new Error(response.data.message);
            alert('Sales order submitted successfully!');
            clearCart();
            fetchProducts();
        } catch (error: any) {
            alert(axios.isAxiosError(error)
                ? error.response?.data?.message || 'Error'
                : error.message || 'Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const viewOrderDetails = (order: SalesOrder) => {
        setSelectedOrder(order);
        setIsOrderDetailModalOpen(true);
    };

    const closeOrderDetailModal = () => {
        setIsOrderDetailModalOpen(false);
        setSelectedOrder(null);
    };

    const getStockBadge = (qty: number) => {
        if (qty <= 0) return 'pos-stock-out';
        if (qty <= 10) return 'pos-stock-low';
        return 'pos-stock-ok';
    };

    const handleScan = (code: string) => {
        const product = products.find(p => p.product_code === code);
        if (product) {
            if (product.quantity > 0) {
                addToCart(product);
                setIsScannerOpen(false);
            } else {
                alert('Product is out of stock');
                setIsScannerOpen(false);
            }
        } else {
            alert('Product not found on current page');
            setIsScannerOpen(false);
        }
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Order</h2>}>
            <Head title="Sales Order" />
            <SharedStyles />

            <div className="pos-container">
                {/* Header with view toggle */}
                <div className="pos-header">
                    <h1 className="page-title">
                        <ReceiptIcon size={20} />
                        Sales Order
                    </h1>
                    <div className="pos-view-toggle">
                        <button
                            className={`pos-toggle-btn ${viewMode === 'pos' ? 'active' : ''}`}
                            onClick={() => setViewMode('pos')}
                        >
                            <ShoppingCart size={14} /> POS
                        </button>
                        <button
                            className={`pos-toggle-btn ${viewMode === 'history' ? 'active' : ''}`}
                            onClick={() => setViewMode('history')}
                        >
                            <List size={14} /> History
                        </button>
                    </div>
                </div>

                {viewMode === 'pos' ? (
                    <div className="pos-layout">
                        {/* Left Panel - Products */}
                        <div className="pos-products-panel">
                            {/* Search Bar */}
                            <div className="pos-search">
                                <Search size={16} className="pos-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search products by name or code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pos-search-input"
                                />
                                {searchTerm && (
                                    <button className="pos-search-clear" onClick={() => setSearchTerm('')}>
                                        <X size={14} />
                                    </button>
                                )}
                                <button className="pos-search-scan ml-2 p-1 text-gray-500 hover:text-gray-700" onClick={() => setIsScannerOpen(true)} title="Scan Barcode">
                                    <Camera size={18} />
                                </button>
                            </div>

                            {/* Category Tabs */}
                            <div className="pos-categories">
                                {categoryOptions.map((cat) => {
                                    const IconComponent = cat.icon;
                                    return (
                                        <button
                                            key={cat.name}
                                            className={`pos-category-btn ${activeCategory === cat.name ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(cat.name)}
                                        >
                                            <IconComponent size={14} />
                                            <span>{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Products Grid */}
                            <div className="pos-products-grid">
                                {loading ? (
                                    <div className="pos-loading">
                                        <div className="spinner"></div>
                                        <span>Loading products...</span>
                                    </div>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className={`pos-product-card ${product.quantity <= 0 ? 'out-of-stock' : ''}`}
                                            onClick={() => product.quantity > 0 && addToCart(product)}
                                        >
                                            <div className="pos-product-image">
                                                <img
                                                    src={product.image_url || 'https://via.placeholder.com/150x100?text=No+Image'}
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x100?text=No+Image';
                                                    }}
                                                />
                                                <span className={`pos-stock-badge ${getStockBadge(product.quantity)}`}>
                                                    {product.quantity <= 0 ? 'OUT' : product.quantity}
                                                </span>
                                            </div>
                                            <div className="pos-product-info">
                                                <span className="pos-product-code">{product.product_code}</span>
                                                <h4 className="pos-product-name">{product.name}</h4>
                                                <span className="pos-product-price">{formatCurrency(product.price)}</span>
                                            </div>
                                            {product.quantity > 0 && (
                                                <div className="pos-product-add">
                                                    <Plus size={16} />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="pos-empty">
                                        <Package size={32} />
                                        <span>No products found</span>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {lastPage > 1 && (
                                <div className="pos-pagination">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => fetchProducts(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="pagination-info">Page {currentPage} of {lastPage}</span>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => fetchProducts(currentPage + 1)}
                                        disabled={currentPage === lastPage}
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Cart */}
                        <div className="pos-cart-panel">
                            <div className="pos-cart-header">
                                <h3>
                                    <ShoppingCart size={16} />
                                    Cart
                                    {cartItemCount > 0 && (
                                        <span className="pos-cart-count">{cartItemCount}</span>
                                    )}
                                </h3>
                                {cart.length > 0 && (
                                    <button className="pos-clear-btn" onClick={clearCart}>
                                        <Trash2 size={12} /> Clear
                                    </button>
                                )}
                            </div>

                            {/* Cart Items */}
                            <div className="pos-cart-items">
                                {cart.length > 0 ? (
                                    cart.map((item) => (
                                        <div key={item.id} className="pos-cart-item">
                                            <div className="pos-cart-item-info">
                                                <span className="pos-cart-item-name">{item.name}</span>
                                                <span className="pos-cart-item-price">{formatCurrency(item.price)}</span>
                                            </div>
                                            <div className="pos-cart-item-controls">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                    <Minus size={12} />
                                                </button>
                                                <span className="pos-cart-item-qty">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.maxStock}>
                                                    <Plus size={12} />
                                                </button>
                                                <button className="pos-remove-btn" onClick={() => removeFromCart(item.id)}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <div className="pos-cart-item-subtotal">
                                                {formatCurrency(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="pos-cart-empty">
                                        <ShoppingCart size={24} />
                                        <span>Cart is empty</span>
                                        <small>Click products to add</small>
                                    </div>
                                )}
                            </div>

                            {/* Order Form */}
                            <div className="pos-order-form">
                                <div className="pos-form-row">
                                    <div className="pos-form-group">
                                        <label>Customer Name</label>
                                        <input
                                            type="text"
                                            value={client}
                                            onChange={(e) => setClient(e.target.value)}
                                            placeholder="Enter name"
                                        />
                                    </div>
                                    <div className="pos-form-group">
                                        <label>Receipt #</label>
                                        <input
                                            type="text"
                                            value={receiptNumber}
                                            onChange={(e) => setReceiptNumber(e.target.value)}
                                            placeholder="Receipt no."
                                        />
                                    </div>
                                </div>
                                <div className="pos-form-row">
                                    <div className="pos-form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="pos-form-group">
                                        <label>Payment</label>
                                        <select
                                            value={paymentOption}
                                            onChange={(e) => setPaymentOption(e.target.value)}
                                        >
                                            <option value="" disabled>Select</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Gcash">Gcash</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Cart Footer */}
                            <div className="pos-cart-footer">
                                <div className="pos-cart-total">
                                    <span>Total</span>
                                    <span className="pos-total-amount">{formatCurrency(calculateTotal())}</span>
                                </div>
                                <button
                                    className="pos-checkout-btn"
                                    onClick={submitSalesOrder}
                                    disabled={isSubmitting || cart.length === 0}
                                >
                                    {isSubmitting ? 'Processing...' : 'Complete Sale'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* History View */
                    <div className="user-page" style={{ padding: 0 }}>
                        <div className="filter-bar">
                            <select
                                className="form-control form-select"
                                value={selectedMonth ?? ''}
                                onChange={(e) => { setSelectedMonth(parseInt(e.target.value) || null); setHistoryPage(1); }}
                                style={{ width: 140 }}
                            >
                                <option value="">All Months</option>
                                {months.map((month, i) => <option key={i} value={i + 1}>{month}</option>)}
                            </select>
                            <select
                                className="form-control form-select"
                                value={selectedYear ?? ''}
                                onChange={(e) => { setSelectedYear(parseInt(e.target.value) || null); setHistoryPage(1); }}
                                style={{ width: 100 }}
                            >
                                <option value="">All Years</option>
                                {years.map((year) => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{filteredOrders.length} orders</span>
                        </div>

                        <div className="table-container">
                            {historyLoading ? (
                                <div className="loading"><div className="spinner"></div>Loading...</div>
                            ) : (
                                <>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Receipt #</th>
                                                <th>Customer</th>
                                                <th>Items</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.length > 0 ? filteredOrders.map((entry) => (
                                                <tr key={entry.id}>
                                                    <td>{formatDate(entry.date)}</td>
                                                    <td><span className="code">{entry.receipt_number}</span></td>
                                                    <td style={{ fontWeight: 500 }}>{entry.customer_name}</td>
                                                    <td><span className="badge badge-primary">{entry.items.length}</span></td>
                                                    <td>
                                                        <button className="btn btn-sm btn-primary" onClick={() => viewOrderDetails(entry)}>
                                                            <Eye size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5}>
                                                        <div className="empty-state">
                                                            <ReceiptIcon size={24} />
                                                            <div className="empty-state-text">No records</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    {totalPages > 1 && (
                                        <div className="pagination">
                                            <button className="btn btn-sm btn-secondary" onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1}>
                                                <ChevronLeft size={14} />
                                            </button>
                                            <span className="pagination-info">Page {historyPage} of {totalPages}</span>
                                            <button className="btn btn-sm btn-secondary" onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))} disabled={historyPage === totalPages}>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isOrderDetailModalOpen && selectedOrder && (
                <Receipt isOpen={isOrderDetailModalOpen} onClose={closeOrderDetailModal} selectedOrder={selectedOrder} />
            )}

            {isScannerOpen && (
                <BarcodeScanner
                    onDetected={handleScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </AuthenticatedLayout>
    );
};

export default POSSalesOrder;
