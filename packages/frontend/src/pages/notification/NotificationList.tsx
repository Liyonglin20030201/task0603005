import { useState, useEffect } from 'react';
import { Card, Table, Button, Select, Space, Tag, message, Popconfirm } from 'antd';
import { notificationApi } from '../../api';

const typeOptions = [
  { label: '全部', value: '' },
  { label: '系统通知', value: 'system' },
  { label: '库存预警', value: 'inventory_warning' },
  { label: '订单通知', value: 'order' },
  { label: '活动通知', value: 'campaign' },
];

const levelColors: Record<string, string> = {
  info: 'blue',
  warning: 'orange',
  error: 'red',
};

export default function NotificationList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [type, setType] = useState('');
  const [isRead, setIsRead] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (type) params.type = type;
      if (isRead) params.isRead = isRead;
      const res: any = await notificationApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, type, isRead]);

  const handleMarkRead = async () => {
    if (selectedRowKeys.length === 0) return;
    await notificationApi.markRead(selectedRowKeys);
    message.success('标记成功');
    setSelectedRowKeys([]);
    fetchData();
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    message.success('全部标记已读');
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await notificationApi.delete(id);
    message.success('删除成功');
    fetchData();
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      render: (v: string) => {
        const labels: Record<string, string> = { system: '系统', inventory_warning: '库存', order: '订单', campaign: '活动' };
        return <Tag>{labels[v] || v}</Tag>;
      },
    },
    {
      title: '级别',
      dataIndex: 'level',
      render: (v: string) => <Tag color={levelColors[v]}>{v}</Tag>,
    },
    { title: '标题', dataIndex: 'title' },
    { title: '内容', dataIndex: 'content', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'isRead',
      render: (v: boolean) => (v ? <Tag>已读</Tag> : <Tag color="red">未读</Tag>),
    },
    { title: '时间', dataIndex: 'createdAt', width: 180 },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger size="small">删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={type}
            onChange={setType}
            options={typeOptions}
            style={{ width: 120 }}
            placeholder="通知类型"
          />
          <Select
            value={isRead}
            onChange={setIsRead}
            options={[
              { label: '全部', value: '' },
              { label: '未读', value: 'false' },
              { label: '已读', value: 'true' },
            ]}
            style={{ width: 100 }}
          />
          <Button onClick={handleMarkRead} disabled={selectedRowKeys.length === 0}>
            标记已读
          </Button>
          <Button onClick={handleMarkAllRead}>全部已读</Button>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>
    </div>
  );
}
