import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../services/api';

export default function Analytics() {
    const [campaignData, setCampaignData] = useState({ campaigns: [], summary: {} });
    const [salesPersonData, setSalesPersonData] = useState({ salesPersons: [], summary: {} });
    const [trendsData, setTrendsData] = useState({ trends: [] });
    const [trendPeriod, setTrendPeriod] = useState('weekly');
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [salesPersonSortBy, setSalesPersonSortBy] = useState('totalSales');
    const [salesPersonSortOrder, setSalesPersonSortOrder] = useState('desc');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [campaigns, salesPersons] = await Promise.all([
                    analyticsApi.campaigns(),
                    analyticsApi.salesPersons()
                ]);
                setCampaignData(campaigns);
                setSalesPersonData(salesPersons);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);
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
    const chartData = campaignData.campaigns.slice(0, 10).map(c => ({
        name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
        fullName: c.title,
        Commission: c.metrics.totalCommission,
        'Net Revenue': c.metrics.netRevenue,
        total: c.metrics.totalSales
    }));

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 Analytics Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(campaignData.summary.totalSales)}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-500">Total Commission</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(campaignData.summary.totalCommission)}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-500">Net Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(campaignData.summary.totalNetRevenue)}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-500">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{campaignData.summary.totalCampaigns}</p>
                </div>
            </div>

            {/* Tabs */}
            <Tab.Group>
                <Tab.List className="flex gap-2 mb-6">
                    <Tab className={({ selected }) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        📈 Campaign Performance
                    </Tab>
                    <Tab className={({ selected }) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        👥 Sales Person Performance
                    </Tab>
                    <Tab className={({ selected }) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        📈 Trends
                    </Tab>
                    <Tab className={({ selected }) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        🔄 Compare
                    </Tab>
                </Tab.List>

                <Tab.Panels>
                    {/* Campaign Performance */}
                    <Tab.Panel>
                        {/* Stacked Bar Chart - Revenue Composition */}
                        <div className="card mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">📊 Revenue Composition by Campaign</h3>
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
                                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                        <CartesianGrid stroke="#E5E7EB" strokeWidth={1} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: '#6B7280' }}
                                            angle={-20}
                                            textAnchor="end"
                                            height={60}
                                            axisLine={{ stroke: '#E5E7EB' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#6B7280' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `RM ${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white rounded-xl shadow-lg border-0 p-4" style={{ minWidth: 200 }}>
                                                            <p className="text-base font-semibold text-gray-900 mb-2">{data.fullName}</p>
                                                            <div className="space-y-1.5 text-sm">
                                                                <div className="flex justify-between"><span className="text-gray-500">Net Revenue</span><span className="font-medium text-[#40916C]">{formatCurrency(data['Net Revenue'])}</span></div>
                                                                <div className="flex justify-between"><span className="text-gray-500">Commission</span><span className="font-medium text-[#E63946]">{formatCurrency(data.Commission)}</span></div>
                                                                <div className="flex justify-between border-t pt-1.5 mt-1.5"><span className="text-gray-700 font-medium">Total Sales</span><span className="font-semibold text-gray-900">{formatCurrency(data.total)}</span></div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                        />
                                        <Bar
                                            dataKey="Net Revenue"
                                            stackId="revenue"
                                            fill="#40916C"
                                            name="Net Revenue"
                                            barSize={24}
                                            radius={[0, 0, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="Commission"
                                            stackId="revenue"
                                            fill="#E63946"
                                            name="Commission"
                                            barSize={24}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Shows how total sales breaks down into net revenue and commission per campaign
                            </p>
                        </div>

                        {/* Campaign Table */}
                        <div className="card overflow-hidden p-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Person</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comm %</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {campaignData.campaigns.map((c) => (
                                        <tr key={c._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{c.title}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{c.salesPerson?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-sm text-right">{c.metrics.orderCount}</td>
                                            <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(c.metrics.totalSales)}</td>
                                            <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(c.metrics.totalCommission)}</td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <span className={`px-2 py-1 rounded ${parseFloat(c.metrics.commissionRate) > 20 ? 'bg-red-100 text-red-800' :
                                                    parseFloat(c.metrics.commissionRate) > 15 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {c.metrics.commissionRate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-green-600">{formatCurrency(c.metrics.netRevenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Tab.Panel>

                    {/* Sales Person Performance */}
                    <Tab.Panel>
                        {/* Sort Controls */}
                        <div className="card mb-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                                <select
                                    value={`${salesPersonSortBy}-${salesPersonSortOrder}`}
                                    onChange={(e) => {
                                        const [sortBy, sortOrder] = e.target.value.split('-');
                                        setSalesPersonSortBy(sortBy);
                                        setSalesPersonSortOrder(sortOrder);
                                    }}
                                    className="input w-64"
                                >
                                    <option value="totalSales-desc">Total Sales (High to Low)</option>
                                    <option value="totalSales-asc">Total Sales (Low to High)</option>
                                    <option value="totalCommission-desc">Commission (High to Low)</option>
                                    <option value="totalCommission-asc">Commission (Low to High)</option>
                                    <option value="orderCount-desc">Orders (High to Low)</option>
                                    <option value="orderCount-asc">Orders (Low to High)</option>
                                    <option value="campaignCount-desc">Campaigns (High to Low)</option>
                                    <option value="campaignCount-asc">Campaigns (Low to High)</option>
                                    <option value="efficiencyRatio-desc">Efficiency (High to Low)</option>
                                    <option value="efficiencyRatio-asc">Efficiency (Low to High)</option>
                                </select>
                            </div>
                        </div>

                        <div className="card overflow-hidden p-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Person</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Campaigns</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission Earned</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission Rate</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {[...salesPersonData.salesPersons].sort((a, b) => {
                                        const aVal = salesPersonSortBy === 'totalSales' ? a.metrics.totalSales :
                                                     salesPersonSortBy === 'totalCommission' ? a.metrics.totalCommission :
                                                     salesPersonSortBy === 'orderCount' ? a.metrics.orderCount :
                                                     salesPersonSortBy === 'campaignCount' ? a.metrics.campaignCount :
                                                     parseFloat(a.metrics.efficiencyRatio);
                                        const bVal = salesPersonSortBy === 'totalSales' ? b.metrics.totalSales :
                                                     salesPersonSortBy === 'totalCommission' ? b.metrics.totalCommission :
                                                     salesPersonSortBy === 'orderCount' ? b.metrics.orderCount :
                                                     salesPersonSortBy === 'campaignCount' ? b.metrics.campaignCount :
                                                     parseFloat(b.metrics.efficiencyRatio);
                                        return salesPersonSortOrder === 'desc' ? bVal - aVal : aVal - bVal;
                                    }).map((sp) => (
                                        <tr key={sp._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{sp.name}</div>
                                                <div className="text-xs text-gray-500">@{sp.username}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right">{sp.metrics.campaignCount}</td>
                                            <td className="px-6 py-4 text-sm text-right">{sp.metrics.orderCount}</td>
                                            <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(sp.metrics.totalSales)}</td>
                                            <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(sp.metrics.totalCommission)}</td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <span className={`px-2 py-1 rounded ${sp.commissionRate > 20 ? 'bg-red-100 text-red-800' :
                                                    sp.commissionRate > 15 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {sp.commissionRate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <span className="text-primary-600 font-medium" title="Sales per RM1 commission">
                                                    {sp.metrics.efficiencyRatio}x
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Tab.Panel>

                    {/* Trends */}
                    <Tab.Panel>
                        <div className="card mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Sales & Commission Trends</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            setTrendPeriod('weekly');
                                            const data = await analyticsApi.trends({ period: 'weekly' });
                                            setTrendsData(data);
                                        }}
                                        className={`px-3 py-1 text-sm rounded ${trendPeriod === 'weekly' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        Weekly
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setTrendPeriod('monthly');
                                            const data = await analyticsApi.trends({ period: 'monthly' });
                                            setTrendsData(data);
                                        }}
                                        className={`px-3 py-1 text-sm rounded ${trendPeriod === 'monthly' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        Monthly
                                    </button>
                                </div>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendsData.trends}>
                                        <CartesianGrid stroke="#E5E7EB" strokeWidth={1} vertical={false} />
                                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                        <Line type="monotone" dataKey="totalSales" name="Sales" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 4, fill: '#2D6A4F' }} />
                                        <Line type="monotone" dataKey="totalCommission" name="Commission" stroke="#E63946" strokeWidth={2} dot={{ r: 4, fill: '#E63946' }} />
                                        <Line type="monotone" dataKey="netRevenue" name="Net Revenue" stroke="#1B4332" strokeWidth={2} dot={{ r: 4, fill: '#1B4332' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Trends Table */}
                        <div className="card overflow-hidden p-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sales</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {trendsData.trends.map((t, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.period}</td>
                                            <td className="px-6 py-4 text-sm text-right">{t.orderCount}</td>
                                            <td className="px-6 py-4 text-sm text-right">{formatCurrency(t.totalSales)}</td>
                                            <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(t.totalCommission)}</td>
                                            <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(t.netRevenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Tab.Panel>

                    {/* Compare */}
                    <Tab.Panel>
                        <div className="card mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compare Campaigns (Select up to 3)</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {campaignData.campaigns.slice(0, 10).map((c) => (
                                    <button
                                        key={c._id}
                                        onClick={() => {
                                            if (selectedCampaigns.includes(c._id)) {
                                                setSelectedCampaigns(selectedCampaigns.filter(id => id !== c._id));
                                            } else if (selectedCampaigns.length < 3) {
                                                setSelectedCampaigns([...selectedCampaigns, c._id]);
                                            }
                                        }}
                                        className={`px-3 py-1 text-sm rounded border transition-colors ${selectedCampaigns.includes(c._id)
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                                            }`}
                                    >
                                        {c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title}
                                    </button>
                                ))}
                            </div>

                            {selectedCampaigns.length >= 2 && (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={[
                                            {
                                                metric: 'Sales', ...Object.fromEntries(selectedCampaigns.map((id, i) => {
                                                    const c = campaignData.campaigns.find(c => c._id === id);
                                                    return [`Campaign ${i + 1}`, c?.metrics.totalSales / 1000 || 0];
                                                }))
                                            },
                                            {
                                                metric: 'Commission', ...Object.fromEntries(selectedCampaigns.map((id, i) => {
                                                    const c = campaignData.campaigns.find(c => c._id === id);
                                                    return [`Campaign ${i + 1}`, c?.metrics.totalCommission / 100 || 0];
                                                }))
                                            },
                                            {
                                                metric: 'Orders', ...Object.fromEntries(selectedCampaigns.map((id, i) => {
                                                    const c = campaignData.campaigns.find(c => c._id === id);
                                                    return [`Campaign ${i + 1}`, c?.metrics.orderCount || 0];
                                                }))
                                            },
                                            {
                                                metric: 'Avg Value', ...Object.fromEntries(selectedCampaigns.map((id, i) => {
                                                    const c = campaignData.campaigns.find(c => c._id === id);
                                                    return [`Campaign ${i + 1}`, c?.metrics.avgOrderValue / 10 || 0];
                                                }))
                                            },
                                        ]}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="metric" />
                                            <PolarRadiusAxis />
                                            {selectedCampaigns.map((_, i) => (
                                                <Radar
                                                    key={i}
                                                    name={campaignData.campaigns.find(c => c._id === selectedCampaigns[i])?.title || `Campaign ${i + 1}`}
                                                    dataKey={`Campaign ${i + 1}`}
                                                    stroke={['#2D6A4F', '#E63946', '#1B4332'][i]}
                                                    fill={['#2D6A4F', '#E63946', '#1B4332'][i]}
                                                    fillOpacity={0.3}
                                                />
                                            ))}
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {selectedCampaigns.length < 2 && (
                                <div className="text-center text-gray-500 py-8">
                                    Select at least 2 campaigns to compare
                                </div>
                            )}
                        </div>

                        {/* Comparison Table */}
                        {selectedCampaigns.length >= 2 && (
                            <div className="card overflow-hidden p-0">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                                            {selectedCampaigns.map((id) => {
                                                const c = campaignData.campaigns.find(c => c._id === id);
                                                return (
                                                    <th key={id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                        {c?.title.substring(0, 15)}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Sales</td>
                                            {selectedCampaigns.map((id) => {
                                                const c = campaignData.campaigns.find(c => c._id === id);
                                                return <td key={id} className="px-6 py-4 text-sm text-right">{formatCurrency(c?.metrics.totalSales)}</td>;
                                            })}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Commission</td>
                                            {selectedCampaigns.map((id) => {
                                                const c = campaignData.campaigns.find(c => c._id === id);
                                                return <td key={id} className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(c?.metrics.totalCommission)}</td>;
                                            })}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Net Revenue</td>
                                            {selectedCampaigns.map((id) => {
                                                const c = campaignData.campaigns.find(c => c._id === id);
                                                return <td key={id} className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(c?.metrics.netRevenue)}</td>;
                                            })}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Orders</td>
                                            {selectedCampaigns.map((id) => {
                                                const c = campaignData.campaigns.find(c => c._id === id);
                                                return <td key={id} className="px-6 py-4 text-sm text-right">{c?.metrics.orderCount}</td>;
                                            })}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Avg Order Value</td>
                                            {selectedCampaigns.map((id) => {
                                                const c = campaignData.campaigns.find(c => c._id === id);
                                                return <td key={id} className="px-6 py-4 text-sm text-right">{formatCurrency(c?.metrics.avgOrderValue)}</td>;
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}
