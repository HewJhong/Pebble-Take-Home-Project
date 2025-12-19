import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { campaignApi, orderApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [campaign, setCampaign] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    const backPath = user?.role === 'admin' ? '/admin/campaigns' : '/sales/campaigns';

    const fetchCampaign = async () => {
        try {
            setLoading(true);
            const [campaignData, ordersData] = await Promise.all([
                campaignApi.get(id),
                orderApi.list({ campaign: id, limit: 100 })
            ]);
            setCampaign(campaignData);
            setOrders(ordersData.orders);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaign();
    }, [id]);

    const formatCurrency = (amount) => `RM ${amount?.toFixed(2) || '0.00'}`;

    const handleEditClick = () => {
        setEditForm({
            title: campaign?.title || '',
            url: campaign?.url || '',
            imageUrl: campaign?.imageUrl || '',
            socialMedia: campaign?.socialMedia || 'facebook',
            type: campaign?.type || 'post',
            startDate: campaign?.startDate ? campaign.startDate.split('T')[0] : '',
            endDate: campaign?.endDate ? campaign.endDate.split('T')[0] : '',
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            await campaignApi.update(id, editForm);
            await fetchCampaign();
            setShowEditModal(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const totalSales = orders.reduce((sum, o) =>
        sum + o.items.reduce((s, i) => s + i.totalPrice, 0), 0
    );
    const totalCommission = orders.reduce((sum, o) => sum + (o.commission?.amount || 0), 0);

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

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(backPath)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Campaigns
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{campaign?.title}</h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-gray-600">{campaign?.salesPerson?.name}</span>
                            <span className="text-gray-300">•</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign?.socialMedia === 'facebook'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                }`}>
                                {campaign?.socialMedia === 'facebook' ? '📘 Facebook' : '📷 Instagram'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign?.type === 'post'
                                ? 'bg-gray-100 text-gray-800'
                                : campaign?.type === 'event'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {campaign?.type === 'post' ? '📝 Post' : campaign?.type === 'event' ? '📅 Event' : '🔴 Live'}
                            </span>
                            {(() => {
                                const now = new Date();
                                const isExpired = campaign?.endDate && new Date(campaign.endDate) < now;
                                const isNotStarted = campaign?.startDate && new Date(campaign.startDate) > now;
                                const statusClass = isExpired ? 'bg-gray-100 text-gray-500' : isNotStarted ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
                                const statusLabel = isExpired ? 'Ended' : isNotStarted ? 'Scheduled' : 'Active';
                                return (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                                        {statusLabel}
                                    </span>
                                );
                            })()}
                        </div>
                        {(campaign?.startDate || campaign?.endDate) && (
                            <div className="text-sm text-gray-500 mt-2">
                                📅 {campaign?.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'No start date'}
                                {' — '}
                                {campaign?.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'No end date'}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {user?.role === 'admin' && (
                            <button
                                onClick={handleEditClick}
                                className="btn-secondary flex items-center gap-1"
                            >
                                <PencilIcon className="h-4 w-4" />
                                Edit
                            </button>
                        )}
                        <a
                            href={campaign?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                        >
                            View Campaign URL
                        </a>
                    </div>
                </div>
            </div>

            {/* Campaign Image */}
            <div className="mb-6">
                <div className="card p-4">
                    <img
                        src={campaign?.imageUrl || (campaign?.socialMedia === 'instagram' ? '/instagram-campaign-placeholder.png' : '/facebook-campaign-placeholder.png')}
                        alt={campaign?.title}
                        className="w-full max-h-64 object-cover rounded-lg"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/800x400/fee2e2/dc2626?text=Image+Not+Found';
                        }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-500">Total Commission</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCommission)}</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Orders</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No orders yet
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(order.items.reduce((s, i) => s + i.totalPrice, 0))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-green-600">
                                            {formatCurrency(order.commission?.amount)}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({order.commission?.rateSnapshot}%)
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Campaign Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Campaign"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sales Person</label>
                        <input
                            type="text"
                            value={campaign?.salesPerson?.name || 'Unknown'}
                            className="input w-full bg-gray-100 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Sales person cannot be changed</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <input
                            type="url"
                            value={editForm.url || ''}
                            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                            type="url"
                            value={editForm.imageUrl || ''}
                            onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                            className="input w-full"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Social Media</label>
                            <select
                                value={editForm.socialMedia || 'facebook'}
                                onChange={(e) => setEditForm({ ...editForm, socialMedia: e.target.value })}
                                className="input w-full"
                            >
                                <option value="facebook">📘 Facebook</option>
                                <option value="instagram">📷 Instagram</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={editForm.type || 'post'}
                                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                className="input w-full"
                            >
                                <option value="post">📝 Post</option>
                                <option value="event">📅 Event</option>
                                <option value="live">🔴 Live</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={editForm.startDate || ''}
                                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={editForm.endDate || ''}
                                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="btn-primary flex-1"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
