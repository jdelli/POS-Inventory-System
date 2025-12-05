import React, { useState, useEffect } from 'react';
import apiService from './Services/ApiService';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ShoppingCart, Eye, X, Check, Forward } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Order {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
    address: string;
    branch: string;
    created_at: string;
    updated_at: string;
    orders: Order[];
}

interface Branch {
    id: number;
    name: string;
}

interface InventoryManagementProps {
    auth: { user: { name: string } };
}

const CustomerOrders: React.FC<InventoryManagementProps> = ({ auth }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [doneCustomers, setDoneCustomers] = useState<number[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await apiService.get('/get-branches');
                setBranches(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/orders', { params: { username: auth.user.name } });
            if (response.data.success) {
                setCustomers(response.data.customers);
            } else {
                throw new Error('Failed to fetch customers.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching customers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const markAsDone = async (customerId: number) => {
        try {
            const response = await apiService.put(`/update-status/${customerId}`);
            if (response.data.success) {
                setDoneCustomers((prev) => [...prev, customerId]);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating customer order status:', error);
        }
        fetchCustomers();
    };

    const updateBranch = async (customerId: number, branch: string) => {
        try {
            const response = await apiService.put(`/update-branch/${customerId}`, { branch });
            if (response.data.success) {
                fetchCustomers();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating branch:', error);
        }
    };

    const openModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSelectedBranch(customer.branch);
        setIsModalOpen(true);
    };

    if (error) {
        return (
            <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Customer Orders</h2>}>
                <Head title="Customer Orders" />
                <SharedStyles />
                <div className="user-page">
                    <div className="empty-state">
                        <div className="text-danger mb-2">{error}</div>
                        <button className="btn btn-primary" onClick={fetchCustomers}>Retry</button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Customer Orders</h2>}>
            <Head title="Customer Orders" />
            <SharedStyles />

            <div className="user-page">
                <div className="page-header">
                    <h1 className="page-title">
                        <ShoppingCart size={20} />
                        Customer Orders
                    </h1>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{customers.length} orders</span>
                </div>

                {loading ? (
                    <div className="loading"><div className="spinner"></div>Loading...</div>
                ) : customers.length > 0 ? (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} style={{ borderLeft: doneCustomers.includes(customer.id) ? '3px solid #059669' : 'none' }}>
                                        <td style={{ fontWeight: 500 }}>{customer.name}</td>
                                        <td>{customer.phone}</td>
                                        <td className="text-muted">{customer.address}</td>
                                        <td><span className="badge badge-primary">{customer.orders.length}</span></td>
                                        <td className="currency">{formatCurrency(customer.orders.reduce((sum, o) => sum + (o.total || 0), 0))}</td>
                                        <td>
                                            <button className="btn btn-sm btn-primary" onClick={() => openModal(customer)}>
                                                <Eye size={14} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <ShoppingCart size={32} />
                        <div className="empty-state-text">No customer orders</div>
                    </div>
                )}
            </div>

            {isModalOpen && selectedCustomer && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Orders for {selectedCustomer.name}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="info-grid mb-3">
                                <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{selectedCustomer.phone}</div></div>
                                <div className="info-item"><div className="info-label">Address</div><div className="info-value">{selectedCustomer.address}</div></div>
                            </div>

                            {selectedCustomer.orders.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                    </thead>
                                    <tbody>
                                        {selectedCustomer.orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.product_name}</td>
                                                <td className="font-bold">{order.quantity}</td>
                                                <td>{formatCurrency(order.price || 0)}</td>
                                                <td className="currency">{formatCurrency(order.total || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#F3F4F6' }}>
                                            <td colSpan={3} className="text-right font-bold">Grand Total:</td>
                                            <td className="currency font-bold">{formatCurrency(selectedCustomer.orders.reduce((sum, o) => sum + (o.total || 0), 0))}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            ) : (
                                <div className="empty-state"><ShoppingCart size={24} /><div className="empty-state-text">No orders</div></div>
                            )}

                            <div className="mt-3">
                                <label className="form-label">Forward to Branch</label>
                                <div className="flex gap-2">
                                    <select className="form-control form-select" value={selectedBranch || ''} onChange={(e) => setSelectedBranch(e.target.value)} style={{ flex: 1 }}>
                                        <option value="" disabled>Select branch</option>
                                        {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
                                    </select>
                                    <button className="btn btn-primary" onClick={() => selectedBranch && updateBranch(selectedCustomer.id, selectedBranch)}>
                                        <Forward size={14} /> Forward
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-success" onClick={() => markAsDone(selectedCustomer.id)}>
                                <Check size={14} /> Mark as Done
                            </button>
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default CustomerOrders;
