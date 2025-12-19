const API_URL = 'http://localhost:5000/api';

// Generic fetch wrapper with credentials
const fetchApi = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
};

// User API
export const userApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/users?${query}`);
    },
    get: (id) => fetchApi(`/users/${id}`),
    getImpact: (id) => fetchApi(`/users/${id}/impact`),
    create: (data) => fetchApi('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
};

// Campaign API
export const campaignApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/campaigns?${query}`);
    },
    get: (id) => fetchApi(`/campaigns/${id}`),
    create: (data) => fetchApi('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/campaigns/${id}`, { method: 'DELETE' }),
};

// Order API
export const orderApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/orders?${query}`);
    },
    get: (id) => fetchApi(`/orders/${id}`),
    create: (data) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/orders/${id}`, { method: 'DELETE' }),
};

// Dashboard API
export const dashboardApi = {
    adminStats: () => fetchApi('/dashboard/admin/stats'),
    salesStats: () => fetchApi('/dashboard/sales/stats'),
    commissions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/dashboard/sales/commissions?${query}`);
    },
    commissionDetail: (yearMonth) => fetchApi(`/dashboard/sales/commissions/${yearMonth}`),
};

// Analytics API
export const analyticsApi = {
    campaigns: () => fetchApi('/analytics/campaigns'),
    myCampaigns: () => fetchApi('/analytics/my-campaigns'),
    getSalesDashboard: () => fetchApi('/analytics/sales-dashboard'),
    salesPersons: () => fetchApi('/analytics/sales-persons'),
    summary: () => fetchApi('/analytics/summary'),
    aiSummary: () => fetchApi('/analytics/ai-summary'),
    trends: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/analytics/trends?${query}`);
    },
};

// Activity Log API
export const activityApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/activities?${query}`);
    },
};
