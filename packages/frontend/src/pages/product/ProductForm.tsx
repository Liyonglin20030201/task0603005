import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  TreeSelect,
  Switch,
  Button,
  Card,
  message,
  Space,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi, categoryApi } from '../../api';

const { TextArea } = Input;

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);

  const isEdit = !!id;

  const transformTreeData = (nodes: any[]): any[] => {
    return nodes.map((node) => ({
      title: node.name,
      value: node.id,
      key: node.id,
      children: node.children ? transformTreeData(node.children) : [],
    }));
  };

  const fetchCategoryTree = async () => {
    try {
      const res = await categoryApi.tree();
      const data = res.data?.data || res.data || [];
      setCategoryTree(transformTreeData(Array.isArray(data) ? data : []));
    } catch {
      // ignore
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await productApi.detail(Number(id));
      const product = res.data?.data || res.data;
      form.setFieldsValue({
        ...product,
        status: product.status === 'active' || product.status === '上架',
      });
    } catch {
      message.error('获取商品信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTree();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const submitData = {
        ...values,
        status: values.status ? 'active' : 'inactive',
      };

      if (isEdit) {
        await productApi.update(Number(id), submitData);
        message.success('更新成功');
      } else {
        await productApi.create(submitData);
        message.success('创建成功');
      }
      navigate('/products');
    } catch {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={isEdit ? '编辑商品' : '新增商品'} loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: true }}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="name"
          label="商品名称"
          rules={[{ required: true, message: '请输入商品名称' }]}
        >
          <Input placeholder="请输入商品名称" />
        </Form.Item>

        <Form.Item
          name="sku"
          label="SKU"
          rules={[{ required: true, message: '请输入SKU' }]}
        >
          <Input placeholder="请输入SKU" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="商品分类"
          rules={[{ required: true, message: '请选择商品分类' }]}
        >
          <TreeSelect
            placeholder="请选择商品分类"
            treeData={categoryTree}
            allowClear
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="销售价格"
          rules={[{ required: true, message: '请输入销售价格' }]}
        >
          <InputNumber
            placeholder="请输入销售价格"
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="costPrice" label="成本价格">
          <InputNumber
            placeholder="请输入成本价格"
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="description" label="商品描述">
          <TextArea rows={4} placeholder="请输入商品描述" />
        </Form.Item>

        <Form.Item name="images" label="商品图片">
          <Input placeholder="请输入图片URL（多个用逗号分隔）" />
        </Form.Item>

        <Form.Item name="status" label="上架状态" valuePropName="checked">
          <Switch checkedChildren="上架" unCheckedChildren="下架" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? '更新' : '创建'}
            </Button>
            <Button onClick={() => navigate('/products')}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductForm;
