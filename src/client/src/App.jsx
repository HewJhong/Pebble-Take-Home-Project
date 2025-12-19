import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserList from './pages/admin/UserList';
import CampaignList from './pages/admin/CampaignList';
import CampaignDetail from './pages/admin/CampaignDetail';
import OrderList from './pages/admin/OrderList';
import Analytics from './pages/admin/Analytics';
import ActivityLog from './pages/admin/ActivityLog';
import SalesDashboard from './pages/sales/SalesDashboard';
import MyCampaigns from './pages/sales/MyCampaigns';
import CommissionView from './pages/sales/CommissionView';
import SalesAnalytics from './pages/sales/SalesAnalytics';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <UserList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campaigns"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <CampaignList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campaigns/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <CampaignDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <OrderList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <ActivityLog />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Sales routes */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['sales_person']}>
                <MainLayout>
                  <SalesDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/campaigns"
            element={
              <ProtectedRoute allowedRoles={['sales_person']}>
                <MainLayout>
                  <MyCampaigns />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/campaigns/:id"
            element={
              <ProtectedRoute allowedRoles={['sales_person']}>
                <MainLayout>
                  <CampaignDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/orders"
            element={
              <ProtectedRoute allowedRoles={['sales_person']}>
                <MainLayout>
                  <OrderList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/analytics"
            element={
              <ProtectedRoute allowedRoles={['sales_person']}>
                <MainLayout>
                  <SalesAnalytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
