import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi } from '../../services/api';
import Pagination from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

export default function MyCampaigns() {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [platformFilter, setPlatformFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 10 };
            if (debouncedSearch) params.search = debouncedSearch;
            if (platformFilter) params.platform = platformFilter;
            if (typeFilter) params.type = typeFilter;

            const data = await campaignApi.list(params);
            setCampaigns(data.campaigns);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [pagination.page, debouncedSearch, platformFilter, typeFilter]);

    const formatCurrency = (amount) => `RM ${(amount || 0).toFixed(2)}`;

    const getPlatformBadge = (platform) => {
        return platform === 'facebook'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-pink-100 text-pink-800';
    };

    const getTypeBadge = (type) => {
        const types = {
            post: 'bg-gray-100 text-gray-800',
            event: 'bg-green-100 text-green-800',
            live_post: 'bg-red-100 text-red-800'
        };
        return types[type] || types.post;
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">📢 My Campaigns</h1>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input flex-1 min-w-[200px]"
                    />
                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        className="input w-36"
                    >
                        <option value="">All Platforms</option>
                        <option value="facebook">📘 Facebook</option>
                        <option value="instagram">📷 Instagram</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="input w-32"
                    >
                        <option value="">All Types</option>
                        <option value="post">📝 Post</option>
                        <option value="event">📅 Event</option>
                        <option value="live_post">🔴 Live</option>
                    </select>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="card overflow-hidden p-0">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : campaigns.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No campaigns found</td>
                            </tr>
                        ) : (
                            campaigns.map((campaign) => (
                                <tr
                                    key={campaign._id}
                                    className="hover:bg-gray-50 cursor-pointer group"
                                    onClick={() => navigate(`/sales/campaigns/${campaign._id}`)}
                                    title="Click to view campaign orders"
                                >
                                    <td className="px-6 py-4">
                                        <div className="text-lg font-bold text-gray-900">{campaign.title}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getPlatformBadge(campaign.socialMedia)}`}>
                                                {campaign.socialMedia === 'facebook' ? '📘' : '📷'}
                                                {campaign.socialMedia === 'facebook' ? 'Facebook' : 'Instagram'}
                                            </span>
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(campaign.type)}`}>
                                                {campaign.type === 'post' ? '📝' : campaign.type === 'event' ? '📅' : '🔴'}
                                                {campaign.type === 'live_post' ? 'Live' : campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {campaign.stats?.orderCount || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{formatCurrency(campaign.stats?.totalSales)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-green-600">{formatCurrency(campaign.stats?.totalCommission)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <a
                                            href={campaign.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-600 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination
                    page={pagination.page}
                    pages={pagination.pages}
                    total={pagination.total}
                    onPageChange={(p) => setPagination({ ...pagination, page: p })}
                />
            </div>
        </div>
    );
}
