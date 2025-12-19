import { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';

export default function CommissionView() {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [monthDetail, setMonthDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchMonths = async () => {
        try {
            setLoading(true);
            const data = await dashboardApi.commissions();
            setMonths(data.months || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthDetail = async (yearMonth) => {
        try {
            setDetailLoading(true);
            const data = await dashboardApi.commissionDetail(yearMonth);
            setMonthDetail(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchMonths();
    }, []);

    const handleMonthClick = (yearMonth) => {
        setSelectedMonth(yearMonth);
        fetchMonthDetail(yearMonth);
    };

    const formatCurrency = (amount) => `RM ${(amount || 0).toFixed(2)}`;

    const formatMonthName = (year, month) => {
        const date = new Date(year, month - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getPlatformBadge = (platform) => {
        return platform === 'facebook'
            ? { class: 'bg-blue-100 text-blue-800', emoji: '📘', label: 'Facebook' }
            : { class: 'bg-pink-100 text-pink-800', emoji: '📷', label: 'Instagram' };
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Commission History</h1>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : months.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500 text-lg">No commission data yet</p>
                    <p className="text-gray-400 text-sm mt-2">Commission will appear here once orders are created for your campaigns.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Month List */}
                    <div className="lg:col-span-1">
                        <div className="card p-0">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h2 className="font-medium text-gray-900">Monthly Summary</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {months.map((month) => (
                                    <button
                                        key={month.yearMonth}
                                        onClick={() => handleMonthClick(month.yearMonth)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedMonth === month.yearMonth ? 'bg-primary-50 border-l-4 border-primary-500' : ''
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
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Month Detail */}
                    <div className="lg:col-span-2">
                        {!selectedMonth ? (
                            <div className="card text-center py-12">
                                <p className="text-gray-500">Select a month to view campaign breakdown</p>
                            </div>
                        ) : detailLoading ? (
                            <div className="card flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : monthDetail ? (
                            <div className="card">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-medium text-gray-900">
                                        {formatMonthName(monthDetail.year, monthDetail.month)}
                                    </h2>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(monthDetail.totalCommission)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {monthDetail.campaigns?.map((campaign) => {
                                        const platform = getPlatformBadge(campaign.socialMedia);
                                        return (
                                            <div
                                                key={campaign.campaignId}
                                                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${platform.class}`}>
                                                                {platform.emoji} {platform.label}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {campaign.orderCount} orders
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-green-600 font-semibold">
                                                        {formatCurrency(campaign.commission)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
