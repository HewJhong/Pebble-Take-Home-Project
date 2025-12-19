import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    UsersIcon,
    MegaphoneIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

// Unified navigation - shared routes with role-based filtering in components
const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Campaigns', href: '/admin/campaigns', icon: MegaphoneIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Activity Log', href: '/admin/activity', icon: ClipboardDocumentListIcon },
];

// Sales uses same base routes but points to /sales prefix, components filter data
const salesNavigation = [
    { name: 'Dashboard', href: '/sales', icon: HomeIcon },
    { name: 'Campaigns', href: '/sales/campaigns', icon: MegaphoneIcon },
    { name: 'Orders', href: '/sales/orders', icon: ShoppingCartIcon },
    { name: 'Analytics', href: '/sales/analytics', icon: ChartBarIcon },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = user?.role === 'admin' ? adminNavigation : salesNavigation;

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    // Check if a nav item is active (handles sub-pages like /admin/campaigns/:id)
    const isActive = (href) => {
        // Exact match for dashboard routes
        if (href === '/admin' || href === '/sales') {
            return location.pathname === href;
        }
        // StartsWith for other routes (campaigns, users, orders, etc.)
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <Dialog as="div" className="relative z-50 lg:hidden" open={sidebarOpen} onClose={setSidebarOpen}>
                <div className="fixed inset-0 bg-gray-900/80" />
                <div className="fixed inset-0 flex">
                    <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                            <div className="flex h-16 shrink-0 items-center">
                                <span className="text-xl font-bold text-primary-600">SalesCommission</span>
                            </div>
                            <nav className="flex flex-1 flex-col">
                                <ul className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <ul className="-mx-2 space-y-1">
                                            {navigation.map((item) => (
                                                <li key={item.name}>
                                                    <Link
                                                        to={item.href}
                                                        className={classNames(
                                                            isActive(item.href)
                                                                ? 'bg-primary-50 text-primary-600'
                                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                            'group flex gap-x-3 rounded-md p-2 text-sm font-medium'
                                                        )}
                                                    >
                                                        <item.icon className="h-5 w-5 shrink-0" />
                                                        {item.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                        <span className="text-xl font-bold text-primary-600">SalesCommission</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                to={item.href}
                                                className={classNames(
                                                    isActive(item.href)
                                                        ? 'bg-primary-50 text-primary-600'
                                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                    'group flex gap-x-3 rounded-md p-2 text-sm font-medium'
                                                )}
                                            >
                                                <item.icon className="h-5 w-5 shrink-0" />
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <button
                                    onClick={handleLogout}
                                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 w-full"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1"></div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <div className="flex items-center gap-x-2">
                                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
