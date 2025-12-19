import { useState, useEffect } from 'react';
import { activityApi, userApi } from '../../services/api';
import Pagination from '../../components/ui/Pagination';

const actionLabels = {
    // Login/Logout
    login: '🔑 Login',
    logout: '🚪 Logout',
    // Users (uppercase - as logged by routes)
    CREATE_USER: '👤+ User Created',
    UPDATE_USER: '👤✏️ User Updated',
    DELETE_USER: '👤🗑️ User Deleted',
    // Campaigns (uppercase - as logged by routes)
    CREATE_CAMPAIGN: '📢+ Campaign Created',
    UPDATE_CAMPAIGN: '📢✏️ Campaign Updated',
    DELETE_CAMPAIGN: '📢🗑️ Campaign Deleted',
    // Orders (uppercase - as logged by routes)
    CREATE_ORDER: '🛒+ Order Created',
    UPDATE_ORDER: '🛒✏️ Order Updated',
    DELETE_ORDER: '🛒🗑️ Order Deleted',
    // Commission
    commission_change: '💰 Commission Changed',
};

export default function ActivityLog() {
    const [activities, setActivities] = useState([]);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ action: '', user: '' });

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 20 };
            if (filters.action) params.action = filters.action;
            if (filters.user) params.user = filters.user;

            const data = await activityApi.list(params);
            setActivities(data.activities);
            setPagination(data.pagination);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await userApi.list({ limit: 100 });
            setUsers(data.users);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    useEffect(() => {
        fetchActivities();
        fetchUsers();
    }, [pagination.page, filters]);

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-MY', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">📋 Activity Log</h1>

            {/* Filters */}
            <div className="card mb-6 flex gap-4">
                <select
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    className="input w-48"
                >
                    <option value="">All Actions</option>
                    {Object.entries(actionLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <select
                    value={filters.user}
                    onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                    className="input w-48"
                >
                    <option value="">All Users</option>
                    {users.map((u) => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                </select>
            </div>

            {/* Activity Table */}
            <div className="card overflow-hidden p-0">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No activity logged yet
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activities.map((activity) => (
                                <tr key={activity._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(activity.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {activity.user?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm">
                                            {actionLabels[activity.action] || activity.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {activity.targetName || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {activity.details ? JSON.stringify(activity.details) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-4">
                    <Pagination
                        page={pagination.page}
                        pages={pagination.pages}
                        total={pagination.total}
                        onPageChange={(page) => setPagination({ ...pagination, page })}
                    />
                </div>
            )}
        </div>
    );
}
