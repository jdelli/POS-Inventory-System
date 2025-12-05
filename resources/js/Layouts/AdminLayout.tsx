import React, { useState, PropsWithChildren, ReactNode, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import {
    Box,
    Dialog,
    Paper,
    Collapse,
    Typography,
} from '@mui/material';
import {
    LayoutDashboard,
    Store,
    Package,
    Truck,
    FileText,
    Building2,
    TrendingUp,
    Menu,
    Bell,
    MessageCircle,
    ChevronDown,
    ChevronRight,
    X,
    User,
    LogOut,
    Settings,
    HelpCircle,
    Boxes,
    ClipboardList,
    ShoppingCart,
    PackageCheck,
} from 'lucide-react';
import Draggable from 'react-draggable';
import echo from '@/Pages/echo';
import apiService from '@/Pages/Services/ApiService';

const CompactLayoutStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

        .compact-layout {
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Top Navigation */
        .compact-topnav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 36px;
            background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
            border-bottom: 1px solid #334155;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            z-index: 1100;
        }

        .topnav-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .menu-toggle {
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: 1px solid transparent;
            color: #64748B;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.15s;
        }

        .menu-toggle:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: #334155;
            color: #E2E8F0;
        }

        .topnav-brand {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #E2E8F0;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: -0.25px;
        }

        .brand-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .topnav-right {
            display: flex;
            align-items: center;
            gap: 2px;
        }

        .topnav-btn {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: #64748B;
            cursor: pointer;
            border-radius: 4px;
            position: relative;
            transition: all 0.15s;
        }

        .topnav-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #E2E8F0;
        }

        .topnav-badge {
            position: absolute;
            top: 3px;
            right: 3px;
            min-width: 14px;
            height: 14px;
            background: #EF4444;
            color: white;
            font-size: 0.5625rem;
            font-weight: 700;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 3px;
            border: 1px solid #0F172A;
        }

        .topnav-divider {
            width: 1px;
            height: 20px;
            background: #334155;
            margin: 0 6px;
        }

        .user-dropdown {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 3px 8px 3px 3px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid #334155;
            color: #CBD5E1;
            cursor: pointer;
            border-radius: 4px;
            font-size: 0.6875rem;
            font-weight: 500;
            transition: all 0.15s;
        }

        .user-dropdown:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: #475569;
            color: white;
        }

        .user-avatar {
            width: 22px;
            height: 22px;
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: white;
            font-size: 0.625rem;
            font-weight: 700;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Sidebar */
        .compact-sidebar {
            position: fixed;
            top: 36px;
            left: 0;
            bottom: 0;
            width: 192px;
            background: #FAFBFC;
            border-right: 1px solid #E2E5E9;
            display: flex;
            flex-direction: column;
            transition: width 0.2s ease;
            z-index: 1000;
        }

        .compact-sidebar.collapsed {
            width: 44px;
        }

        .sidebar-scroll {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 8px 6px;
        }

        .sidebar-scroll::-webkit-scrollbar {
            width: 5px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 3px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
        }

        .sidebar-section {
            margin-bottom: 12px;
        }

        .sidebar-label {
            font-size: 0.5625rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.75px;
            color: #94A3B8;
            padding: 6px 10px 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .sidebar-label::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #E2E5E9;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 7px 10px;
            margin: 2px 0;
            border-radius: 5px;
            color: #475569;
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.12s ease;
            white-space: nowrap;
            overflow: hidden;
            border: 1px solid transparent;
            position: relative;
        }

        .nav-item:hover {
            background: #FFFFFF;
            color: #1E293B;
            border-color: #E2E5E9;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .nav-item.active {
            background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%);
            color: white;
            border-color: #1E40AF;
            box-shadow: 0 1px 3px rgba(29, 78, 216, 0.3);
        }

        .nav-item.active:hover {
            background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
        }

        .nav-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 16px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 0 2px 2px 0;
        }

        .nav-item svg {
            flex-shrink: 0;
            opacity: 0.85;
        }

        .nav-item.active svg {
            opacity: 1;
        }

        .nav-item-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .nav-dropdown-toggle {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 7px 10px;
            margin: 2px 0;
            border-radius: 5px;
            color: #475569;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.12s ease;
            width: 100%;
            background: transparent;
            border: 1px solid transparent;
            text-align: left;
        }

        .nav-dropdown-toggle:hover {
            background: #FFFFFF;
            color: #1E293B;
            border-color: #E2E5E9;
        }

        .nav-dropdown-toggle.open {
            background: #EFF6FF;
            color: #1D4ED8;
            border-color: #BFDBFE;
        }

        .nav-dropdown-toggle svg {
            flex-shrink: 0;
        }

        .nav-dropdown-content {
            margin: 2px 0 4px 0;
            padding: 4px 0 4px 16px;
            border-left: 2px solid #E2E5E9;
            margin-left: 16px;
        }

        .nav-subitem {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 10px;
            margin: 1px 0;
            border-radius: 4px;
            color: #64748B;
            text-decoration: none;
            font-size: 0.6875rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: all 0.12s ease;
        }

        .nav-subitem:hover {
            background: #FFFFFF;
            color: #1D4ED8;
        }

        .nav-subitem.active {
            background: #DBEAFE;
            color: #1E40AF;
            font-weight: 600;
        }

        .nav-subitem svg {
            opacity: 0.6;
        }

        .nav-subitem.active svg {
            opacity: 1;
        }

        /* Sidebar Footer */
        .sidebar-footer {
            padding: 8px 6px;
            border-top: 1px solid #E2E5E9;
            background: #F1F5F9;
        }

        .sidebar-footer-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 10px;
            border-radius: 4px;
            color: #64748B;
            text-decoration: none;
            font-size: 0.6875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.12s ease;
        }

        .sidebar-footer-item:hover {
            background: #FFFFFF;
            color: #1E293B;
        }

        /* Main Content */
        .compact-main {
            margin-left: 192px;
            margin-top: 36px;
            min-height: calc(100vh - 36px);
            background: #F3F4F6;
            transition: margin-left 0.2s ease;
        }

        .compact-main.expanded {
            margin-left: 44px;
        }

        /* Collapsed Sidebar Styles */
        .compact-sidebar.collapsed .sidebar-label,
        .compact-sidebar.collapsed .nav-item-text,
        .compact-sidebar.collapsed .nav-dropdown-toggle span,
        .compact-sidebar.collapsed .nav-dropdown-content,
        .compact-sidebar.collapsed .sidebar-footer-item span {
            display: none;
        }

        .compact-sidebar.collapsed .sidebar-label::after {
            display: none;
        }

        .compact-sidebar.collapsed .nav-dropdown-toggle,
        .compact-sidebar.collapsed .nav-item,
        .compact-sidebar.collapsed .sidebar-footer-item {
            justify-content: center;
            padding: 8px;
        }

        .compact-sidebar.collapsed .nav-item::before {
            display: none;
        }

        .compact-sidebar.collapsed .sidebar-footer {
            padding: 6px 4px;
        }

        /* Tooltip for collapsed state */
        .compact-sidebar.collapsed .nav-item[title]:hover::after,
        .compact-sidebar.collapsed .nav-dropdown-toggle[title]:hover::after {
            content: attr(title);
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            margin-left: 8px;
            padding: 4px 8px;
            background: #1E293B;
            color: white;
            font-size: 0.6875rem;
            font-weight: 500;
            border-radius: 4px;
            white-space: nowrap;
            z-index: 1001;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
    `}</style>
);

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, token } = usePage().props.auth;
    const [drawerOpen, setDrawerOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin-sidebar-open');
            return saved !== null ? saved === 'true' : true;
        }
        return true;
    });
    const [chatOpen, setChatOpen] = useState(false);
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<number | null>(user?.id ?? null);
    const [branchMenuOpen, setBranchMenuOpen] = useState(false);

    // Persist sidebar state
    useEffect(() => {
        localStorage.setItem('admin-sidebar-open', String(drawerOpen));
    }, [drawerOpen]);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (!currentUserId) return;

        const fetchTotalUnreadMessages = async () => {
            try {
                const response = await apiService.get('/notifications/total-unread');
                setTotalUnreadMessages(response.data.total);
            } catch (error) {
                console.error('Error fetching total unread messages:', error);
            }
        };

        fetchTotalUnreadMessages();

        const channel = echo.channel(`chat.${currentUserId}`);
        channel.listen('.message.sent', (event: any) => {
            setTotalUnreadMessages(event.totalUnread);
        });

        return () => {
            echo.leave(`chat.${currentUserId}`);
        };
    }, [currentUserId]);

    // Auto-expand branch menu if on a branch route
    useEffect(() => {
        if (route().current('admin-stocks') || route().current('admin-entries') || 
            route().current('admin-sales') || route().current('admin-stocks-request')) {
            setBranchMenuOpen(true);
        }
    }, []);

    const toggleChat = () => setChatOpen(!chatOpen);
    const isActive = (routeName: string) => route().current(routeName);

    return (
        <Box className="compact-layout" sx={{ minHeight: '100vh' }}>
            <CompactLayoutStyles />

            {/* Top Navigation */}
            <header className="compact-topnav">
                <div className="topnav-left">
                    <button className="menu-toggle" onClick={() => setDrawerOpen(!drawerOpen)}>
                        <Menu size={15} />
                    </button>
                    <div className="topnav-brand">
                        <div className="brand-icon">
                            <Boxes size={12} />
                        </div>
                        <span>POS Inventory</span>
                    </div>
                </div>
                <div className="topnav-right">
                    <button className="topnav-btn" title="Notifications">
                        <Bell size={15} />
                    </button>
                    <button className="topnav-btn" onClick={toggleChat} title="Messages">
                        <MessageCircle size={15} />
                        {totalUnreadMessages > 0 && (
                            <span className="topnav-badge">{totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}</span>
                        )}
                    </button>
                    <div className="topnav-divider" />
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="user-dropdown">
                                <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                                <span>{user.name}</span>
                                <ChevronDown size={11} />
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                <User size={13} style={{ marginRight: 6 }} /> Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                <LogOut size={13} style={{ marginRight: 6 }} /> Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`compact-sidebar ${!drawerOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-scroll">
                    {/* Main Section */}
                    <div className="sidebar-section">
                        {drawerOpen && <div className="sidebar-label">Navigation</div>}

                        <NavLink href={route('admin-dashboard')} active={isActive('admin-dashboard')}>
                            <div className={`nav-item ${isActive('admin-dashboard') ? 'active' : ''}`} title="Dashboard">
                                <LayoutDashboard size={15} />
                                <span className="nav-item-text">Dashboard</span>
                            </div>
                        </NavLink>

                        <button 
                            className={`nav-dropdown-toggle ${branchMenuOpen ? 'open' : ''}`}
                            onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                            title="Branch Management"
                        >
                            <Store size={15} />
                            {drawerOpen && (
                                <>
                                    <span style={{ flex: 1 }}>Branch Mgmt</span>
                                    <ChevronRight size={13} style={{ 
                                        transform: branchMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.15s ease'
                                    }} />
                                </>
                            )}
                        </button>

                        {drawerOpen && (
                            <Collapse in={branchMenuOpen}>
                                <div className="nav-dropdown-content">
                                    <NavLink href={route('admin-stocks')} active={isActive('admin-stocks')}>
                                        <div className={`nav-subitem ${isActive('admin-stocks') ? 'active' : ''}`}>
                                            <Boxes size={12} />
                                            Branch Stocks
                                        </div>
                                    </NavLink>
                                    <NavLink href={route('admin-entries')} active={isActive('admin-entries')}>
                                        <div className={`nav-subitem ${isActive('admin-entries') ? 'active' : ''}`}>
                                            <ClipboardList size={12} />
                                            Stock Entries
                                        </div>
                                    </NavLink>
                                    <NavLink href={route('admin-sales')} active={isActive('admin-sales')}>
                                        <div className={`nav-subitem ${isActive('admin-sales') ? 'active' : ''}`}>
                                            <ShoppingCart size={12} />
                                            Sales Orders
                                        </div>
                                    </NavLink>
                                    <NavLink href={route('admin-stocks-request')} active={isActive('admin-stocks-request')}>
                                        <div className={`nav-subitem ${isActive('admin-stocks-request') ? 'active' : ''}`}>
                                            <PackageCheck size={12} />
                                            Stock Requests
                                        </div>
                                    </NavLink>
                                </div>
                            </Collapse>
                        )}
                    </div>

                    {/* Inventory Section */}
                    <div className="sidebar-section">
                        {drawerOpen && <div className="sidebar-label">Inventory</div>}

                        <NavLink href={route('admin-products')} active={isActive('admin-products')}>
                            <div className={`nav-item ${isActive('admin-products') ? 'active' : ''}`} title="Warehouse">
                                <Package size={15} />
                                <span className="nav-item-text">Warehouse</span>
                            </div>
                        </NavLink>

                        <NavLink href={route('admin-supplier')} active={isActive('admin-supplier')}>
                            <div className={`nav-item ${isActive('admin-supplier') ? 'active' : ''}`} title="Suppliers">
                                <Truck size={15} />
                                <span className="nav-item-text">Suppliers</span>
                            </div>
                        </NavLink>
                    </div>

                    {/* Reports Section */}
                    <div className="sidebar-section">
                        {drawerOpen && <div className="sidebar-label">Reports</div>}

                        <NavLink href={route('admin-reports')} active={isActive('admin-reports')}>
                            <div className={`nav-item ${isActive('admin-reports') ? 'active' : ''}`} title="Branch Reports">
                                <FileText size={15} />
                                <span className="nav-item-text">Branch Reports</span>
                            </div>
                        </NavLink>

                        <NavLink href={route('admin-sales-data')} active={isActive('admin-sales-data')}>
                            <div className={`nav-item ${isActive('admin-sales-data') ? 'active' : ''}`} title="Branch Data">
                                <Building2 size={15} />
                                <span className="nav-item-text">Branch Data</span>
                            </div>
                        </NavLink>

                        <NavLink href={route('admin-sales-stats')} active={isActive('admin-sales-stats')}>
                            <div className={`nav-item ${isActive('admin-sales-stats') ? 'active' : ''}`} title="Sales Stats">
                                <TrendingUp size={15} />
                                <span className="nav-item-text">Sales Statistics</span>
                            </div>
                        </NavLink>
                    </div>
                </div>

                {/* Sidebar Footer */}
                {drawerOpen && (
                    <div className="sidebar-footer">
                        <a href="#" className="sidebar-footer-item">
                            <Settings size={13} />
                            <span>Settings</span>
                        </a>
                        <a href="#" className="sidebar-footer-item">
                            <HelpCircle size={13} />
                            <span>Help & Support</span>
                        </a>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className={`compact-main ${!drawerOpen ? 'expanded' : ''}`}>
                {children}
            </main>

            {/* Chat Dialog */}
            <Dialog
                open={chatOpen}
                onClose={toggleChat}
                PaperComponent={(props) => (
                    <Draggable handle="#chat-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
                        <Paper
                            {...props}
                            sx={{
                                width: '100%',
                                maxWidth: 400,
                                height: '50vh',
                                maxHeight: 500,
                                position: 'absolute',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                border: '1px solid #E2E5E9',
                            }}
                        />
                    </Draggable>
                )}
                aria-labelledby="chat-dialog-title"
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                        id="chat-dialog-title"
                        sx={{
                            cursor: 'move',
                            background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                            color: 'white',
                            px: 1.5,
                            py: 0.875,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MessageCircle size={14} />
                            Messages
                        </Typography>
                        <button 
                            onClick={toggleChat}
                            style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                border: 'none', 
                                color: 'white', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 4,
                                borderRadius: 3,
                            }}
                        >
                            <X size={14} />
                        </button>
                    </Box>
                    <Box sx={{ flex: 1, p: 0, overflow: 'hidden', bgcolor: '#F3F4F6' }}>
                        <iframe
                            src={route('admin-chat')}
                            width="100%"
                            height="100%"
                            style={{ border: 'none', display: 'block' }}
                        />
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}
