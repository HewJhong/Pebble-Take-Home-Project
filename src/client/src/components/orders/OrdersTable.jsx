import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { orderApi } from '../../services/api';
import Modal from '../ui/Modal';
import { useRole } from '../../hooks/useRole';

/**
 * Reusable OrdersTable component with edit/delete functionality
 * 
 * @param {Object} props
 * @param {Array} props.orders - Array of order objects
 * @param {Function} props.onRefresh - Callback to refresh orders after edit/delete
 * @param {boolean} props.showCampaignColumn - Whether to show campaign column (false for CampaignDetail)
 * @param {boolean} props.loading - Loading state
 */
export default function OrdersTable({
    orders = [],
    onRefresh,
    showCampaignColumn = true,
    loading = false
}) {
    const { canEditOrder, canDeleteOrder } = useRole();

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editItems, setEditItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const formatCurrency = (amount) => `RM ${(amount || 0).toFixed(2)}`;

    const openEditModal = (order) => {
        setEditingOrder(order);
        setEditItems(order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            basePrice: item.basePrice,
            totalPrice: item.totalPrice
        })));
        setError('');
        setIsEditModalOpen(true);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...editItems];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'basePrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].basePrice;
        }

        setEditItems(newItems);
    };

    const addItem = () => {
        setEditItems([...editItems, { name: '', quantity: 1, basePrice: 0, totalPrice: 0 }]);
    };

    const removeItem = (index) => {
        if (editItems.length === 1) {
            // Clear the item fields instead of removing
            const clearedItems = [...editItems];
            clearedItems[0] = { name: '', quantity: 1, basePrice: 0, totalPrice: 0 };
            setEditItems(clearedItems);
        } else {
            setEditItems(editItems.filter((_, i) => i !== index));
        }
    };

    const getOrderTotal = () => {
        return editItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            await orderApi.update(editingOrder._id, { items: editItems });
            setIsEditModalOpen(false);
            if (onRefresh) onRefresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (order) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            await orderApi.delete(order._id);
            if (onRefresh) onRefresh();
        } catch (err) {
            setError(err.message);
        }
    };

    const colSpan = showCampaignColumn ? 7 : 6;
    const showActions = canEditOrder || canDeleteOrder;

    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {!showCampaignColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        {showCampaignColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                        )}
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                        {showActions && (
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={colSpan} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                        </tr>
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} className="px-6 py-4 text-center text-gray-500">No orders found</td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                {!showCampaignColumn && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 max-w-xs">
                                        {order.items.map(i => i.name).join(', ')}
                                    </div>
                                </td>
                                {showCampaignColumn && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.campaign?.title}</div>
                                        <div className="text-xs text-gray-500">{order.campaign?.salesPerson?.name}</div>
                                    </td>
                                )}
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
                                {showActions && (
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
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Edit Order Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Order"
            >
                <form onSubmit={handleSaveEdit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="label">Campaign</label>
                        <input
                            type="text"
                            value={editingOrder?.campaign?.title || 'Unknown'}
                            className="input bg-gray-100 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Campaign cannot be changed</p>
                    </div>

                    <div>
                        <label className="label">Items</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {editItems.map((item, index) => (
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
                                        title={editItems.length === 1 ? 'Clear item' : 'Remove item'}
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
                            onClick={() => setIsEditModalOpen(false)}
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
        </>
    );
}
