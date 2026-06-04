import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, message, Timeline, Drawer } from 'antd';
import { shipmentApi } from '../../api';

const statusLabels: Record<string, string> = {
  pending: '待揽收',
  picked_up: '已揽收',
  in_transit: '运输中',
  out_for_delivery: '派送中',
  delivered: '已签收',
  failed: '签收失败',
};

const statusColors: Record<string, string> = {
  pending: 'default',
  picked_up: 'processing',
  in_transit: 'processing',
  out_for_delivery: 'warning',
  delivered: 'success',
  failed: 'error',
};

export default function ShipmentList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [trackingNo, setTrackingNo] = useState('');
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentShipment, setCurrentShipment] = useState<any>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (trackingNo) params.trackingNo = trackingNo;
      if (status) params.status = status;
      const res: any = await shipmentApi.list(params);
      setData(res.items);
      setTotal(res.total);
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

  const handleCreate = async () => {
    const values = await form.validateFields();
    await shipmentApi.create(values);
    message.success('创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchData();
  };

  const handleViewTimeline = (record: any) => {
    setCurrentShipment(record);
    setDrawerOpen(true);
  };

  const handleUpdateTracking = async () => {
    const values = await updateForm.validateFields();
    await shipmentApi.updateTracking(currentShipment.id, values);
    message.success('更新成功');
    setUpdateOpen(false);
    updateForm.resetFields();
    fetchData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '订单ID', dataIndex: 'orderId', width: 80 },
    { title: '快递单号', dataIndex: 'trackingNo' },
    { title: '快递公司', dataIndex: 'carrier' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag>,
    },
    { title: '预计送达', dataIndex: 'estimatedDelivery', width: 160 },
    { title: '创建时间', dataIndex: 'createdAt', width: 160 },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewTimeline(record)}>轨迹</Button>
          <Button type="link" size="small" onClick={() => { setCurrentShipment(record); setUpdateOpen(true); }}>更新</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="快递单号" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} style={{ width: 160 }} />
          <Select
            value={status}
            onChange={setStatus}
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
            options={Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={() => setCreateOpen(true)}>创建物流</Button>
        </Space>
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
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>

      <Modal title="创建物流" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="orderId" label="订单ID" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="trackingNo" label="快递单号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="carrier" label="快递公司" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="estimatedDelivery" label="预计送达">
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="更新物流状态" open={updateOpen} onOk={handleUpdateTracking} onCancel={() => setUpdateOpen(false)} destroyOnClose>
        <Form form={updateForm} layout="vertical">
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item name="location" label="当前位置">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="物流轨迹" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={400}>
        {currentShipment && (
          <div>
            <p><strong>快递单号:</strong> {currentShipment.trackingNo}</p>
            <p><strong>快递公司:</strong> {currentShipment.carrier}</p>
            <p><strong>当前状态:</strong> <Tag color={statusColors[currentShipment.status]}>{statusLabels[currentShipment.status]}</Tag></p>
            <Timeline
              style={{ marginTop: 24 }}
              items={(currentShipment.statusHistory || []).slice().reverse().map((item: any) => ({
                children: (
                  <div>
                    <div><strong>{statusLabels[item.status] || item.status}</strong></div>
                    {item.location && <div>{item.location}</div>}
                    {item.description && <div>{item.description}</div>}
                    <div style={{ color: '#999', fontSize: 12 }}>{item.time}</div>
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
