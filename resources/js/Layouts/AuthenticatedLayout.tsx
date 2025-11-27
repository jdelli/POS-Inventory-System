import React, { useState, PropsWithChildren, ReactNode, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Drawer,
    Collapse,
    IconButton,
    Box,
    Dialog,
    Paper,
    Badge,

} from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Dashboard, ExpandLess, ExpandMore, Store, Receipt, Report, People, Menu, ShoppingCart, ShoppingCartCheckout, Chat } from '@mui/icons-material';
import Echo from 'laravel-echo';
import Draggable from 'react-draggable';
import AnnouncementModal from '@/Pages/Props/AnnouncementsModal';
import echo from '@/Pages/echo';
import apiService from '@/Pages/Services/ApiService';
export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, token } = usePage().props.auth;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false); // State for chat modal
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<number | null>(user?.id ?? null);
  
    // Keep API token in localStorage for axios-based API calls.
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);
  
    

    // Function to fetch the total unread messages
    useEffect(() => {
    if (!currentUserId) return; // Ensure the user is logged in

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
        setTotalUnreadMessages(event.totalUnread); // Use the totalUnread from the event
    });

    return () => {
        echo.leave(`chat.${currentUserId}`);
    };
}, [currentUserId]);




    

    const fetchUnreadCount = async () => {
        try {
            const response = await apiService.get('/announcements/unread');
            setUnreadCount(response.data.length);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };
    
    
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        const echo = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: Number(import.meta.env.VITE_REVERB_PORT),
            forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
            disableStats: true,
            enabledTransports: ['ws'],
            cluster: 'mt1',
        });
    
        echo.channel('announcements').listen('.new-announcement', (e: any) => {
            console.log('📢 New announcement received');
            fetchUnreadCount(); // Refresh badge in real-time
        });
    
        return () => {
            echo.leave('announcements');
            echo.disconnect();
        };
    }, []);
    


    const handleNavigationDropdownClick = () => {
        setShowingNavigationDropdown(!showingNavigationDropdown);
    };

    const toggleChat = () => {
        setChatOpen(!chatOpen); // Toggle chat modal visibility
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
                <AnnouncementModal unreadCount={unreadCount} onNewAnnouncement={fetchUnreadCount} />

                {/* Chat Button */}
                <Button
                    color="inherit"
                    startIcon={
                        <Badge
                            color="error"
                            badgeContent={totalUnreadMessages > 0 ? totalUnreadMessages : null}
                            sx={{ ml: 1 }}
                        >
                            <Chat />
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
                        {/* <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link> */}
                        <Dropdown.Link href={route('logout')} method="post" as="button">
                            Log Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </Box>
        </Toolbar>
    </AppBar>

    {/* Drawer */}
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
        <Box sx={{  padding: drawerOpen ? '16px' : '0' }}>
            {/* Navigation Links */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Dashboard */}
                <NavLink href={route('user-dashboard')} active={route().current('user-dashboard')}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: route().current('user-dashboard') ? '#f0faff' : 'transparent',
                            '&:hover': {
                                backgroundColor: '#f0faff',
                            },
                        }}
                    >
                        <Dashboard sx={{ fontSize: 20 }} />
                        <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Dashboard</Typography>
                    </Box>
                </NavLink>

                {/* Sales Order */}
                <NavLink href={route('user-sales')} active={route().current('user-sales')}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: route().current('user-sales') ? '#f0faff' : 'transparent',
                            '&:hover': {
                                backgroundColor: '#f0faff',
                            },
                        }}
                    >
                        <Receipt sx={{ fontSize: 20 }} />
                        <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Sales Order</Typography>
                    </Box>
                </NavLink>

                {/* Stocks Dropdown */}
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
                        <Store sx={{ fontSize: 20 }} />
                        <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Stocks</Typography>
                    </Box>
                    {showingNavigationDropdown ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Collapse in={showingNavigationDropdown} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 2, mt: 1 }}>
                        <NavLink href={route('user-stocks')} active={route().current('user-stocks')}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: route().current('user-stocks') ? '#e6f7ff' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: '#e6f7ff',
                                    },
                                }}
                            >
                                <Typography>Stock Overview</Typography>
                            </Box>
                        </NavLink>
                        <NavLink href={route('user-stocksentries')} active={route().current('user-stocksentries')}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: route().current('user-stocksentries') ? '#e6f7ff' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: '#e6f7ff',
                                    },
                                }}
                            >
                                <Typography>Stock Entries</Typography>
                            </Box>
                        </NavLink>
                    </Box>
                </Collapse>

                {/* Quotation */}
                <NavLink href={route('user-quotation')} active={route().current('user-quotation')}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: route().current('user-quotation') ? '#f0faff' : 'transparent',
                            '&:hover': {
                                backgroundColor: '#f0faff',
                            },
                        }}
                    >
                        <FeedIcon sx={{ fontSize: 20 }} />
                        <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Quotation</Typography>
                    </Box>
                </NavLink>

                {/* Customer Orders */}
                <NavLink href={route('user-customers')} active={route().current('user-customers')}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: route().current('user-customers') ? '#f0faff' : 'transparent',
                            '&:hover': {
                                backgroundColor: '#f0faff',
                            },
                        }}
                    >
                        <ShoppingCartCheckout sx={{ fontSize: 20 }} />
                        <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Customer Orders</Typography>
                    </Box>
                </NavLink>

                {/* Reports */}
                <NavLink href={route('user-reports')} active={route().current('user-reports')}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: route().current('user-reports') ? '#f0faff' : 'transparent',
                            '&:hover': {
                                backgroundColor: '#f0faff',
                            },
                        }}
                    >
                        <ReceiptLongIcon sx={{ fontSize: 20 }} />
                        <Typography sx={{ opacity: drawerOpen ? 1 : 0 }}>Reports</Typography>
                    </Box>
                </NavLink>
            </Box>
        </Box>
    </Drawer>

    {/* Main Content */}
    <Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: '72px', backgroundColor: '#f9fafb' }}>
        {children}
    </Box>

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
                src={route('user-chat')}
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
