import React, { useState, PropsWithChildren, ReactNode, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Divider,
    Box,
    IconButton,
    Dialog,
    Paper,
    Badge,
    Avatar,
} from '@mui/material';

import WarehouseIcon from '@mui/icons-material/Warehouse';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import CampaignIcon from '@mui/icons-material/Campaign';
import TableChartIcon from '@mui/icons-material/TableChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
    Menu,
    GridView,
} from '@mui/icons-material';
import {
    Dashboard as DashboardIcon,
    Receipt as ReceiptIcon,
    Store as StoreIcon,
    ShoppingCartCheckout as ShoppingCartCheckoutIcon,
    Report as ReportIcon,
    Chat as ChatIcon,
    ExpandLess,
    ExpandMore,
    Close as CloseIcon,
} from '@mui/icons-material';
import Draggable from 'react-draggable';
import echo from '@/Pages/echo';
import apiService from '@/Pages/Services/ApiService';

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, token } = usePage().props.auth;
    const [openBranchManagement, setOpenBranchManagement] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<number | null>(user?.id ?? null);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const handleNavigationDropdownClick = () => {
        setShowingNavigationDropdown(!showingNavigationDropdown);
    };

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
            console.log('Real-time event received:', event);
            setTotalUnreadMessages(event.totalUnread);
        });

        return () => {
            echo.leave(`chat.${currentUserId}`);
        };
    }, [currentUserId]);

    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FB' }}>
            {/* Modern TopNav */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: '#0B5D6D',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Toolbar sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '64px !important',
                    px: 3,
                }}>
                    {/* Left Side */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            size="medium"
                            edge="start"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            sx={{
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            <Menu />
                        </IconButton>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                color: 'white',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Dashboard
                        </Typography>
                    </Box>

                    {/* Right Side */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Theme Toggle */}
                        <IconButton
                            sx={{
                                color: 'white',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                <path d="M10 2.5v15M10 2.5a5 5 0 100 10 5 5 0 000-10z" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </IconButton>

                        {/* Notifications */}
                        <IconButton
                            sx={{
                                color: 'white',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            <NotificationsIcon sx={{ fontSize: 20 }} />
                        </IconButton>

                        {/* Chat Button */}
                        <IconButton
                            onClick={toggleChat}
                            sx={{
                                color: 'white',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            <Badge
                                badgeContent={totalUnreadMessages}
                                color="error"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: '0.625rem',
                                        height: 16,
                                        minWidth: 16,
                                        padding: '0 4px',
                                    }
                                }}
                            >
                                <ChatIcon sx={{ fontSize: 20 }} />
                            </Badge>
                        </IconButton>

                        {/* User Profile */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        cursor: 'pointer',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: '#F59E0B',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography
                                        sx={{
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {user.name}
                                    </Typography>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                        <path d="M4 6l4 4 4-4"/>
                                    </svg>
                                </Box>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Modern Sidebar */}
            <Drawer
                variant="permanent"
                open={drawerOpen}
                sx={{
                    width: drawerOpen ? 260 : 70,
                    flexShrink: 0,
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    [`& .MuiDrawer-paper`]: {
                        width: drawerOpen ? 260 : 70,
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                        border: 'none',
                        backgroundColor: '#FFFFFF',
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                }}
            >
                <Toolbar sx={{ minHeight: '64px !important' }} />

                <Box sx={{
                    padding: drawerOpen ? '16px 12px' : '16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                }}>
                    {/* Main Menu Label */}
                    {drawerOpen && (
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#9CA3AF',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                px: 1.5,
                                mb: 1,
                            }}
                        >
                            Main Menu
                        </Typography>
                    )}

                    {/* Dashboard */}
                    <NavLink href={route('admin-dashboard')} active={route().current('admin-dashboard')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '10px 12px',
                                borderRadius: '10px',
                                backgroundColor: route().current('admin-dashboard') ? '#0B5D6D' : 'transparent',
                                color: route().current('admin-dashboard') ? '#FFFFFF' : '#6B7280',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: route().current('admin-dashboard') ? '#0B5D6D' : '#F3F4F6',
                                    color: route().current('admin-dashboard') ? '#FFFFFF' : '#1F2937',
                                },
                            }}
                        >
                            <GridView sx={{ fontSize: 20 }} />
                            {drawerOpen && (
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Dashboard
                                </Typography>
                            )}
                        </Box>
                    </NavLink>

                    {/* Branch Management Dropdown */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            backgroundColor: showingNavigationDropdown ? '#F3F4F6' : 'transparent',
                            color: '#6B7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: '#F3F4F6',
                                color: '#1F2937',
                            },
                        }}
                        onClick={handleNavigationDropdownClick}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <StoreIcon sx={{ fontSize: 20 }} />
                            {drawerOpen && (
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Branch Management
                                </Typography>
                            )}
                        </Box>
                        {drawerOpen && (showingNavigationDropdown ? <ExpandLess sx={{ fontSize: 20 }} /> : <ExpandMore sx={{ fontSize: 20 }} />)}
                    </Box>

                    <Collapse in={showingNavigationDropdown} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: drawerOpen ? 4.5 : 0, mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {/* Branch Stocks */}
                            <NavLink href={route('admin-stocks')} active={route().current('admin-stocks')}>
                                <Box
                                    sx={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-stocks') ? '#EFF6FF' : 'transparent',
                                        color: route().current('admin-stocks') ? '#1E40AF' : '#6B7280',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: '#EFF6FF',
                                            color: '#1E40AF',
                                        },
                                    }}
                                >
                                    {drawerOpen && (
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                            Branch Stocks
                                        </Typography>
                                    )}
                                </Box>
                            </NavLink>

                            {/* Stock Entries */}
                            <NavLink href={route('admin-entries')} active={route().current('admin-entries')}>
                                <Box
                                    sx={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-entries') ? '#EFF6FF' : 'transparent',
                                        color: route().current('admin-entries') ? '#1E40AF' : '#6B7280',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: '#EFF6FF',
                                            color: '#1E40AF',
                                        },
                                    }}
                                >
                                    {drawerOpen && (
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                            Stock Entries
                                        </Typography>
                                    )}
                                </Box>
                            </NavLink>

                            {/* Sales Orders */}
                            <NavLink href={route('admin-sales')} active={route().current('admin-sales')}>
                                <Box
                                    sx={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-sales') ? '#EFF6FF' : 'transparent',
                                        color: route().current('admin-sales') ? '#1E40AF' : '#6B7280',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: '#EFF6FF',
                                            color: '#1E40AF',
                                        },
                                    }}
                                >
                                    {drawerOpen && (
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                            Sales Orders
                                        </Typography>
                                    )}
                                </Box>
                            </NavLink>

                            {/* Stock Requests */}
                            <NavLink href={route('admin-stocks-request')} active={route().current('admin-stocks-request')}>
                                <Box
                                    sx={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-stocks-request') ? '#EFF6FF' : 'transparent',
                                        color: route().current('admin-stocks-request') ? '#1E40AF' : '#6B7280',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: '#EFF6FF',
                                            color: '#1E40AF',
                                        },
                                    }}
                                >
                                    {drawerOpen && (
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                            Stock Requests
                                        </Typography>
                                    )}
                                </Box>
                            </NavLink>
                        </Box>
                    </Collapse>

                    {/* Warehouse Stocks */}
                    <NavLink href={route('admin-products')} active={route().current('admin-products')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '10px 12px',
                                borderRadius: '10px',
                                backgroundColor: route().current('admin-products') ? '#0B5D6D' : 'transparent',
                                color: route().current('admin-products') ? '#FFFFFF' : '#6B7280',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: route().current('admin-products') ? '#0B5D6D' : '#F3F4F6',
                                    color: route().current('admin-products') ? '#FFFFFF' : '#1F2937',
                                },
                            }}
                        >
                            <WarehouseIcon sx={{ fontSize: 20 }} />
                            {drawerOpen && (
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Warehouse Stocks
                                </Typography>
                            )}
                        </Box>
                    </NavLink>

                    {/* Supplier */}
                    <NavLink href={route('admin-supplier')} active={route().current('admin-supplier')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '10px 12px',
                                borderRadius: '10px',
                                backgroundColor: route().current('admin-supplier') ? '#0B5D6D' : 'transparent',
                                color: route().current('admin-supplier') ? '#FFFFFF' : '#6B7280',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: route().current('admin-supplier') ? '#0B5D6D' : '#F3F4F6',
                                    color: route().current('admin-supplier') ? '#FFFFFF' : '#1F2937',
                                },
                            }}
                        >
                            <GroupsIcon sx={{ fontSize: 20 }} />
                            {drawerOpen && (
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Supplier
                                </Typography>
                            )}
                        </Box>
                    </NavLink>

                    {/* Branch Reports */}
                    <NavLink href={route('admin-reports')} active={route().current('admin-reports')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '10px 12px',
                                borderRadius: '10px',
                                backgroundColor: route().current('admin-reports') ? '#0B5D6D' : 'transparent',
                                color: route().current('admin-reports') ? '#FFFFFF' : '#6B7280',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: route().current('admin-reports') ? '#0B5D6D' : '#F3F4F6',
                                    color: route().current('admin-reports') ? '#FFFFFF' : '#1F2937',
                                },
                            }}
                        >
                            <ReceiptLongIcon sx={{ fontSize: 20 }} />
                            {drawerOpen && (
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Branch Reports
                                </Typography>
                            )}
                        </Box>
                    </NavLink>

                    {/* Branch Data */}
                    <NavLink href={route('admin-sales-data')} active={route().current('admin-sales-data')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '10px 12px',
                                borderRadius: '10px',
                                backgroundColor: route().current('admin-sales-data') ? '#0B5D6D' : 'transparent',
                                color: route().current('admin-sales-data') ? '#FFFFFF' : '#6B7280',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: route().current('admin-sales-data') ? '#0B5D6D' : '#F3F4F6',
                                    color: route().current('admin-sales-data') ? '#FFFFFF' : '#1F2937',
                                },
                            }}
                        >
                            <TableChartIcon sx={{ fontSize: 20 }} />
                            {drawerOpen && (
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Branch Data
                                </Typography>
                            )}
                        </Box>
                    </NavLink>

                    {/* Sales Statistics */}
                    <NavLink href={route('admin-sales-stats')} active={route().current('admin-sales-stats')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '10px 12px',
                                borderRadius: '10px',
                                backgroundColor: route().current('admin-sales-stats') ? '#0B5D6D' : 'transparent',
                                color: route().current('admin-sales-stats') ? '#FFFFFF' : '#6B7280',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: route().current('admin-sales-stats') ? '#0B5D6D' : '#F3F4F6',
                                    color: route().current('admin-sales-stats') ? '#FFFFFF' : '#1F2937',
                                },
                            }}
                        >
                            <AssessmentIcon sx={{ fontSize: 20 }} />
                            {drawerOpen && (
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Sales Statistics
                                </Typography>
                            )}
                        </Box>
                    </NavLink>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    paddingTop: '64px',
                    backgroundColor: '#F8F9FB',
                    minHeight: '100vh',
                }}
            >
                {children}
            </Box>

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
                                maxWidth: 500,
                                height: '65vh',
                                maxHeight: 700,
                                position: 'absolute',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            }}
                        />
                    </Draggable>
                )}
                aria-labelledby="chat-dialog-title"
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box
                        id="chat-dialog-title"
                        sx={{
                            cursor: 'move',
                            bgcolor: '#0B5D6D',
                            color: 'white',
                            px: 3,
                            py: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Chat
                        </Typography>
                        <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {/* Content */}
                    <Box sx={{ flex: 1, p: 0, overflow: 'hidden', bgcolor: '#f9f9f9' }}>
                        <iframe
                            src={route('admin-chat')}
                            width="100%"
                            height="100%"
                            style={{
                                border: 'none',
                                display: 'block',
                            }}
                        />
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}
