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
            <aside className="w-64 bg-gray-800 text-white shadow-lg flex flex-col justify-between sticky top-0 h-screen">
                <div>
                    <div className="flex items-center justify-center h-16 bg-gray-900">
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
