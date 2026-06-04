import { useEffect, useState } from 'react';
import {
  Table, Input, Select, Button, Space, Card, Row, Col,
  Modal, Form, Popconfirm, DatePicker, InputNumber, message,
} from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { couponApi, userApi } from '../../api';

const typeOptions = [
  { label: '固定金额', value: 'fixed' },
  { label: '百分比折扣', value: 'percentage' },
];

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'disabled' },
];

export default function CouponList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [name, setName] = useState('');
  const [type, setType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [distributeVisible, setDistributeVisible] = useState(false);
  const [distributeCouponId, setDistributeCouponId] = useState<number | null>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [distributing, setDistributing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (name) params.name = name;
      if (type) params.type = type;
      if (status) params.status = status;
      const res: any = await couponApi.list(params);
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
    setName('');
    setType(undefined);
    setStatus(undefined);
    setPage(1);
    setTimeout(fetchData, 0);
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      type: record.type,
      value: record.value,
      minAmount: record.minAmount,
      totalCount: record.totalCount,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await couponApi.delete(id);
      message.success('删除成功');
      fetchData();
    } catch (err: any) {
      message.error(err?.message || '删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const submitData = {
        ...values,
        startTime: values.startTime ? values.startTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: values.endTime ? values.endTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
      };
      if (editingCoupon) {
        await couponApi.update(editingCoupon.id, submitData);
        message.success('更新成功');
      } else {
        await couponApi.create(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDistribute = async (record: any) => {
    setDistributeCouponId(record.id);
    setSelectedUserIds([]);
    setDistributeVisible(true);
    try {
      const res: any = await userApi.list({ page: 1, pageSize: 1000 });
      setUserList(res.list || res.data || []);
    } catch {
      setUserList([]);
    }
  };

  const handleDistributeOk = async () => {
    if (selectedUserIds.length === 0) {
      message.error('请选择用户');
      return;
    }
    setDistributing(true);
    try {
      await couponApi.distribute({ couponId: distributeCouponId!, userIds: selectedUserIds });
      message.success('发放成功');
      setDistributeVisible(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.message || '发放失败');
    } finally {
      setDistributing(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '券名', dataIndex: 'name', key: 'name' },
    { title: '券码', dataIndex: 'code', key: 'code' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (val: string) => (val === 'fixed' ? '固定金额' : '百分比折扣'),
    },
    {
      title: '面额/折扣',
      dataIndex: 'value',
      key: 'value',
      render: (val: number, record: any) =>
        record.type === 'fixed' ? `¥${(val || 0).toFixed(2)}` : `${val}%`,
    },
    {
      title: '最低使用金额',
      dataIndex: 'minAmount',
      key: 'minAmount',
      render: (val: number) => val ? `¥${val.toFixed(2)}` : '-',
    },
    {
      title: '已用/总量',
      key: 'usage',
      render: (_: any, record: any) => `${record.usedCount || 0}/${record.totalCount || 0}`,
    },
    {
      title: '有效期',
      key: 'validity',
      render: (_: any, record: any) => {
        const start = record.startTime ? dayjs(record.startTime).format('YYYY-MM-DD') : '';
        const end = record.endTime ? dayjs(record.endTime).format('YYYY-MM-DD') : '';
        return start && end ? `${start} ~ ${end}` : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => (val === 'active' ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleDistribute(record)}>
            发放
          </Button>
          <Popconfirm title="确定删除该优惠券吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col>
            <Input
              placeholder="券名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: 160 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="类型"
              value={type}
              onChange={(val) => setType(val)}
              options={typeOptions}
              style={{ width: 140 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="状态"
              value={status}
              onChange={(val) => setStatus(val)}
              options={statusOptions}
              style={{ width: 120 }}
              allowClear
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
      <Card
        title="优惠券列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增优惠券
          </Button>
        }
      >
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

      <Modal
        title={editingCoupon ? '编辑优惠券' : '新增优惠券'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="券名"
            rules={[{ required: true, message: '请输入券名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="券码"
            rules={[{ required: true, message: '请输入券码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select options={typeOptions} />
          </Form.Item>
          <Form.Item
            name="value"
            label="面额/折扣值"
            rules={[{ required: true, message: '请输入面额或折扣值' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="minAmount" label="最低使用金额">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="totalCount" label="总量">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={statusOptions} allowClear />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="发放优惠券"
        open={distributeVisible}
        onOk={handleDistributeOk}
        onCancel={() => setDistributeVisible(false)}
        confirmLoading={distributing}
        width={700}
      >
        <Table
          rowKey="id"
          columns={userColumns}
          dataSource={userList}
          size="small"
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedUserIds,
            onChange: (keys) => setSelectedUserIds(keys as number[]),
          }}
        />
      </Modal>
    </div>
  );
}
