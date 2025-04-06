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
    IconButton,
    Box,
} from '@mui/material';
import { Dashboard, ExpandLess, ExpandMore, Store, Receipt, Report, People, Menu } from '@mui/icons-material';

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [openBranchManagement, setOpenBranchManagement] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);

    const handleBranchManagementClick = () => {
        setOpenBranchManagement(!openBranchManagement);
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
                                <ListItemIcon>
                                    <Dashboard />
                                </ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                        </NavLink>
                        <ListItem component="button" onClick={handleBranchManagementClick}>
                            <ListItemIcon>
                                <Store />
                            </ListItemIcon>
                            <ListItemText primary="Branch Management" />
                            {openBranchManagement ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>

                        <Collapse in={openBranchManagement} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <Dropdown.Link href={route('admin-stocks')} className="hover:bg-gray-600">
                                    <ListItem>
                                        <ListItemText primary="Stocks" />
                                    </ListItem>
                                </Dropdown.Link>
                                <Dropdown.Link href={route('admin-entries')} className="hover:bg-gray-600">
                                    <ListItem>
                                        <ListItemText primary="Stocks Entries" />
                                    </ListItem>
                                </Dropdown.Link>
                                <Dropdown.Link href={route('admin-sales')} className="hover:bg-gray-600">
                                    <ListItem>
                                        <ListItemText primary="Sales Orders" />
                                    </ListItem>
                                </Dropdown.Link>
                                <Dropdown.Link href={route('admin-stocks-request')} className="hover:bg-gray-600">
                                    <ListItem>
                                        <ListItemText primary="Stock Requests" />
                                    </ListItem>
                                </Dropdown.Link>
                            </List>
                        </Collapse>
                        <NavLink href={route('admin-reports')} active={route().current('admin-reports')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon>
                                    <Report />
                                </ListItemIcon>
                                <ListItemText primary="Reports" />
                            </ListItem>
                        </NavLink>
                        <NavLink href={route('admin-supplier')} active={route().current('admin-supplier')} className="hover:bg-gray-700">
                            <ListItem >
                                <ListItemIcon>
                                    <People />
                                </ListItemIcon>
                                <ListItemText primary="Supplier" />
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
        </Box>
    );
}