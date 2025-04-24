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
} from '@mui/material';

import WarehouseIcon from '@mui/icons-material/Warehouse';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import CampaignIcon from '@mui/icons-material/Campaign';
import {
    Menu,
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
import axios from 'axios';

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [openBranchManagement, setOpenBranchManagement] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const handleNavigationDropdownClick = () => {
        setShowingNavigationDropdown(!showingNavigationDropdown);
    };
      



     // Function to fetch the total unread messages
        useEffect(() => {
        if (!currentUserId) return; // Ensure the user is logged in
    
        const fetchTotalUnreadMessages = async () => {
            try {
                const response = await axios.get('/api/notifications/total-unread', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setTotalUnreadMessages(response.data.total);
            } catch (error) {
                console.error('Error fetching total unread messages:', error);
            }
        };
    
        fetchTotalUnreadMessages();
    
        const channel = echo.channel(`chat.${currentUserId}`); 
        channel.listen('.message.sent', (event: any) => {
            console.log('Real-time event received:', event);
            setTotalUnreadMessages(event.totalUnread); // Use the totalUnread from the event
        });
    
        return () => {
            echo.leave(`chat.${currentUserId}`);
        };
    }, [currentUserId]);
    
    
    
    
      // Fetch current user
      useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await axios.get('/api/current-user', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCurrentUserId(res.data.id);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
    
        fetchCurrentUser();
    }, []);
    












    const handleBranchManagementClick = () => {
        setOpenBranchManagement(!openBranchManagement);
    };

    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* AppBar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#ffffff', color: '#333', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Left Side */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            sx={{ mr: 2 }}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                            {header || 'User Dashboard'}
                        </Typography>
                    </Box>
                    {/* Right Side */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       {/* Announcement Button */}
                        <Button
                            color="inherit"
                            href={route('admin-announcements')} // Use href for navigation
                            startIcon={
                                <Badge color="secondary">
                                    <CampaignIcon />
                                </Badge>
                            }
                            sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                    
                        </Button>
                        {/* Chat Button */}
                        <Button
                            color="inherit"
                            startIcon={
                                <Badge
                                    color="error"
                                    badgeContent={totalUnreadMessages > 0 ? totalUnreadMessages : null}
                                    sx={{ ml: 1 }}
                                >
                                    <ChatIcon />
                                </Badge>
                            }
                            onClick={toggleChat}
                            sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                        
                        </Button>
                        {/* User Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <Button color="inherit" sx={{ textTransform: 'none', fontWeight: 500 }}>
                                    {user.name}
                                </Button>
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

            {/* Drawer (Sidebar) */}
            <Drawer
                variant="permanent"
                open={drawerOpen}
                sx={{
                    width: drawerOpen ? 280 : 80,
                    flexShrink: 0,
                    transition: (theme) => theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    [`& .MuiDrawer-paper`]: {
                        width: drawerOpen ? 280 : 80,
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                        borderRight: '1px solid #e0e0e0',
                        backgroundColor: '#ffffff',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ padding: drawerOpen ? '16px' : '0' }}>
                {/* Navigation Links */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}> {/* Add gap here */}
                    {/* Dashboard */}
                    <NavLink href={route('admin-dashboard')} active={route().current('admin-dashboard')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: route().current('admin-dashboard') ? '#f0faff' : 'transparent',
                                '&:hover': {
                                    backgroundColor: '#f0faff',
                                },
                            }}
                        >
                            <DashboardIcon sx={{ fontSize: 20 }} />
                            <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Dashboard</Typography>
                        </Box>
                    </NavLink>

                    {/* Branch Management Dropdown */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: showingNavigationDropdown ? '#f0faff' : 'transparent',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#f0faff',
                            },
                        }}
                        onClick={handleNavigationDropdownClick}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StoreIcon sx={{ fontSize: 20 }} />
                            <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Branch Management</Typography>
                        </Box>
                        {showingNavigationDropdown ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                    <Collapse in={showingNavigationDropdown} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: 2, mt: 1 }}>
                            {/* Stocks */}
                            <NavLink href={route('admin-stocks')} active={route().current('admin-stocks')}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-stocks') ? '#e6f7ff' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: '#e6f7ff',
                                        },
                                    }}
                                >
                                    <Typography>Branch Stocks</Typography>
                                </Box>
                            </NavLink>
                            {/* Stock Entries */}
                            <NavLink href={route('admin-entries')} active={route().current('admin-entries')}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-entries') ? '#e6f7ff' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: '#e6f7ff',
                                        },
                                    }}
                                >
                                    <Typography>Stock Entries</Typography>
                                </Box>
                            </NavLink>
                            {/* Sales Orders */}
                            <NavLink href={route('admin-sales')} active={route().current('admin-sales')}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-sales') ? '#e6f7ff' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: '#e6f7ff',
                                        },
                                    }}
                                >
                                    <Typography>Sales Orders</Typography>
                                </Box>
                            </NavLink>
                            {/* Stock Requests */}
                            <NavLink href={route('admin-stocks-request')} active={route().current('admin-stocks-request')}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: route().current('admin-stocks-request') ? '#e6f7ff' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: '#e6f7ff',
                                        },
                                    }}
                                >
                                    <Typography>Stock Requests</Typography>
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
                                gap: 2,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: route().current('admin-products') ? '#f0faff' : 'transparent',
                                '&:hover': {
                                    backgroundColor: '#f0faff',
                                },
                            }}
                        >
                            <WarehouseIcon sx={{ fontSize: 20 }} />
                            <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Warehouse Stocks</Typography>
                        </Box>
                    </NavLink>

                    {/* Supplier */}
                    <NavLink href={route('admin-supplier')} active={route().current('admin-supplier')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: route().current('admin-supplier') ? '#f0faff' : 'transparent',
                                '&:hover': {
                                    backgroundColor: '#f0faff',
                                },
                            }}
                        >
                            <GroupsIcon sx={{ fontSize: 20 }} />
                            <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Supplier</Typography>
                        </Box>
                    </NavLink>

                    {/* Reports */}
                    <NavLink href={route('admin-reports')} active={route().current('admin-reports')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: route().current('admin-reports') ? '#f0faff' : 'transparent',
                                '&:hover': {
                                    backgroundColor: '#f0faff',
                                },
                            }}
                        >
                            <ReceiptLongIcon sx={{ fontSize: 20 }} />
                            <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Branch Reports</Typography>
                        </Box>
                    </NavLink>

                    {/* Sales Statistics */}
                    <NavLink href={route('admin-sales-stats')} active={route().current('admin-sales-stats')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: route().current('admin-sales-stats') ? '#f0faff' : 'transparent',
                                '&:hover': {
                                    backgroundColor: '#f0faff',
                                },
                            }}
                        >
                            <AssessmentIcon sx={{ fontSize: 20 }} />
                            <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Sales Statistics</Typography>
                        </Box>
                    </NavLink>
                </Box>
            </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: '72px', backgroundColor: '#f9fafb' }}>
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
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 2,
                            py: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
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