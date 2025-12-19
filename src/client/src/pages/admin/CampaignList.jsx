import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { campaignApi, userApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

export default function CampaignList() {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [salesPersons, setSalesPersons] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [platformFilter, setPlatformFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        salesPerson: '',
        socialMedia: 'facebook',
        type: 'post',
        url: '',
        imageUrl: '',
        startDate: '',
        endDate: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 10, sortBy, sortOrder };
            if (search) params.search = search;
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

    const fetchSalesPersons = async () => {
        try {
            const data = await userApi.list({ role: 'sales_person', limit: 100 });
            setSalesPersons(data.users);
        } catch (err) {
            console.error('Failed to fetch sales persons:', err);
        }
    };

    useEffect(() => {
        fetchCampaigns();
        fetchSalesPersons();
    }, [pagination.page, debouncedSearch, platformFilter, typeFilter, sortBy, sortOrder]);

    const openAddModal = () => {
        setEditingCampaign(null);
        setFormData({
            title: '',
            salesPerson: salesPersons[0]?._id || '',
            socialMedia: 'facebook',
            type: 'post',
            url: '',
            imageUrl: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: ''
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            title: campaign.title,
            salesPerson: campaign.salesPerson._id,
            socialMedia: campaign.socialMedia,
            type: campaign.type,
            url: campaign.url,
            imageUrl: campaign.imageUrl || '',
            startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
            endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : ''
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (editingCampaign) {
                const { salesPerson, ...updateData } = formData; // Remove salesPerson
                await campaignApi.update(editingCampaign._id, updateData);
            } else {
                await campaignApi.create(formData);
            }
            setIsModalOpen(false);
            fetchCampaigns();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (campaign) => {
        if (!window.confirm(`Delete "${campaign.title}"?\n\nWarning: All orders and commissions under this campaign will also be deleted.`)) return;

        try {
            await campaignApi.delete(campaign._id);
            fetchCampaigns();
        } catch (err) {
            setError(err.message);
        }
    };

    const getPlatformBadge = (platform) => {
        return platform === 'facebook'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-pink-100 text-pink-800';
    };

    const getTypeBadge = (type) => {
        const styles = {
            post: 'bg-gray-100 text-gray-800',
            event: 'bg-green-100 text-green-800',
            live_post: 'bg-red-100 text-red-800'
        };
        return styles[type] || styles.post;
    };

    const formatCurrency = (amount) => `RM ${(amount || 0).toFixed(2)}`;

    const getStatusBadge = (campaign) => {
        const now = new Date();
        const isExpired = campaign.endDate && new Date(campaign.endDate) < now;
        const isNotStarted = campaign.startDate && new Date(campaign.startDate) > now;

        if (isExpired) {
            return { class: 'bg-gray-100 text-gray-500', label: 'Ended' };
        } else if (isNotStarted) {
            return { class: 'bg-yellow-100 text-yellow-700', label: 'Scheduled' };
        }
        return { class: 'bg-green-100 text-green-700', label: 'Active' };
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                <button onClick={openAddModal} className="btn-primary">
                    <PlusIcon className="h-5 w-5 mr-1" />
                    New Campaign
                </button>
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
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="input w-32"
                    >
                        <option value="">All Types</option>
                        <option value="post">Post</option>
                        <option value="event">Event</option>
                        <option value="live_post">Live</option>
                    </select>
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                        className="input w-40"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="title-asc">Title A-Z</option>
                        <option value="title-desc">Title Z-A</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden p-0">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Person</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : campaigns.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No campaigns found</td>
                            </tr>
                        ) : (
                            campaigns.map((campaign) => (
                                <tr
                                    key={campaign._id}
                                    className="hover:bg-gray-50 cursor-pointer group"
                                    onClick={() => navigate(`/admin/campaigns/${campaign._id}`)}
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
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(campaign).class}`}>
                                                {getStatusBadge(campaign).label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {campaign.salesPerson?.name || 'Unknown'}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(campaign); }}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                            title="Delete campaign"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCampaign ? 'Edit Campaign' : 'New Campaign'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="label">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Sales Person</label>
                        <select
                            value={formData.salesPerson}
                            onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                            className="input"
                            disabled={!!editingCampaign}
                            required
                        >
                            <option value="" disabled>Select Sales Person</option>
                            {salesPersons.map((sp) => (
                                <option key={sp._id} value={sp._id}>{sp.name}</option>
                            ))}
                        </select>
                        {editingCampaign && <p className="text-xs text-gray-500 mt-1">Sales person cannot be changed</p>}
                    </div>

                    <div>
                        <label className="label">Platform</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="platform"
                                    value="facebook"
                                    checked={formData.socialMedia === 'facebook'}
                                    onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                                    className="mr-2"
                                />
                                Facebook
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="platform"
                                    value="instagram"
                                    checked={formData.socialMedia === 'instagram'}
                                    onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                                    className="mr-2"
                                />
                                Instagram
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="label">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="input"
                        >
                            <option value="post">Post</option>
                            <option value="event">Event</option>
                            <option value="live_post">Live Post</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">URL</label>
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="input"
                            placeholder="https://..."
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Image URL (Optional)</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="input"
                            placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Add an image to showcase this campaign</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">End Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="input"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
