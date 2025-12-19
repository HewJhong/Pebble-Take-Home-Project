import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { orderApi, campaignApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';

export default function OrderList() {
    const { user } = useAuth();
    const { isAdmin, isSales, canCreateOrder, canEditOrder, canDeleteOrder } = useRole();

    const [orders, setOrders] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [campaignFilter, setCampaignFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        campaign: '',
        items: [{ name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 10 };
            if (campaignFilter) params.campaign = campaignFilter;

            const data = await orderApi.list(params);
            setOrders(data.orders);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const data = await campaignApi.list({ limit: 100 });
            setCampaigns(data.campaigns);
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchCampaigns();
    }, [pagination.page, campaignFilter]);

    const openAddModal = () => {
        setEditingOrder(null);
        setFormData({
            campaign: campaigns[0]?._id || '',
            items: [{ name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setFormData({
            campaign: order.campaign._id,
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                basePrice: item.basePrice,
                totalPrice: item.totalPrice
            }))
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Recalculate total
        if (field === 'quantity' || field === 'basePrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].basePrice;
        }

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const getOrderTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (editingOrder) {
                await orderApi.update(editingOrder._id, { items: formData.items });
            } else {
                await orderApi.create(formData);
            }
            setIsModalOpen(false);
            fetchOrders();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (order) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            await orderApi.delete(order._id);
            fetchOrders();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatCurrency = (amount) => `RM ${amount.toFixed(2)}`;

    const getItemNames = (items) => {
        return items.map(i => `${i.name} ×${i.quantity}`).join(', ');
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isSales ? 'My Orders' : 'Orders'}
                </h1>
                {canCreateOrder && (
                    <button onClick={openAddModal} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-1" />
                        New Order
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex gap-4">
                    <select
                        value={campaignFilter}
                        onChange={(e) => setCampaignFilter(e.target.value)}
                        className="input w-64"
                    >
                        <option value="">All Campaigns</option>
                        {campaigns.map((c) => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                    </select>
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [newSortBy, newSortOrder] = e.target.value.split('-');
                            setSortBy(newSortBy);
                            setSortOrder(newSortOrder);
                        }}
                        className="input w-48"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="total-desc">Total High-Low</option>
                        <option value="commission-desc">Commission High-Low</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden p-0">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No orders found</td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 max-w-xs">
                                            {order.items.map(i => i.name).join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.campaign?.title}</div>
                                        <div className="text-xs text-gray-500">{order.campaign?.salesPerson?.name}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <div className="text-sm text-gray-900">
                                            {order.items.map(i => i.quantity).join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {order.items.map(i => formatCurrency(i.basePrice)).join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(order.orderTotal || order.items.reduce((s, i) => s + i.totalPrice, 0))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-green-600 font-medium">
                                            {formatCurrency(order.commission?.amount || 0)}
                                        </div>
                                        <div className="text-xs text-gray-500">({order.commission?.rateSnapshot}%)</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            {canEditOrder && (
                                                <button
                                                    onClick={() => openEditModal(order)}
                                                    className="text-primary-600 hover:text-primary-900 p-2 rounded hover:bg-primary-50 transition-colors"
                                                    title="Edit order"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            {canDeleteOrder && (
                                                <button
                                                    onClick={() => handleDelete(order)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                                                    title="Delete order"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
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
                title={editingOrder ? 'Edit Order' : 'New Order'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="label">Campaign</label>
                        <select
                            value={formData.campaign}
                            onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                            className="input"
                            disabled={!!editingOrder}
                            required
                        >
                            <option value="" disabled>Select Campaign</option>
                            {campaigns.map((c) => (
                                <option key={c._id} value={c._id}>{c.title} ({c.salesPerson?.name})</option>
                            ))}
                        </select>
                        {editingOrder && <p className="text-xs text-gray-500 mt-1">Campaign cannot be changed</p>}
                    </div>

                    <div>
                        <label className="label">Items</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Product"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        className="input flex-1"
                                        required
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                        onFocus={(e) => e.target.select()}
                                        className="input w-16"
                                        required
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Price"
                                        value={item.basePrice}
                                        onChange={(e) => updateItem(index, 'basePrice', parseFloat(e.target.value) || 0)}
                                        onFocus={(e) => e.target.select()}
                                        className="input w-24"
                                        required
                                    />
                                    <span className="text-sm text-gray-500 w-20">
                                        {formatCurrency(item.totalPrice || 0)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-red-500 hover:text-red-700"
                                        disabled={formData.items.length === 1}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addItem} className="mt-2 text-sm text-primary-600 hover:underline">
                            + Add Item
                        </button>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Order Total:</span>
                            <span className="font-bold">{formatCurrency(getOrderTotal())}</span>
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
