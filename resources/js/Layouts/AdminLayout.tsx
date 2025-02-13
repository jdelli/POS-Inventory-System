import { useState, PropsWithChildren, ReactNode } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
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
                            href={route('admin-dashboard')}
                            active={route().current('admin-dashboard')}
                            className="hover:bg-gray-700 px-4 py-2 rounded-md transition flex items-center justify-start text-white"
                        >
                            Dashboard
                        </NavLink>

                        {/* Dropdown for Branch Stocks, Branch Stocks Entries, Branch Sales Orders */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="hover:bg-gray-700 px-4 py-2 rounded-md transition flex items-center justify-start text-white w-full text-left">
                                    Branch Management
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link
                                    href={route('admin-stocks')}
                                    className="hover:bg-gray-600 px-4 py-2 rounded-md transition flex items-center justify-start text-black"
                                >
                                    Stocks
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('admin-entries')}
                                    className="hover:bg-gray-600 px-4 py-2 rounded-md transition flex items-center justify-start text-black"
                                >
                                     Stocks Entries
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('admin-sales')}
                                    className="hover:bg-gray-600 px-4 py-2 rounded-md transition flex items-center justify-start text-black"
                                >
                                     Sales Orders
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('admin-stocks-request')}
                                    className="hover:bg-gray-600 px-4 py-2 rounded-md transition flex items-center justify-start text-black"
                                >
                                     Stock Requests
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">{header || 'Admin Dashboard'}</h1>

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
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
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