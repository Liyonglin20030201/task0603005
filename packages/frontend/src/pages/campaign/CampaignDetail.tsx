import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Modal, Form, InputNumber, Space, message, Popconfirm } from 'antd';
import { campaignApi, productApi } from '../../api';

const typeLabels: Record<string, string> = { flash_sale: '限时秒杀', bundle: '组合优惠', discount: '折扣促销', free_shipping: '满额包邮' };
const statusLabels: Record<string, string> = { draft: '草稿', active: '进行中', paused: '已暂停', ended: '已结束' };
const statusColors: Record<string, string> = { draft: 'default', active: 'success', paused: 'warning', ended: 'default' };

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [form] = Form.useForm();

  const fetchDetail = async () => {
    const res = await campaignApi.detail(+id!);
    setCampaign(res);
  };

  const fetchProducts = async () => {
    const res: any = await productApi.list({ page: 1, pageSize: 100 });
    setProducts(res.items || []);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleAddProducts = async () => {
    const values = await form.validateFields();
    const payload = {
      products: selectedProducts.map((productId) => ({
        productId,
        campaignPrice: values[`price_${productId}`],
        stock: values[`stock_${productId}`],
      })),
    };
    await campaignApi.addProducts(+id!, payload);
    message.success('添加成功');
    setAddOpen(false);
    setSelectedProducts([]);
    form.resetFields();
    fetchDetail();
  };

  const handleRemoveProduct = async (productId: number) => {
    await campaignApi.removeProduct(+id!, productId);
    message.success('移除成功');
    fetchDetail();
  };

  const productColumns = [
    { title: '商品ID', dataIndex: 'productId', width: 80 },
    { title: '活动价', dataIndex: 'campaignPrice', render: (v: number) => `¥${v}` },
    { title: '活动库存', dataIndex: 'stock' },
    { title: '已售', dataIndex: 'soldCount' },
    {
      title: '操作',
      render: (_: any, record: any) => (
        campaign?.status !== 'active' && (
          <Popconfirm title="确认移除?" onConfirm={() => handleRemoveProduct(record.productId)}>
            <Button type="link" danger size="small">移除</Button>
          </Popconfirm>
        )
      ),
    },
  ];

  if (!campaign) return null;

  return (
    <div>
      <Card title="活动详情" extra={<Button onClick={() => navigate('/campaigns')}>返回</Button>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="活动名称">{campaign.name}</Descriptions.Item>
          <Descriptions.Item label="类型">{typeLabels[campaign.type]}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={statusColors[campaign.status]}>{statusLabels[campaign.status]}</Tag></Descriptions.Item>
          <Descriptions.Item label="预算">{campaign.budget ? `¥${campaign.budget}` : '无限制'}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{campaign.startTime}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{campaign.endTime}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{campaign.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="规则" span={2}>{campaign.rules ? JSON.stringify(campaign.rules) : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="活动商品" style={{ marginTop: 16 }} extra={
        campaign.status !== 'ended' && (
          <Button type="primary" onClick={() => { fetchProducts(); setAddOpen(true); }}>添加商品</Button>
        )
      }>
        <Table
          rowKey="id"
          columns={productColumns}
          dataSource={campaign.products || []}
          pagination={false}
        />
      </Card>

      <Modal title="添加活动商品" open={addOpen} onOk={handleAddProducts} onCancel={() => setAddOpen(false)} width={600} destroyOnClose>
        <Table
          rowKey="id"
          dataSource={products}
          size="small"
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedProducts,
            onChange: (keys) => setSelectedProducts(keys as number[]),
          }}
          columns={[
            { title: '商品名称', dataIndex: 'name' },
            { title: 'SKU', dataIndex: 'sku' },
            { title: '原价', dataIndex: 'price', render: (v: number) => `¥${v}` },
          ]}
          style={{ marginBottom: 16 }}
        />
        {selectedProducts.length > 0 && (
          <Form form={form} layout="inline">
            {selectedProducts.map((pid) => (
              <Space key={pid} style={{ display: 'flex', marginBottom: 8 }}>
                <span>商品{pid}:</span>
                <Form.Item name={`price_${pid}`} rules={[{ required: true, message: '请输入价格' }]}>
                  <InputNumber min={0} precision={2} placeholder="活动价" />
                </Form.Item>
                <Form.Item name={`stock_${pid}`} rules={[{ required: true, message: '请输入库存' }]}>
                  <InputNumber min={1} placeholder="库存" />
                </Form.Item>
              </Space>
            ))}
          </Form>
        )}
      </Modal>
    </div>
  );
}
