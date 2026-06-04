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
  message,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminApi, roleApi } from '../../api';

const AdminList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | undefined>(undefined);
  const [searchRoleId, setSearchRoleId] = useState<number | undefined>(undefined);
  const [roles, setRoles] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchRoles = async () => {
    try {
      const res: any = await roleApi.list({ page: 1, pageSize: 100 });
      setRoles(res.data?.list || res.data || []);
    } catch {
      // ignore
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (searchUsername) params.username = searchUsername;
      if (searchStatus !== undefined) params.status = searchStatus;
      if (searchRoleId !== undefined) params.roleId = searchRoleId;
      const res: any = await adminApi.list(params);
      setData(res.data?.list || res.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      message.error('获取管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchUsername, searchStatus, searchRoleId]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      nickname: record.nickname,
      email: record.email,
      phone: record.phone,
      roleId: record.roleId,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.delete(id);
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
        const updateData: any = { ...values };
        if (!updateData.password) delete updateData.password;
        await adminApi.update(editingRecord.id, updateData);
        message.success('更新成功');
      } else {
        await adminApi.create(values);
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
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '角色',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (roleId: number) => {
        const role = roles.find((r) => r.id === roleId);
        return role ? role.name : roleId;
      },
    },
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
    { title: '最后登录', dataIndex: 'lastLoginAt', key: 'lastLoginAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该管理员？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="管理员管理">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索用户名"
          value={searchUsername}
          onChange={(e) => {
            setSearchUsername(e.target.value);
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
        <Select
          placeholder="角色"
          value={searchRoleId}
          onChange={(val) => {
            setSearchRoleId(val);
            setPage(1);
          }}
          allowClear
          style={{ width: 160 }}
          options={roles.map((r) => ({ label: r.name, value: r.id }))}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增管理员
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
        title={editingRecord ? '编辑管理员' : '新增管理员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingRecord && (
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item
            name="password"
            label="密码"
            rules={editingRecord ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingRecord ? '不修改请留空' : ''} />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item
            name="roleId"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select options={roles.map((r) => ({ label: r.name, value: r.id }))} />
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

export default AdminList;
