import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { reportApi } from '../api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    reportApi.dashboard().then((res: any) => setData(res));
  }, []);

  if (!data) return null;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="总订单数" value={data.totalOrders} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="今日订单" value={data.todayOrders} prefix={<ShoppingCartOutlined />} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="总商品数" value={data.totalProducts} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="总用户数" value={data.totalUsers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="总销售额" value={data.totalSales} prefix="¥" precision={2} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="库存预警" value={data.lowStockCount} prefix={<WarningOutlined />} valueStyle={{ color: data.lowStockCount > 0 ? '#cf1322' : undefined }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
