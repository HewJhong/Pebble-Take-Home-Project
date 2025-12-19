import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { orderApi, campaignApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import OrdersTable from '../../components/orders/OrdersTable';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';
import { useDebounce } from '../../hooks/useDebounce';

export default function OrderList() {
    const { user } = useAuth();
    const { isAdmin, isSales, canCreateOrder } = useRole();

    const [orders, setOrders] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [campaignFilter, setCampaignFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // New Order Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newOrderData, setNewOrderData] = useState({
        campaign: '',
        items: [{ name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 10, sortBy, sortOrder };
            if (campaignFilter) params.campaign = campaignFilter;
            if (debouncedSearch) params.search = debouncedSearch;

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
    }, [pagination.page, campaignFilter, debouncedSearch, sortBy, sortOrder]);

    const openAddModal = () => {
        setNewOrderData({
            campaign: campaigns[0]?._id || '',
            items: [{ name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]
        });
        setFormError('');
        setIsAddModalOpen(true);
    };

    const updateNewOrderItem = (index, field, value) => {
        const newItems = [...newOrderData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'basePrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].basePrice;
        }

        setNewOrderData({ ...newOrderData, items: newItems });
    };

    const addNewOrderItem = () => {
        setNewOrderData({
            ...newOrderData,
            items: [...newOrderData.items, { name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]
        });
    };

    const removeNewOrderItem = (index) => {
        if (newOrderData.items.length === 1) return;
        const newItems = newOrderData.items.filter((_, i) => i !== index);
        setNewOrderData({ ...newOrderData, items: newItems });
    };

    const getNewOrderTotal = () => {
        return newOrderData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    const handleAddOrder = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            await orderApi.create(newOrderData);
            setIsAddModalOpen(false);
            fetchOrders();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => `RM ${amount.toFixed(2)}`;

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
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input flex-1 min-w-[200px]"
                    />
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

            {/* Orders Table */}
            <div className="card overflow-hidden p-0">
                <OrdersTable
                    orders={orders}
                    loading={loading}
                    showCampaignColumn={true}
                    onRefresh={fetchOrders}
                />
                <Pagination
                    page={pagination.page}
                    pages={pagination.pages}
                    total={pagination.total}
                    onPageChange={(p) => setPagination({ ...pagination, page: p })}
                />
            </div>

            {/* Add New Order Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="New Order"
                size="xl"
            >
                <form onSubmit={handleAddOrder} className="space-y-4">
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="label">Campaign</label>
                        <select
                            value={newOrderData.campaign}
                            onChange={(e) => setNewOrderData({ ...newOrderData, campaign: e.target.value })}
                            className="input"
                            required
                        >
                            <option value="" disabled>Select Campaign</option>
                            {campaigns.map((c) => (
                                <option key={c._id} value={c._id}>{c.title} ({c.salesPerson?.name})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Items</label>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {newOrderData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                    <div className="col-span-6">
                                        <input
                                            type="text"
                                            placeholder="Product Name"
                                            value={item.name}
                                            onChange={(e) => updateNewOrderItem(index, 'name', e.target.value)}
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
                                            onChange={(e) => updateNewOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                            onFocus={(e) => e.target.select()}
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
                                            onChange={(e) => updateNewOrderItem(index, 'basePrice', parseFloat(e.target.value) || 0)}
                                            onFocus={(e) => e.target.select()}
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
                                            onClick={() => removeNewOrderItem(index)}
                                            className="text-red-500 hover:text-red-700 text-lg font-bold pt-1"
                                            disabled={newOrderData.items.length === 1}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addNewOrderItem} className="mt-2 text-sm text-primary-600 hover:underline">
                            + Add Item
                        </button>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Order Total:</span>
                            <span className="font-bold">{formatCurrency(getNewOrderTotal())}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
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
