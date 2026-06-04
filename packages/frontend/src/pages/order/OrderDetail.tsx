import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Tag, Space, Modal, Input, Timeline, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderApi, shipmentApi } from '../../api';

const statusColorMap: Record<string, string> = {
  pending_payment: 'orange',
  paid: 'blue',
  shipping: 'cyan',
  shipped: 'purple',
  completed: 'green',
  cancelled: 'red',
  refunded: 'gray',
};

const statusLabelMap: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  shipping: '发货中',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [transitions, setTransitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shipment, setShipment] = useState<any>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res: any = await orderApi.detail(Number(id));
      setOrder(res);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransitions = async () => {
    try {
      const res: any = await orderApi.getTransitions(Number(id));
      setTransitions(res.transitions || res || []);
    } catch {
      setTransitions([]);
    }
  };

  const fetchShipment = async () => {
    try {
      const res: any = await shipmentApi.byOrder(Number(id));
      setShipment(res);
    } catch {
      setShipment(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
      fetchTransitions();
      fetchShipment();
    }
  }, [id]);

  const needsReason = (status: string) => {
    return status === 'cancelled' || status === 'refunded';
  };

  const handleTransition = (status: string) => {
    setTargetStatus(status);
    setReason('');
    if (needsReason(status)) {
      setModalVisible(true);
    } else {
      Modal.confirm({
        title: '确认操作',
        content: `确定要将订单状态变更为「${statusLabelMap[status] || status}」吗？`,
        onOk: () => submitTransition(status, ''),
      });
    }
  };

  const submitTransition = async (status: string, reasonText: string) => {
    setSubmitting(true);
    try {
      const data: any = { status };
      if (reasonText) data.reason = reasonText;
      await orderApi.updateStatus(Number(id), data);
      message.success('状态更新成功');
      setModalVisible(false);
      fetchOrder();
      fetchTransitions();
    } catch (err: any) {
      message.error(err?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalOk = () => {
    if (needsReason(targetStatus) && !reason.trim()) {
      message.error('请输入原因');
      return;
    }
    submitTransition(targetStatus, reason);
  };

  const itemColumns = [
    { title: '商品名称', dataIndex: 'productName', key: 'productName' },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (val: number) => `¥${(val || 0).toFixed(2)}`,
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (val: number, record: any) => {
        const amount = val || (record.price || 0) * (record.quantity || 0);
        return `¥${amount.toFixed(2)}`;
      },
    },
  ];

  if (loading || !order) return null;

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate(-1)}
      >
        返回
      </Button>

      <Card title="订单信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusColorMap[order.status] || 'default'}>
              {statusLabelMap[order.status] || order.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="总金额">¥{(order.totalAmount || 0).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="实付金额">¥{(order.paidAmount || 0).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {order.createdAt ? dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="支付时间">
            {order.paidAt ? dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="收货地址">{order.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="备注">{order.remark || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="订单商品" style={{ marginBottom: 16 }}>
        <Table
          rowKey="id"
          columns={itemColumns}
          dataSource={order.items || order.orderItems || []}
          pagination={false}
        />
      </Card>

      {shipment && (
        <Card title="物流信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="快递公司">{shipment.carrier}</Descriptions.Item>
            <Descriptions.Item label="快递单号">{shipment.trackingNo}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag>{shipment.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="预计送达">{shipment.estimatedDelivery || '-'}</Descriptions.Item>
          </Descriptions>
          <Timeline
            items={(shipment.statusHistory || []).slice().reverse().map((item: any) => ({
              children: (
                <div>
                  <div><strong>{item.status}</strong></div>
                  {item.location && <div>{item.location}</div>}
                  {item.description && <div>{item.description}</div>}
                  <div style={{ color: '#999', fontSize: 12 }}>{item.time}</div>
                </div>
              ),
            }))}
          />
        </Card>
      )}

      {transitions.length > 0 && (
        <Card title="状态操作">
          <Space>
            {transitions.map((t: string) => (
              <Button key={t} type="primary" onClick={() => handleTransition(t)}>
                {statusLabelMap[t] || t}
              </Button>
            ))}
          </Space>
        </Card>
      )}

      <Modal
        title="请输入原因"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
      >
        <Input.TextArea
          rows={4}
          placeholder={`请输入${statusLabelMap[targetStatus] || ''}原因`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
