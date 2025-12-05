import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import apiService from './Services/ApiService';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Product {
    product_code: string;
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    image_url: string;
}

const categoryOptions = [
    'Analog/IP Cameras',
    'WIFI Cameras',
    'DVR/NVR',
    'HDD',
    'Home Alarms',
    'Accessories',
    'Radios',
    'Biometrics',
];

const ProductTable: React.FC = () => {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const fetchProducts = async (userName: string, page: number = 1) => {
        setLoading(true);
        try {
            const response = await apiService.get(`/fetch-products-by-branch`, {
                params: { user_name: userName, page, limit: 20 },
            });
            const branchData = response.data.branch;
            setProducts(Array.isArray(branchData.data) ? branchData.data : []);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(auth.user.name);
    }, [auth.user.name]);

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterCategory ? product.category === filterCategory : true)
    );

    const getStockBadge = (qty: number) => {
        if (qty <= 10) return 'badge-danger';
        if (qty <= 30) return 'badge-warning';
        return 'badge-success';
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Stocks</h2>}>
            <Head title="Manage Stocks" />
            <SharedStyles />

            <div className="user-page">
                <div className="page-header">
                    <h1 className="page-title">
                        <Package size={20} />
                        Stock Overview
                    </h1>
                </div>

                <div className="filter-bar">
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 28 }}
                        />
                    </div>
                    <select
                        className="form-control form-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ width: 180 }}
                    >
                        <option value="">All Categories</option>
                        {categoryOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{filteredProducts.length} products</span>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <span>Loading products...</span>
                        </div>
                    ) : (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <img src={product.image_url} alt={product.name} className="thumb" />
                                                </td>
                                                <td><span className="code">{product.product_code}</span></td>
                                                <td style={{ fontWeight: 500 }}>{product.name}</td>
                                                <td><span className="badge badge-gray">{product.category}</span></td>
                                                <td className="currency">{formatCurrency(product.price)}</td>
                                                <td><span className={`badge ${getStockBadge(product.quantity)}`}>{product.quantity}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="empty-state">
                                                    <Package size={32} />
                                                    <div className="empty-state-text">No products found</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {lastPage > 1 && (
                                <div className="pagination">
                                    <button className="btn btn-sm btn-secondary" onClick={() => fetchProducts(auth.user.name, currentPage - 1)} disabled={currentPage === 1}>
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="pagination-info">Page {currentPage} of {lastPage}</span>
                                    <button className="btn btn-sm btn-secondary" onClick={() => fetchProducts(auth.user.name, currentPage + 1)} disabled={currentPage === lastPage}>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProductTable;
