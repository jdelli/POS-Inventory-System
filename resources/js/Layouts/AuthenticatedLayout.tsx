import { useState, PropsWithChildren, ReactNode } from 'react';
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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Divider,
    IconButton,
    Box,
} from '@mui/material';
import { Dashboard, ExpandLess, ExpandMore, Store, Receipt, Report, People, Menu, ShoppingCart, ShoppingCartCheckout } from '@mui/icons-material';

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);

    const handleNavigationDropdownClick = () => {
        setShowingNavigationDropdown(!showingNavigationDropdown);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            {/* AppBar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        {header || 'User Dashboard'}
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
                        <NavLink href={route('user-dashboard')} active={route().current('user-dashboard')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon>
                                    <Dashboard />
                                </ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                        </NavLink>
                        <NavLink href={route('user-sales')} active={route().current('user-sales')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon>
                                    <Receipt />
                                </ListItemIcon>
                                <ListItemText primary="Sales Order" />
                            </ListItem>
                        </NavLink>
                        <ListItem component="button" onClick={handleNavigationDropdownClick}>
                            <ListItemIcon>
                                <Store />
                            </ListItemIcon>
                            <ListItemText primary="Stocks" />
                            {showingNavigationDropdown ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={showingNavigationDropdown} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <NavLink href={route('user-stocks')} active={route().current('user-stocks')} className="hover:bg-gray-600">
                                    <ListItem>
                                        <ListItemText primary="Stock Overview" />
                                    </ListItem>
                                </NavLink>
                                <NavLink href={route('user-stocksentries')} active={route().current('user-stocksentries')} className="hover:bg-gray-600">
                                    <ListItem>
                                        <ListItemText primary="Stock Entries" />
                                    </ListItem>
                                </NavLink>
                            </List>
                        </Collapse>
                        <NavLink href={route('user-quotation')} active={route().current('user-quotation')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon>
                                    <Receipt />
                                </ListItemIcon>
                                <ListItemText primary="Quotation" />
                            </ListItem>
                        </NavLink>
                        <NavLink href={route('user-customers')} active={route().current('user-customers')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon>
                                    <ShoppingCartCheckout />
                                </ListItemIcon>
                                <ListItemText primary="Customer Orders" />
                            </ListItem>
                        </NavLink>
                        <NavLink href={route('user-reports')} active={route().current('user-reports')} className="hover:bg-gray-700">
                            <ListItem>
                                <ListItemIcon>
                                    <Report />
                                </ListItemIcon>
                                <ListItemText primary="Reports" />
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