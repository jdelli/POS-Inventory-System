import React, { useState, PropsWithChildren, ReactNode } from 'react';
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
} from '@mui/material';

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
    Dashboard,
    ExpandLess,
    ExpandMore,
    Store,
    Receipt,
    Report,
    People,
    Menu,
    BackupTable,
    Chat,
    Announcement, // Import the Announcement icon
} from '@mui/icons-material';
import CampaignIcon from '@mui/icons-material/Campaign';
import Draggable from 'react-draggable';

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [openBranchManagement, setOpenBranchManagement] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);

    const handleBranchManagementClick = () => {
        setOpenBranchManagement(!openBranchManagement);
    };

    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            {/* AppBar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        {header || 'Admin Dashboard'}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        color="inherit"
                        startIcon={<CampaignIcon />}
                        component={Link}
                        href={route('admin-announcements')} // Navigate to the announcements route
                    >

                    </Button>
                    <Button color="inherit" startIcon={<Chat />} onClick={toggleChat}>

                    </Button>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button color="inherit">{user.name}</Button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                variant="permanent"
                open={drawerOpen}
                sx={{
                    width: drawerOpen ? 240 : 0,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: 240,
                        boxSizing: 'border-box',
                        transition: (theme) => theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <Divider />
                        <NavLink href={route('admin-dashboard')} active={route().current('admin-dashboard')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon><Dashboard /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                        </NavLink>
                        <ListItem component="button" onClick={handleBranchManagementClick}>
                            <ListItemIcon><BackupTable /></ListItemIcon>
                            <ListItemText primary="Branch Management" />
                            {openBranchManagement ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openBranchManagement} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <Dropdown.Link href={route('admin-stocks')} className="hover:bg-gray-600">
                                    <ListItem><ListItemText primary="Stocks" /></ListItem>
                                </Dropdown.Link>
                                <Dropdown.Link href={route('admin-entries')} className="hover:bg-gray-600">
                                    <ListItem><ListItemText primary="Stocks Entries" /></ListItem>
                                </Dropdown.Link>
                                <Dropdown.Link href={route('admin-sales')} className="hover:bg-gray-600">
                                    <ListItem><ListItemText primary="Sales Orders" /></ListItem>
                                </Dropdown.Link>
                                <Dropdown.Link href={route('admin-stocks-request')} className="hover:bg-gray-600">
                                    <ListItem><ListItemText primary="Stock Requests" /></ListItem>
                                </Dropdown.Link>
                            </List>
                        </Collapse>
                        <NavLink href={route('admin-reports')} active={route().current('admin-reports')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon><Report /></ListItemIcon>
                                <ListItemText primary="Reports" />
                            </ListItem>
                        </NavLink>
                        <NavLink href={route('admin-supplier')} active={route().current('admin-supplier')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon><People /></ListItemIcon>
                                <ListItemText primary="Supplier" />
                            </ListItem>
                        </NavLink>
                        <NavLink href={route('admin-products')} active={route().current('admin-products')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon><Store /></ListItemIcon>
                                <ListItemText primary="Warehouse Stocks" />
                            </ListItem>
                        </NavLink>
                        <NavLink href={route('admin-sales-stats')} active={route().current('admin-sales-stats')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
                                <ListItemText primary="Sales Statistics" />
                            </ListItem>
                        </NavLink>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>

            {/* Movable Chat Dialog */}
            <Dialog
                open={chatOpen}
                onClose={toggleChat}
                PaperComponent={(props) => (
                    <Draggable handle="#chat-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
                        <Paper
                            {...props}
                            sx={{
                                width: '80%', // Adjusted width for larger modal
                                maxWidth: '900px', // Maximum width
                                height: '60%', // Adjusted height for larger modal
                                maxHeight: '700px', // Maximum height
                                position: 'absolute',
                            }}
                        />
                    </Draggable>
                )}
                aria-labelledby="chat-dialog-title"
            >
                <Box>
                    {/* Draggable Title Bar */}
                    <Box
                        id="chat-dialog-title"
                        sx={{
                            cursor: 'move',
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            px: 2,
                            py: 1,
                        }}
                    >
                        <Typography variant="h6">Chat</Typography>
                    </Box>
                    {/* Chat Content */}
                    <Box sx={{ p: 2 }}>
                        <iframe
                            src={route('admin-chat')}
                            width="100%"
                            height="500px" // Adjusted iframe height for more content visibility
                            style={{ border: 'none' }}
                        ></iframe>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}