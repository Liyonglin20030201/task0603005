import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Popconfirm,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryApi } from '../../api';

const { Option } = Select;

const CategoryList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const flattenTree = (nodes: any[], result: any[] = []): any[] => {
    nodes.forEach((node) => {
      result.push({ id: node.id, name: node.name });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, result);
      }
    });
    return result;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.tree();
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setTreeData(list);
      setFlatCategories(flattenTree(list));
    } catch {
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ sort: 0, status: true });
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      parentId: record.parentId || undefined,
      sort: record.sort || 0,
      status: record.status === 'active' || record.status === '启用',
    });
    setModalVisible(true);
  };

  const handleDelete = async (record: any) => {
    if (record.children && record.children.length > 0) {
      message.error('该分类下有子分类，无法删除');
      return;
    }
    try {
      await categoryApi.delete(record.id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败，该分类可能包含子分类或已关联商品');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const submitData = {
        ...values,
        parentId: values.parentId || null,
        status: values.status ? 'active' : 'inactive',
      };

      if (editingCategory) {
        await categoryApi.update(editingCategory.id, submitData);
        message.success('更新成功');
      } else {
        await categoryApi.create(submitData);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error(editingCategory ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const isActive = status === 'active' || status === '启用';
        return <Tag color={isActive ? 'green' : 'red'}>{isActive ? '启用' : '禁用'}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该分类吗？"
            description={
              record.children && record.children.length > 0
                ? '该分类下有子分类，无法删除'
                : undefined
            }
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
            disabled={record.children && record.children.length > 0}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.children && record.children.length > 0}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="分类管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增分类
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={treeData}
          rowKey="id"
          loading={loading}
          pagination={false}
          expandable={{ defaultExpandAllRows: true }}
          childrenColumnName="children"
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item name="parentId" label="父级分类">
            <Select placeholder="请选择父级分类（留空为顶级分类）" allowClear>
              {flatCategories
                .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                .map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="sort" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越小越靠前" />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList;
