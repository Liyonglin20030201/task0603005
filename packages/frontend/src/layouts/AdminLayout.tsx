import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  InboxOutlined,
  OrderedListOutlined,
  UserOutlined,
  GiftOutlined,
  TeamOutlined,
  SafetyOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  CarOutlined,
  ThunderboltOutlined,
  BellOutlined,
  AccountBookOutlined,
  ExperimentOutlined,
  NodeIndexOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth';
import NotificationBell from '../components/NotificationBell';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
  { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/inventory', icon: <InboxOutlined />, label: '库存管理' },
  { key: '/forecast', icon: <LineChartOutlined />, label: '库存预测' },
  { key: '/orders', icon: <OrderedListOutlined />, label: '订单管理' },
  { key: '/shipments', icon: <CarOutlined />, label: '物流追踪' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/coupons', icon: <GiftOutlined />, label: '优惠券管理' },
  { key: '/channels', icon: <ClusterOutlined />, label: '多渠道订单' },
  { key: '/lifecycle', icon: <NodeIndexOutlined />, label: '商品生命周期' },
  { key: '/campaigns', icon: <ThunderboltOutlined />, label: '营销活动' },
  { key: '/ab-tests', icon: <ExperimentOutlined />, label: 'A/B测试' },
  { key: '/reconciliation', icon: <AccountBookOutlined />, label: '财务对账' },
  { key: '/notifications', icon: <BellOutlined />, label: '消息通知' },
  { key: '/admins', icon: <TeamOutlined />, label: '管理员管理' },
  { key: '/roles', icon: <SafetyOutlined />, label: '角色管理' },
  { key: '/logs', icon: <FileTextOutlined />, label: '操作日志' },
  { key: '/reports', icon: <BarChartOutlined />, label: '数据报表' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuthStore();
  const { token: { colorBgContainer } } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropdownItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: collapsed ? 14 : 18, whiteSpace: 'nowrap' }}>
            {collapsed ? '电商' : '电商后台管理'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationBell />
            <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{admin?.nickname || admin?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: colorBgContainer, borderRadius: 8, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
