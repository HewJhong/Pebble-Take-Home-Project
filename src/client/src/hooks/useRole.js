import { useAuth } from '../context/AuthContext';

/**
 * Hook to check user role permissions
 */
export const useRole = () => {
    const { user } = useAuth();

    return {
        isAdmin: user?.role === 'admin',
        isSales: user?.role === 'sales_person',
        userId: user?._id,
        canCreate: user?.role === 'admin',
        canCreateOrder: user?.role === 'admin' || user?.role === 'sales_person',
        canEdit: user?.role === 'admin',
        canDelete: user?.role === 'admin',
        canEditOrder: user?.role === 'admin' || user?.role === 'sales_person',
        canDeleteOrder: user?.role === 'admin' || user?.role === 'sales_person',
        canViewUsers: user?.role === 'admin',
        canViewActivityLog: user?.role === 'admin',
    };
};
