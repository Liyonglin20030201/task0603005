import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/product/ProductList';
import ProductForm from './pages/product/ProductForm';
import CategoryList from './pages/category/CategoryList';
import InventoryList from './pages/inventory/InventoryList';
import OrderList from './pages/order/OrderList';
import OrderDetail from './pages/order/OrderDetail';
import UserList from './pages/user/UserList';
import CouponList from './pages/coupon/CouponList';
import AdminList from './pages/admin/AdminList';
import RoleList from './pages/role/RoleList';
import LogList from './pages/log/LogList';
import ReportDashboard from './pages/report/ReportDashboard';
import NotificationList from './pages/notification/NotificationList';
import ShipmentList from './pages/shipment/ShipmentList';
import ForecastList from './pages/forecast/ForecastList';
import CampaignList from './pages/campaign/CampaignList';
import CampaignForm from './pages/campaign/CampaignForm';
import CampaignDetail from './pages/campaign/CampaignDetail';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="inventory" element={<InventoryList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="users" element={<UserList />} />
        <Route path="coupons" element={<CouponList />} />
        <Route path="admins" element={<AdminList />} />
        <Route path="roles" element={<RoleList />} />
        <Route path="logs" element={<LogList />} />
        <Route path="reports" element={<ReportDashboard />} />
        <Route path="notifications" element={<NotificationList />} />
        <Route path="shipments" element={<ShipmentList />} />
        <Route path="forecast" element={<ForecastList />} />
        <Route path="campaigns" element={<CampaignList />} />
        <Route path="campaigns/create" element={<CampaignForm />} />
        <Route path="campaigns/:id/edit" element={<CampaignForm />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
