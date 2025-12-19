import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsApi, dashboardApi } from '../../services/api';

export default function SalesAnalytics() {
    const [data, setData] = useState({ campaigns: [], summary: {} });
    const [commissionData, setCommissionData] = useState({ months: [] });
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [monthDetail, setMonthDetail] = useState(null);
    const [monthRange, setMonthRange] = useState(6); // 3, 6, 12, or 0 for all
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [campaignResult, commissionResult] = await Promise.all([
                    analyticsApi.myCampaigns(),
                    dashboardApi.commissions()
                ]);
                setData(campaignResult);
                setCommissionData(commissionResult);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleMonthClick = async (yearMonth) => {
        if (selectedMonth === yearMonth) {
            setSelectedMonth(null);
            setMonthDetail(null);
            return;
        }
        setSelectedMonth(yearMonth);
        try {
            const detail = await dashboardApi.commissionDetail(yearMonth);
            setMonthDetail(detail);
        } catch (err) {
            console.error('Failed to fetch month detail:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);
    };

    const formatMonthName = (year, month) => {
        const date = new Date(year, month - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    // Prepare chart data
    const chartData = data.campaigns.slice(0, 10).map(c => ({
        name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
        fullName: c.title,
        'Net Revenue': c.metrics.totalSales - c.metrics.totalCommission,
        Commission: c.metrics.totalCommission,
        total: c.metrics.totalSales
    }));

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 My Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <p className="text-sm text-gray-500">My Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.totalCampaigns}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalSales)}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-500">💰 Total Commission</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.totalCommission)}</p>
                </div>
            </div>

            {/* Stacked Bar Chart - Revenue Composition */}
            {chartData.length > 0 && (
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">📊 Revenue by Campaign</h3>
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
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                <CartesianGrid stroke="#E5E7EB" strokeWidth={1} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} angle={-20} textAnchor="end" height={60} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `RM ${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
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
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                                />
                                <Bar dataKey="Net Revenue" stackId="revenue" fill="#40916C" barSize={24} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Commission" stackId="revenue" fill="#E63946" barSize={24} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Monthly Commission Breakdown */}
            {commissionData.months.length > 0 && (
                <div className="card mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Monthly Commission Breakdown</h3>
                    <div className="space-y-2">
                        {commissionData.months.map((month) => (
                            <div key={month.yearMonth}>
                                <button
                                    onClick={() => handleMonthClick(month.yearMonth)}
                                    className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${selectedMonth === month.yearMonth
                                        ? 'bg-primary-50 border border-primary-200'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {formatMonthName(month.year, month.month)}
                                            </p>
                                            <p className="text-xs text-gray-500">{month.orderCount} orders</p>
                                        </div>
                                        <span className="text-green-600 font-semibold">
                                            {formatCurrency(month.totalCommission)}
                                        </span>
                                    </div>
                                </button>

                                {selectedMonth === month.yearMonth && monthDetail && (
                                    <div className="mt-2 ml-4 space-y-2">
                                        {monthDetail.campaigns?.map((campaign) => (
                                            <div
                                                key={campaign.campaignId}
                                                className="p-3 bg-white rounded-lg border border-gray-100"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{campaign.title}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {campaign.socialMedia === 'facebook' ? '📘' : '📷'} {campaign.socialMedia} • {campaign.orderCount} orders
                                                        </p>
                                                    </div>
                                                    <span className="text-sm text-green-600 font-medium">
                                                        {formatCurrency(campaign.commission)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Commission Trend Chart */}
            {commissionData.months.length > 0 && (
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">📈 Commission Trend</h3>
                        <div className="flex gap-1">
                            {[3, 6, 12, 0].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setMonthRange(range)}
                                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${monthRange === range
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {range === 0 ? 'All' : `${range}M`}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={(() => {
                                    const sorted = [...commissionData.months].sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
                                    const filtered = monthRange === 0 ? sorted : sorted.slice(-monthRange);
                                    return filtered.map(m => ({
                                        month: formatMonthName(m.year, m.month).split(' ')[0].substring(0, 3),
                                        Commission: m.totalCommission,
                                        Orders: m.orderCount
                                    }));
                                })()}
                            >
                                <CartesianGrid stroke="#E5E7EB" strokeWidth={1} vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `RM ${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                                    formatter={(value, name) => [name === 'Commission' ? formatCurrency(value) : value, name]}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="Commission" fill="#40916C" barSize={28} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Campaign Table */}
            <div className="card overflow-hidden p-0">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">My Campaign Performance</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">My Commission</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.campaigns.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No campaigns yet. Start selling!
                                </td>
                            </tr>
                        ) : (
                            data.campaigns.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{c.title}</div>
                                        <div className="text-xs text-gray-500">
                                            {c.socialMedia === 'facebook' ? '📘' : '📷'} {c.socialMedia}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">{c.metrics.orderCount}</td>
                                    <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(c.metrics.totalSales)}</td>
                                    <td className="px-6 py-4 text-sm text-right font-medium text-green-600">{formatCurrency(c.metrics.totalCommission)}</td>
                                    <td className="px-6 py-4 text-sm text-right">{formatCurrency(c.metrics.avgOrderValue)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
