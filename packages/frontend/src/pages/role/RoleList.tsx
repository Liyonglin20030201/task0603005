import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Tag,
  Popconfirm,
  Checkbox,
  message,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { roleApi } from '../../api';

const PERMISSION_OPTIONS = [
  { label: '管理员管理', value: 'admin:manage' },
  { label: '管理员查看', value: 'admin:view' },
  { label: '角色管理', value: 'role:manage' },
  { label: '角色查看', value: 'role:view' },
  { label: '用户管理', value: 'user:manage' },
  { label: '用户查看', value: 'user:view' },
  { label: '商品管理', value: 'product:manage' },
  { label: '商品查看', value: 'product:view' },
  { label: '分类管理', value: 'category:manage' },
  { label: '分类查看', value: 'category:view' },
  { label: '订单管理', value: 'order:manage' },
  { label: '订单查看', value: 'order:view' },
  { label: '库存管理', value: 'inventory:manage' },
  { label: '库存查看', value: 'inventory:view' },
  { label: '优惠券管理', value: 'coupon:manage' },
  { label: '优惠券查看', value: 'coupon:view' },
  { label: '报表查看', value: 'report:view' },
  { label: '日志查看', value: 'log:view' },
  { label: '导入导出', value: 'import-export:manage' },
];

const RoleList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (searchName) params.name = searchName;
      if (searchStatus !== undefined) params.status = searchStatus;
      const res: any = await roleApi.list(params);
      setData(res.data?.list || res.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchName, searchStatus]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      permissions: record.permissions || [],
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await roleApi.delete(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      if (editingRecord) {
        const { code, ...updateData } = values;
        await roleApi.update(editingRecord.id, updateData);
        message.success('更新成功');
      } else {
        await roleApi.create(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(editingRecord ? '更新失败' : '创建失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '角色名', dataIndex: 'name', key: 'name' },
    { title: '编码', dataIndex: 'code', key: 'code' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该角色？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="角色管理">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索角色名"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: 160 }}
        />
        <Select
          placeholder="状态"
          value={searchStatus}
          onChange={(val) => {
            setSearchStatus(val);
            setPage(1);
          }}
          allowClear
          style={{ width: 120 }}
          options={[
            { label: '启用', value: 'active' },
            { label: '禁用', value: 'inactive' },
          ]}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增角色
        </Button>
      </Space>

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
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Modal
        title={editingRecord ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名"
            rules={[{ required: true, message: '请输入角色名' }]}
          >
            <Input />
          </Form.Item>
          {!editingRecord && (
            <Form.Item
              name="code"
              label="编码"
              rules={[{ required: true, message: '请输入编码' }]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="permissions" label="权限">
            <Checkbox.Group options={PERMISSION_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select
              options={[
                { label: '启用', value: 'active' },
                { label: '禁用', value: 'inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoleList;
