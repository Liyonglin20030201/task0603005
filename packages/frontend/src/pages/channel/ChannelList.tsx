import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Switch,
  Modal,
  Form,
  Tabs,
  Badge,
  Statistic,
  DatePicker,
  Popconfirm,
  message,
  Row,
  Col,
} from 'antd';
import { SyncOutlined, PlusOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { channelApi, channelOrderApi } from '../../api';

const { RangePicker } = DatePicker;

const platformLabels: Record<string, string> = {
  taobao: '淘宝/天猫',
  jd: '京东',
  pdd: '拼多多',
  douyin: '抖音',
  weixin: '微信小店',
  self: '自营商城',
};

const platformColors: Record<string, string> = {
  taobao: 'orange',
  jd: 'red',
  pdd: 'volcano',
  douyin: 'purple',
  weixin: 'green',
  self: 'blue',
};

const syncStatusLabels: Record<string, string> = {
  pending: '待同步',
  synced: '已同步',
  failed: '同步失败',
};

const syncStatusColors: Record<string, string> = {
  pending: 'default',
  synced: 'success',
  failed: 'error',
};

export default function ChannelList() {
  const [activeTab, setActiveTab] = useState('channels');
  const [channels, setChannels] = useState<any[]>([]);
  const [channelLoading, setChannelLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [form] = Form.useForm();

  // Order state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(20);
  const [filterPlatform, setFilterPlatform] = useState<string | undefined>();
  const [filterSyncStatus, setFilterSyncStatus] = useState<string | undefined>();
  const [filterOrderNo, setFilterOrderNo] = useState('');
  const [filterDates, setFilterDates] = useState<any>(null);

  const fetchChannels = async () => {
    setChannelLoading(true);
    try {
      const res: any = await channelApi.list();
      setChannels(Array.isArray(res) ? res : res.items || []);
    } finally {
      setChannelLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrderLoading(true);
    try {
      const params: any = { page: orderPage, pageSize: orderPageSize };
      if (filterPlatform) params.platform = filterPlatform;
      if (filterSyncStatus) params.syncStatus = filterSyncStatus;
      if (filterOrderNo) params.platformOrderNo = filterOrderNo;
      if (filterDates && filterDates[0]) {
        params.startDate = filterDates[0].format('YYYY-MM-DD');
        params.endDate = filterDates[1].format('YYYY-MM-DD');
      }
      const res: any = await channelOrderApi.list(params);
      setOrders(res.items || []);
      setOrderTotal(res.total || 0);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, orderPage, orderPageSize]);

  const handleOrderSearch = () => {
    setOrderPage(1);
    fetchOrders();
  };

  const handleCreateChannel = () => {
    setEditingChannel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditChannel = (record: any) => {
    setEditingChannel(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingChannel) {
        await channelApi.update(editingChannel.id, values);
        message.success('更新成功');
      } else {
        await channelApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchChannels();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    }
  };

  const handleDeleteChannel = async (id: number) => {
    await channelApi.delete(id);
    message.success('删除成功');
    fetchChannels();
  };

  const handleSync = async (id: number) => {
    const res: any = await channelApi.sync(id);
    message.success(`同步完成，新增 ${res.synced || 0} 条订单`);
    fetchChannels();
    if (activeTab === 'orders') fetchOrders();
  };

  const handleSyncAll = async () => {
    const res: any = await channelApi.syncAll();
    message.success(`批量同步完成：${res.total} 个渠道，新增 ${res.synced} 条，失败 ${res.failed} 个`);
    fetchChannels();
    if (activeTab === 'orders') fetchOrders();
  };

  const handleMatchOrder = async (id: number) => {
    await channelOrderApi.match(id);
    message.success('匹配成功');
    fetchOrders();
  };

  const activeChannels = channels.filter((c) => c.status === 1);
  const lastSync = channels
    .filter((c) => c.lastSyncAt)
    .sort((a, b) => new Date(b.lastSyncAt).getTime() - new Date(a.lastSyncAt).getTime())[0];

  const channelColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '渠道名称', dataIndex: 'name', ellipsis: true },
    {
      title: '平台',
      dataIndex: 'platform',
      render: (v: string) => <Tag color={platformColors[v]}>{platformLabels[v] || v}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number, record: any) => (
        <Switch
          checked={v === 1}
          onChange={async (checked) => {
            await channelApi.update(record.id, { status: checked ? 1 : 0 } as any);
            fetchChannels();
          }}
          size="small"
        />
      ),
    },
    {
      title: '同步启用',
      dataIndex: 'syncEnabled',
      width: 90,
      render: (v: boolean, record: any) => (
        <Switch
          checked={v}
          onChange={async (checked) => {
            await channelApi.update(record.id, { syncEnabled: checked } as any);
            fetchChannels();
          }}
          size="small"
        />
      ),
    },
    {
      title: '最后同步',
      dataIndex: 'lastSyncAt',
      width: 170,
      render: (v: string) => v || '-',
    },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditChannel(record)}>编辑</Button>
          <Button type="link" size="small" icon={<SyncOutlined />} onClick={() => handleSync(record.id)}>同步</Button>
          <Popconfirm title="确认删除该渠道?" onConfirm={() => handleDeleteChannel(record.id)}>
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '渠道', dataIndex: 'channelName', width: 100, ellipsis: true },
    {
      title: '平台',
      dataIndex: 'platform',
      width: 100,
      render: (v: string) => <Tag color={platformColors[v]}>{platformLabels[v] || v}</Tag>,
    },
    { title: '平台订单号', dataIndex: 'platformOrderNo', width: 200, ellipsis: true },
    { title: '买家', dataIndex: 'buyerNickname', width: 100, ellipsis: true },
    {
      title: '金额',
      dataIndex: 'payAmount',
      width: 100,
      render: (v: number) => `¥${Number(v).toFixed(2)}`,
    },
    { title: '平台状态', dataIndex: 'platformStatus', width: 90 },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 100,
      render: (v: string) => <Badge status={syncStatusColors[v] as any} text={syncStatusLabels[v] || v} />,
    },
    {
      title: '本地订单',
      dataIndex: 'localOrderNo',
      width: 140,
      render: (v: string) => v || '-',
    },
    {
      title: '平台下单时间',
      dataIndex: 'platformCreatedAt',
      width: 170,
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: any) => (
        <Space>
          {record.syncStatus !== 'synced' && (
            <Button type="link" size="small" onClick={() => handleMatchOrder(record.id)}>匹配</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="渠道总数" value={channels.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="活跃渠道" value={activeChannels.length} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="最近同步" value={lastSync?.lastSyncAt || '暂无'} valueStyle={{ fontSize: 16 }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'channels',
              label: '渠道管理',
              children: (
                <>
                  <Space style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateChannel}>添加渠道</Button>
                    <Button icon={<CloudSyncOutlined />} onClick={handleSyncAll}>全部同步</Button>
                  </Space>
                  <Table
                    rowKey="id"
                    columns={channelColumns}
                    dataSource={channels}
                    loading={channelLoading}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'orders',
              label: '渠道订单',
              children: (
                <>
                  <Space style={{ marginBottom: 16 }} wrap>
                    <Select
                      value={filterPlatform}
                      onChange={setFilterPlatform}
                      allowClear
                      placeholder="选择平台"
                      style={{ width: 140 }}
                      options={Object.entries(platformLabels).map(([k, v]) => ({ label: v, value: k }))}
                    />
                    <Select
                      value={filterSyncStatus}
                      onChange={setFilterSyncStatus}
                      allowClear
                      placeholder="同步状态"
                      style={{ width: 120 }}
                      options={Object.entries(syncStatusLabels).map(([k, v]) => ({ label: v, value: k }))}
                    />
                    <Input
                      placeholder="平台订单号"
                      value={filterOrderNo}
                      onChange={(e) => setFilterOrderNo(e.target.value)}
                      style={{ width: 180 }}
                    />
                    <RangePicker
                      value={filterDates}
                      onChange={setFilterDates}
                    />
                    <Button type="primary" onClick={handleOrderSearch}>搜索</Button>
                  </Space>
                  <Table
                    rowKey="id"
                    columns={orderColumns}
                    dataSource={orders}
                    loading={orderLoading}
                    scroll={{ x: 1300 }}
                    pagination={{
                      current: orderPage,
                      pageSize: orderPageSize,
                      total: orderTotal,
                      showSizeChanger: true,
                      showTotal: (t) => `共 ${t} 条`,
                      onChange: (p, ps) => { setOrderPage(p); setOrderPageSize(ps); },
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingChannel ? '编辑渠道' : '添加渠道'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="渠道名称" rules={[{ required: true, message: '请输入渠道名称' }]}>
            <Input placeholder="请输入渠道名称" />
          </Form.Item>
          <Form.Item name="platform" label="平台" rules={[{ required: true, message: '请选择平台' }]}>
            <Select
              placeholder="选择平台"
              options={Object.entries(platformLabels).map(([k, v]) => ({ label: v, value: k }))}
            />
          </Form.Item>
          <Form.Item name="appKey" label="App Key" rules={[{ required: true, message: '请输入App Key' }]}>
            <Input placeholder="请输入App Key" />
          </Form.Item>
          <Form.Item name="appSecret" label="App Secret" rules={[{ required: true, message: '请输入App Secret' }]}>
            <Input.Password placeholder="请输入App Secret" />
          </Form.Item>
          <Form.Item name="webhookUrl" label="Webhook URL">
            <Input placeholder="可选，用于接收平台推送" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
