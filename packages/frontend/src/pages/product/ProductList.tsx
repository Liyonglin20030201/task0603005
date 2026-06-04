import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  InputNumber,
  Space,
  Tag,
  Popconfirm,
  Card,
  Form,
  Row,
  Col,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi, categoryApi } from '../../api';

const { Option } = Select;

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<any>({
    page: 1,
    pageSize: 10,
  });

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data?.data || res.data || []);
    } catch {
      // ignore
    }
  };

  const fetchData = async (params = searchParams) => {
    setLoading(true);
    try {
      const res = await productApi.list(params);
      const result = res.data?.data || res.data;
      if (Array.isArray(result)) {
        setData(result);
        setTotal(result.length);
      } else {
        setData(result?.list || result?.items || []);
        setTotal(result?.total || 0);
      }
    } catch {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchData();
  }, []);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const params = {
      ...searchParams,
      page: 1,
      name: values.name || undefined,
      categoryId: values.categoryId || undefined,
      status: values.status || undefined,
      minPrice: values.minPrice || undefined,
      maxPrice: values.maxPrice || undefined,
    };
    setSearchParams(params);
    fetchData(params);
  };

  const handleReset = () => {
    form.resetFields();
    const params = { page: 1, pageSize: 10 };
    setSearchParams(params);
    fetchData(params);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...searchParams, page, pageSize };
    setSearchParams(params);
    fetchData(params);
  };

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
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
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (_: any, record: any) => record.categoryName || record.category?.name || '-',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (price != null ? `¥${Number(price).toFixed(2)}` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const isActive = status === 'active' || status === '上架';
        return <Tag color={isActive ? 'green' : 'red'}>{isActive ? '上架' : '下架'}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline">
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col>
              <Form.Item name="name" label="名称">
                <Input placeholder="请输入商品名称" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="categoryId" label="分类">
                <Select placeholder="请选择分类" allowClear style={{ width: 150 }}>
                  {categories.map((cat: any) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
                  <Option value="active">上架</Option>
                  <Option value="inactive">下架</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="价格范围">
                <Space>
                  <Form.Item name="minPrice" noStyle>
                    <InputNumber placeholder="最低价" min={0} style={{ width: 100 }} />
                  </Form.Item>
                  <span>-</span>
                  <Form.Item name="maxPrice" noStyle>
                    <InputNumber placeholder="最高价" min={0} style={{ width: 100 }} />
                  </Form.Item>
                </Space>
              </Form.Item>
            </Col>
            <Col>
              <Space>
                <Button type="primary" onClick={handleSearch}>
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="商品列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/create')}
          >
            新增商品
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: handlePageChange,
          }}
        />
      </Card>
    </div>
  );
};

export default ProductList;
