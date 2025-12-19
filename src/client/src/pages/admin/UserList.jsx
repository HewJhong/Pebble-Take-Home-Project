import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { userApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';

export default function UserList() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [activeTab, setActiveTab] = useState(0); // 0 = Admins, 1 = Sales Persons
    const roleFilter = activeTab === 0 ? 'admin' : 'sales_person';
    const isSalesTab = activeTab === 1;
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Commission color coding: Green (<15%), Yellow (15-25%), Red (>25%)
    const getCommissionColor = (rate) => {
        if (rate < 15) return 'text-green-600 bg-green-50';
        if (rate <= 25) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    // Calculate commission delta from history
    const getCommissionDelta = (user) => {
        if (!user.commissionHistory || user.commissionHistory.length < 1) return null;
        const history = user.commissionHistory;
        if (history.length === 1) {
            // First rate set, no previous to compare
            return null;
        }
        const prevRate = history[history.length - 2]?.rate || 0;
        const currentRate = user.commissionRate;
        const delta = currentRate - prevRate;
        if (delta === 0) return null;
        return delta > 0 ? `+${delta}%` : `${delta}%`;
    };

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'sales_person',
        commissionRate: 10
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete confirmation state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null, impact: null, loading: false });

    // User detail modal state
    const [detailModal, setDetailModal] = useState({ isOpen: false, user: null });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 10, sortBy, sortOrder };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;

            const data = await userApi.list(params);
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, debouncedSearch, roleFilter, sortBy, sortOrder]);

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            name: '',
            role: 'sales_person',
            commissionRate: 10
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            name: user.name,
            role: user.role,
            commissionRate: user.commissionRate || 0
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (editingUser) {
                const updateData = { ...formData };
                delete updateData.username; // Can't change username
                if (!updateData.password) delete updateData.password; // Only update if provided
                await userApi.update(editingUser._id, updateData);
            } else {
                await userApi.create(formData);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = async (user) => {
        // Prevent admins from deleting themselves
        if (currentUser && user._id === currentUser._id) {
            setError('You cannot delete your own account. Please ask another admin to do this.');
            setTimeout(() => setError(''), 5000);
            return;
        }

        // For admin users, no need to check impact (no campaigns/commissions)
        if (user.role === 'admin') {
            setDeleteModal({ isOpen: true, user, impact: { isAdmin: true }, loading: false });
            return;
        }

        setDeleteModal({ isOpen: true, user, impact: null, loading: true });
        try {
            const impact = await userApi.getImpact(user._id);
            setDeleteModal(prev => ({ ...prev, impact, loading: false }));
        } catch (err) {
            setDeleteModal(prev => ({ ...prev, loading: false }));
            setError(err.message);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.user) return;
        try {
            await userApi.delete(deleteModal.user._id);
            setDeleteModal({ isOpen: false, user: null, impact: null, loading: false });
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button onClick={openAddModal} className="btn-primary">
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Add User
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Tabs and Filters */}
            <div className="mb-6">
                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                    <Tab.List className="flex border-b border-gray-200 mb-4">
                        <Tab
                            className={({ selected }) =>
                                `px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px
                                ${selected
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                            }
                        >
                            👤 Admins
                        </Tab>
                        <Tab
                            className={({ selected }) =>
                                `px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px
                                ${selected
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                            }
                        >
                            💼 Sales Persons
                        </Tab>
                    </Tab.List>
                </Tab.Group>
                <div className="card">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input flex-1"
                        />
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
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            {isSalesTab && <option value="commissionRate-desc">Commission High-Low</option>}
                            {isSalesTab && <option value="commissionRate-asc">Commission Low-High</option>}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden p-0">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            {isSalesTab && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Rate</th>
                            )}
                            {isSalesTab && (
                                <>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                </>
                            )}
                            {!isSalesTab && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={isSalesTab ? 6 : 4} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={isSalesTab ? 6 : 4} className="px-6 py-4 text-center text-gray-500">No users found</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setDetailModal({ isOpen: true, user })}
                                    title="Click to view user details"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role === 'admin' ? 'Admin' : 'Sales Person'}
                                        </span>
                                    </td>
                                    {isSalesTab && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex px-2.5 py-1 text-sm font-semibold rounded-md ${getCommissionColor(user.commissionRate)}`}>
                                                    {user.commissionRate}%
                                                </span>
                                                {getCommissionDelta(user) && (
                                                    <span className={`text-xs font-medium ${getCommissionDelta(user).startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                                        {getCommissionDelta(user)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Since {new Date(
                                                    user.commissionHistory?.length > 0
                                                        ? user.commissionHistory[user.commissionHistory.length - 1].changedAt
                                                        : user.createdAt
                                                ).toLocaleDateString()}
                                            </div>
                                        </td>
                                    )}
                                    {isSalesTab && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-medium text-gray-900">{formatCurrency(user.stats?.totalSales || 0)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-medium text-green-600">{formatCurrency(user.stats?.totalCommission || 0)}</span>
                                            </td>
                                        </>
                                    )}
                                    {!isSalesTab && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(user); }}
                                                    className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50 transition-colors"
                                                    title="Edit user"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(user); }}
                                                    disabled={currentUser && user._id === currentUser._id}
                                                    className={`p-1 rounded transition-colors ${
                                                        currentUser && user._id === currentUser._id
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                                    }`}
                                                    title={currentUser && user._id === currentUser._id ? "You cannot delete your own account" : "Delete user"}
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
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
                title={editingUser ? 'Edit User' : 'Add New User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="label">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="input"
                            disabled={!!editingUser}
                            required
                        />
                        {editingUser && <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>}
                    </div>

                    <div>
                        <label className="label">{editingUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input"
                            autoComplete="off"
                            required={!editingUser}
                        />
                    </div>

                    <div>
                        <label className="label">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="input"
                        >
                            <option value="admin">Admin</option>
                            <option value="sales_person">Sales Person</option>
                        </select>
                    </div>

                    {formData.role === 'sales_person' && (
                        <div>
                            <label className="label">Commission Rate (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.commissionRate}
                                onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                                className="input"
                            />
                            {editingUser && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                    ⚠️ Commission changes apply to new orders only
                                </p>
                            )}
                        </div>
                    )}

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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, user: null, impact: null, loading: false })}
                title="Delete User"
            >
                {deleteModal.loading ? (
                    <div className="text-center py-8 text-gray-500">Loading impact...</div>
                ) : deleteModal.impact && (
                    <div className="space-y-4">
                        {deleteModal.impact.isAdmin ? (
                            // Simple admin delete confirmation
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-amber-800 font-medium">⚠️ Confirm deletion</p>
                                <p className="text-amber-700 text-sm mt-1">
                                    Are you sure you want to delete this admin user? This action cannot be undone.
                                </p>
                            </div>
                        ) : (
                            // Sales person delete with impact details
                            <>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">⚠️ This action cannot be undone</p>
                                    <p className="text-red-700 text-sm mt-1">
                                        Deleting this user will remove all their campaigns and commission records.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-gray-500">Campaigns</div>
                                        <div className="text-xl font-semibold">{deleteModal.impact.campaignCount}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-gray-500">Commission at Risk</div>
                                        <div className="text-xl font-semibold text-red-600">{formatCurrency(deleteModal.impact.totalCommission)}</div>
                                    </div>
                                </div>

                                {deleteModal.impact.campaigns?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Affected campaigns:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-700 max-h-32 overflow-y-auto">
                                            {deleteModal.impact.campaigns.map(c => (
                                                <li key={c._id}>{c.title}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, user: null, impact: null, loading: false })}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete {deleteModal.user?.name}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* User Detail Modal */}
            <Modal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, user: null })}
                title={detailModal.user?.name || 'User Details'}
            >
                {detailModal.user && (
                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Username</p>
                                <p className="font-medium">{detailModal.user.username}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Role</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${detailModal.user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {detailModal.user.role === 'admin' ? 'Admin' : 'Sales Person'}
                                </span>
                            </div>
                        </div>

                        {/* Commission Info (Sales only) */}
                        {detailModal.user.role === 'sales_person' && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-gray-500 text-sm">Current Commission Rate</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Effective: {new Date(
                                                detailModal.user.commissionHistory?.length > 0
                                                    ? detailModal.user.commissionHistory[detailModal.user.commissionHistory.length - 1].changedAt
                                                    : detailModal.user.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-2.5 py-1 text-sm font-semibold rounded-md ${getCommissionColor(detailModal.user.commissionRate)}`}>
                                            {detailModal.user.commissionRate}%
                                        </span>
                                        {getCommissionDelta(detailModal.user) && (
                                            <div className={`text-xs font-medium mt-1 ${getCommissionDelta(detailModal.user).startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                                {getCommissionDelta(detailModal.user)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {detailModal.user.commissionHistory?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-2">Commission History</p>
                                        <div className="max-h-24 overflow-y-auto space-y-1">
                                            {detailModal.user.commissionHistory.slice().reverse().map((h, i) => (
                                                <div key={i} className="flex justify-between text-xs">
                                                    <span className="text-gray-600">{h.rate}%</span>
                                                    <span className="text-gray-400">{new Date(h.changedAt).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setDetailModal({ isOpen: false, user: null });
                                    openEditModal(detailModal.user);
                                }}
                                className="btn-secondary"
                            >
                                Edit User
                            </button>
                            <button
                                onClick={() => {
                                    setDetailModal({ isOpen: false, user: null });
                                    handleDeleteClick(detailModal.user);
                                }}
                                disabled={currentUser && detailModal.user._id === currentUser._id}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    currentUser && detailModal.user._id === currentUser._id
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                                title={currentUser && detailModal.user._id === currentUser._id ? "You cannot delete your own account" : "Delete user"}
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
