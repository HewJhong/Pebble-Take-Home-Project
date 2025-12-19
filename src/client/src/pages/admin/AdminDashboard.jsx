import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../services/api';

export default function AdminDashboard() {
    const [data, setData] = useState({ campaigns: [], salesPersons: [], summary: {} });
    const [aiSummary, setAiSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedSalesPerson, setSelectedSalesPerson] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campaigns, salesPersons, aiData] = await Promise.all([
                    analyticsApi.campaigns(),
                    analyticsApi.salesPersons(),
                    analyticsApi.aiSummary().catch(() => ({ summary: '' }))
                ]);
                setData({ campaigns: campaigns.campaigns, salesPersons: salesPersons.salesPersons, summary: campaigns.summary });
                setAiSummary(aiData.summary);
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);
    };

    // Chart data - top 5 campaigns (stacked: Net Revenue + Commission = Total Sales)
    const chartData = data.campaigns.slice(0, 5).map(c => ({
        name: c.title.length > 12 ? c.title.substring(0, 12) + '...' : c.title,
        fullName: c.title,
        'Net Revenue': c.metrics.totalSales - c.metrics.totalCommission,
        Commission: c.metrics.totalCommission,
        total: c.metrics.totalSales,
    }));

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
                <h1 className="text-2xl font-bold text-gray-900">📊 Admin Dashboard</h1>
                <Link to="/admin/analytics" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View Full Analytics →
                </Link>
            </div>

            {/* AI Summary Card */}
            {aiSummary && (
                <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <p className="text-sm font-medium text-primary-800 mb-1">AI Insights</p>
                            <p className="text-sm text-primary-700">{aiSummary}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="card">
                    <p className="text-sm font-medium text-gray-500">Total Sales</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(data.summary.totalSales)}</p>
                </div>
                <div className="card">
                    <p className="text-sm font-medium text-gray-500">Total Commission</p>
                    <p className="mt-1 text-3xl font-semibold text-red-600">{formatCurrency(data.summary.totalCommission)}</p>
                </div>
                <div className="card">
                    <p className="text-sm font-medium text-gray-500">Net Revenue</p>
                    <p className="mt-1 text-3xl font-semibold text-green-600">{formatCurrency(data.summary.totalNetRevenue)}</p>
                </div>
                <div className="card">
                    <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{data.summary.totalCampaigns || 0}</p>
                </div>
            </div>

            {/* Stacked Bar Chart - Revenue Composition */}
            {chartData.length > 0 && (
                <div className="card mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">📊 Top Campaigns Revenue</h2>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-[#40916C]"></span>
                                <span className="text-gray-600">Net Revenue</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-[#E63946]"></span>
                                <span className="text-gray-600">Commission</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid stroke="#E5E7EB" strokeWidth={1} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `RM ${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white rounded-xl shadow-lg border-0 p-4" style={{ minWidth: 180 }}>
                                                    <p className="text-base font-semibold text-gray-900 mb-2">{data.fullName}</p>
                                                    <div className="space-y-1.5 text-sm">
                                                        <div className="flex justify-between"><span className="text-gray-500">Net Revenue</span><span className="font-medium text-[#40916C]">{formatCurrency(data['Net Revenue'])}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Commission</span><span className="font-medium text-[#E63946]">{formatCurrency(data.Commission)}</span></div>
                                                        <div className="flex justify-between border-t pt-1.5 mt-1.5"><span className="text-gray-700 font-medium">Total</span><span className="font-semibold text-gray-900">{formatCurrency(data.total)}</span></div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="Net Revenue" stackId="revenue" fill="#40916C" barSize={24} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Commission" stackId="revenue" fill="#E63946" barSize={24} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Sales Persons */}
                <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">👥 Top Sales Persons</h2>
                    {data.salesPersons.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available</p>
                    ) : (
                        <div className="space-y-3">
                            {data.salesPersons.slice(0, 5).map((sp, i) => (
                                <div
                                    key={sp._id}
                                    onClick={() => setSelectedSalesPerson(sp)}
                                    className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-800' :
                                            i === 1 ? 'bg-gray-100 text-gray-800' :
                                                i === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-50 text-gray-600'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{sp.name}</p>
                                            <p className="text-xs text-gray-500">{sp.metrics.campaignCount} campaigns</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(sp.metrics.totalSales)}</p>
                                        <p className="text-xs text-green-600">+{formatCurrency(sp.metrics.totalCommission)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Campaigns */}
                <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">📈 Top Campaigns</h2>
                    {data.campaigns.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available</p>
                    ) : (
                        <div className="space-y-3">
                            {data.campaigns.slice(0, 5).map((c, i) => (
                                <Link
                                    key={c._id}
                                    to={`/admin/campaigns/${c._id}`}
                                    className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-800' :
                                            i === 1 ? 'bg-gray-100 text-gray-800' :
                                                i === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-50 text-gray-600'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{c.title}</p>
                                            <p className="text-xs text-gray-500">{c.salesPerson?.name} • {c.metrics.orderCount} orders</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(c.metrics.totalSales)}</p>
                                        <p className="text-xs text-gray-500">{c.metrics.commissionRate}% comm</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sales Person Modal */}
            <Dialog open={!!selectedSalesPerson} onClose={() => setSelectedSalesPerson(null)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-lg w-full rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                👤 {selectedSalesPerson?.name}
                            </Dialog.Title>
                            <button onClick={() => setSelectedSalesPerson(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {selectedSalesPerson && (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-gray-900">{selectedSalesPerson.metrics.campaignCount}</p>
                                        <p className="text-xs text-gray-500">Campaigns</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <p className="text-lg font-bold text-green-700">{formatCurrency(selectedSalesPerson.metrics.totalSales)}</p>
                                        <p className="text-xs text-gray-500">Total Sales</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <p className="text-lg font-bold text-blue-700">{formatCurrency(selectedSalesPerson.metrics.totalCommission)}</p>
                                        <p className="text-xs text-gray-500">Commission</p>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="mb-4 text-sm text-gray-600">
                                    <p><span className="font-medium">Commission Rate:</span> {selectedSalesPerson.commissionRate}%</p>
                                    <p><span className="font-medium">Orders:</span> {selectedSalesPerson.metrics.orderCount}</p>
                                </div>

                                {/* Campaigns List */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">📢 Related Campaigns</h4>
                                    {data.campaigns
                                        .filter(c => c.salesPerson?._id === selectedSalesPerson._id)
                                        .length === 0 ? (
                                        <p className="text-sm text-gray-500">No campaigns assigned</p>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {data.campaigns
                                                .filter(c => c.salesPerson?._id === selectedSalesPerson._id)
                                                .map(c => (
                                                    <Link
                                                        key={c._id}
                                                        to={`/admin/campaigns/${c._id}`}
                                                        onClick={() => setSelectedSalesPerson(null)}
                                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{c.title}</p>
                                                            <p className="text-xs text-gray-500">{c.socialMedia} • {c.metrics.orderCount} orders</p>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(c.metrics.totalSales)}</p>
                                                    </Link>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}
