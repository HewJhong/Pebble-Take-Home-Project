import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { campaignApi, orderApi } from '../../services/api';

export default function SalesDashboard() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState({ totalCommission: 0, thisMonthCommission: 0, campaignCount: 0, orderCount: 0, totalSales: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user's campaigns
                const campaignData = await campaignApi.list({ limit: 100 });
                const campaigns = campaignData.campaigns;
                const campaignIds = campaigns.map(c => c._id);

                // Fetch orders for user's campaigns
                let allOrders = [];
                for (const id of campaignIds) {
                    try {
                        const ordersData = await orderApi.list({ campaign: id, limit: 100 });
                        allOrders = [...allOrders, ...ordersData.orders];
                    } catch (e) {
                        console.error('Failed to fetch orders for campaign', id);
                    }
                }

                // Calculate metrics
                const totalCommission = allOrders.reduce((sum, o) => sum + (o.commission?.amount || 0), 0);
                const totalSales = allOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.totalPrice, 0), 0);

                // Calculate this month's commission
                const now = new Date();
                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const thisMonthCommission = allOrders
                    .filter(o => new Date(o.createdAt) >= thisMonthStart)
                    .reduce((sum, o) => sum + (o.commission?.amount || 0), 0);

                // Sort by date, get recent 5
                const sortedOrders = allOrders.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

                setMetrics({
                    totalCommission,
                    thisMonthCommission,
                    campaignCount: campaigns.length,
                    orderCount: allOrders.length,
                    totalSales
                });
                setRecentOrders(sortedOrders);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);
    };

    const getCurrentMonthName = () => {
        return new Date().toLocaleDateString('en-US', { month: 'long' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">📊 Welcome, {user?.name}!</h1>
                <Link to="/sales/analytics" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View Analytics →
                </Link>
            </div>

            {/* Commission Hero + Stats Grid */}
            <div className="mb-8">
                {/* Primary: Total Commission - Hero Card */}
                <div className="card bg-gradient-to-br from-gray-900 to-gray-800 mb-5 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">💰 Total Lifetime Commission</p>
                            <p className="mt-2 text-4xl font-bold text-white">{formatCurrency(metrics.totalCommission)}</p>
                        </div>
                        <div className="text-right pl-6 border-l border-gray-700">
                            <p className="text-sm text-gray-400 mb-1">📅 {getCurrentMonthName()}</p>
                            <p className="text-3xl font-bold text-green-400">{formatCurrency(metrics.thisMonthCommission)}</p>
                            <p className="text-xs text-gray-500 mt-1">This month's earnings</p>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Link to="/sales/campaigns" className="card hover:bg-gray-50 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-gray-500">📢 My Campaigns</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{metrics.campaignCount}</p>
                    </Link>
                    <Link to="/sales/orders" className="card hover:bg-gray-50 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-gray-500">🛒 My Orders</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{metrics.orderCount}</p>
                    </Link>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-500">💵 Total Sales</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(metrics.totalSales)}</p>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">🕒 Recent Orders</h2>
                    <Link to="/sales/orders" className="text-primary-600 hover:underline text-sm">View All</Link>
                </div>
                {recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No orders yet. Start selling!</p>
                ) : (
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div key={order._id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {order.campaign?.title} • {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatCurrency(order.items.reduce((s, i) => s + i.totalPrice, 0))}
                                    </p>
                                    <p className="text-xs text-green-600">+{formatCurrency(order.commission?.amount)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
