import { useState, PropsWithChildren, ReactNode } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-200">
            {/* Sidebar */}
            <aside className="w-56 bg-gray-600 text-white shadow-md flex flex-col justify-between sticky top-0 h-screen">
                <div>
                    <div className="flex items-center justify-center h-16">
                        <Link href="/">
                            <ApplicationLogo className="h-9 w-auto" />
                        </Link>
                    </div>
                    <nav className="mt-6 flex flex-col space-y-2">
                        <NavLink
                            href={route('user-dashboard')}
                            active={route().current('user-dashboard')}
                            className="hover:bg-gray-700 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            href={route('user-sales')}
                            active={route().current('user-sales')}
                            className="hover:bg-gray-700 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                        >
                            Sales Order
                        </NavLink>
                    
                        
                        {/* Manage Stocks with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="hover:bg-gray-700 px-4 py-2 rounded-md transition flex items-center justify-start text-white w-full"
                            >
                                 Stocks
                            </button>
                            {showingNavigationDropdown && (
                                <div className="ml-4 mt-1 bg-gray-700 rounded-md shadow-lg">
                                    <NavLink
                                        href={route('user-stocks')}
                                        active={route().current('user-stocks')}
                                        className="hover:bg-gray-800 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                                    >
                                        Stock Overview
                                    </NavLink>
                                    <NavLink
                                        href={route('user-stocksentries')}
                                        active={route().current('user-stocksentries')}
                                        className="hover:bg-gray-800 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                                    >
                                        Stock Entries
                                    </NavLink>
                                </div>
                            )}
                                </div>
                                <NavLink
                                    href={route('user-quotation')}
                                    active={route().current('user-quotation')}
                                    className="hover:bg-gray-700 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                                >
                                    Quotations
                                </NavLink>
                                <NavLink
                                        href={route('user-customers')}
                                        active={route().current('user-customers')}
                                        className="hover:bg-gray-800 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                                    >
                                        Customer Orders
                                </NavLink>
                                <NavLink
                                        href={route('user-reports')}
                                        active={route().current('user-reports')}
                                        className="hover:bg-gray-800 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                                    >
                                        Reports
                                </NavLink>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <h1 className="text-xl font-semibold">{header}</h1>

                        {/* Profile and dropdown on the right */}
                        <div className="relative">
                            <div className="flex items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-md transition">
                                            {user.name}
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        {/* <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link> */}
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
