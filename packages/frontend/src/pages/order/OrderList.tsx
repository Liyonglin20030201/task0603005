import { useEffect, useState } from 'react';
import { Table, Input, Select, DatePicker, Button, Tag, Space, Card, Row, Col, Form } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { orderApi } from '../../api';

const { RangePicker } = DatePicker;

const statusOptions = [
  { label: '待付款', value: 'pending_payment' },
  { label: '已付款', value: 'paid' },
  { label: '发货中', value: 'shipping' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' },
];

const statusColorMap: Record<string, string> = {
  pending_payment: 'orange',
  paid: 'blue',
  shipping: 'cyan',
  shipped: 'purple',
  completed: 'green',
  cancelled: 'red',
  refunded: 'gray',
};

const statusLabelMap: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  shipping: '发货中',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export default function OrderList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderNo, setOrderNo] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (orderNo) params.orderNo = orderNo;
      if (status) params.status = status;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res: any = await orderApi.list(params);
      setData(res.list || res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setOrderNo('');
    setStatus(undefined);
    setDateRange(null);
    setPage(1);
    setTimeout(fetchData, 0);
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '用户ID', dataIndex: 'userId', key: 'userId' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => (
        <Tag color={statusColorMap[val] || 'default'}>
          {statusLabelMap[val] || val}
        </Tag>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => `¥${(val || 0).toFixed(2)}`,
    },
    {
      title: '实付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (val: number) => `¥${(val || 0).toFixed(2)}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Link to={`/orders/${record.id}`}>查看详情</Link>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col>
            <Input
              placeholder="订单号"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="订单状态"
              value={status}
              onChange={(val) => setStatus(val)}
              options={statusOptions}
              style={{ width: 150 }}
              allowClear
            />
          </Col>
          <Col>
            <RangePicker
              value={dateRange as any}
              onChange={(dates) => setDateRange(dates as any)}
            />
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
}
