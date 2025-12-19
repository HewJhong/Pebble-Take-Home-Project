import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { campaignApi, orderApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import OrdersTable from '../../components/orders/OrdersTable';
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Add Order Modal state
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
    const [newOrderItems, setNewOrderItems] = useState([{ name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]);
    const [addOrderSaving, setAddOrderSaving] = useState(false);

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

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            await campaignApi.delete(id);
            navigate('/admin/campaigns', { state: { message: 'Campaign deleted successfully.' } });
        } catch (err) {
            setError(err.message);
            setIsDeleteModalOpen(false);
        } finally {
            setDeleting(false);
        }
    };



    const totalSales = campaign?.stats?.totalSales || 0;
    const totalCommission = campaign?.stats?.totalCommission || 0;

    const handleAddOrderClick = () => {
        setNewOrderItems([{ name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]);
        setIsAddOrderModalOpen(true);
    };

    const handleItemChange = (index, field, value) => {
        const items = [...newOrderItems];
        items[index][field] = value;

        if (field === 'quantity' || field === 'basePrice') {
            items[index].totalPrice = (items[index].quantity || 0) * (items[index].basePrice || 0);
        }

        setNewOrderItems(items);
    };

    const handleAddItem = () => {
        setNewOrderItems([...newOrderItems, { name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]);
    };

    const handleRemoveItem = (index) => {
        if (newOrderItems.length === 1) return;
        const items = newOrderItems.filter((_, i) => i !== index);
        setNewOrderItems(items);
    };

    const calculateTotal = () => {
        return newOrderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setAddOrderSaving(true);
        try {
            const formattedItems = newOrderItems.map(item => ({
                ...item,
                totalPrice: item.quantity * item.basePrice
            }));
            await orderApi.create({
                campaign: id,
                items: formattedItems
            });
            setIsAddOrderModalOpen(false);
            fetchCampaign();
        } catch (err) {
            setError(err.message);
        } finally {
            setAddOrderSaving(false);
        }
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
                            <span className="text-gray-600">
                                <span className="font-medium text-gray-500 mr-1">Sales Person:</span>
                                {campaign?.salesPerson?.name}
                            </span>
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

                                // If there's no end date, the campaign only lasts for a single day (the start date)
                                // So the end date becomes the start date
                                const effectiveEndDate = campaign?.endDate || campaign?.startDate;

                                // For end date, we want to check if the entire day has passed
                                // So we compare against the end of the end date (23:59:59)
                                const endOfEndDate = effectiveEndDate ? new Date(effectiveEndDate) : null;
                                if (endOfEndDate) {
                                    endOfEndDate.setHours(23, 59, 59, 999);
                                }

                                // For start date, we compare against the start of the day (00:00:00)
                                const startOfStartDate = campaign?.startDate ? new Date(campaign.startDate) : null;
                                if (startOfStartDate) {
                                    startOfStartDate.setHours(0, 0, 0, 0);
                                }

                                const isExpired = endOfEndDate && now > endOfEndDate;
                                const isNotStarted = startOfStartDate && now < startOfStartDate;

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
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Orders</h2>
                    <button
                        onClick={handleAddOrderClick}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Order
                    </button>
                </div>
                <OrdersTable
                    orders={orders}
                    showCampaignColumn={false}
                    onRefresh={fetchCampaign}
                />
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !deleting && setIsDeleteModalOpen(false)}
                title="Delete Campaign"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">⚠️ This action cannot be undone</p>
                        <p className="text-red-700 text-sm mt-1">
                            Deleting this campaign will remove all associated orders and commission records.
                        </p>
                    </div>

                    {/* Deletion Impact */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Deletion Impact:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500">Orders Affected</div>
                                <div className="text-2xl font-semibold text-gray-900">{orders.length}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500">Commission Removed</div>
                                <div className="text-2xl font-semibold text-red-600">{formatCurrency(totalCommission)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="btn-red bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
                        >
                            {deleting ? 'Deleting...' : 'Delete Campaign'}
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Danger Zone - Admins Only */}
            {
                user?.role === 'admin' && (
                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-red-800">Danger Zone</h3>
                            <p className="mt-1 text-sm text-red-600 mb-4">
                                Deleting this campaign will also remove all associated orders and commissions. This action cannot be undone.
                            </p>
                            <button
                                onClick={handleDeleteClick}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm transition-colors text-sm font-medium"
                            >
                                Delete Campaign
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Add Order Modal */}
            <Modal
                isOpen={isAddOrderModalOpen}
                onClose={() => setIsAddOrderModalOpen(false)}
                title="Add New Order"
                size="xl"
            >
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {newOrderItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Price"
                                        value={item.basePrice}
                                        onChange={(e) => handleItemChange(index, 'basePrice', parseFloat(e.target.value) || 0)}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 text-sm text-gray-600 pt-2 text-center">
                                    {formatCurrency(item.totalPrice || 0).replace('RM ', '')}
                                </div>
                                <div className="col-span-1 text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Remove item"
                                        disabled={newOrderItems.length === 1}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="mt-2 text-sm text-primary-600 hover:underline flex items-center gap-1"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Item
                    </button>

                    <div className="border-t pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Order Total:</span>
                            <span className="font-bold">{formatCurrency(calculateTotal())}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsAddOrderModalOpen(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addOrderSaving}
                            className="btn-primary"
                        >
                            {addOrderSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
