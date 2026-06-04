import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Checkbox,
  Space,
  Modal,
  Form,
  InputNumber,
  Drawer,
  message,
  Card,
} from 'antd';
import { inventoryApi } from '../../api';

const InventoryList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchProductName, setSearchProductName] = useState('');
  const [belowWarning, setBelowWarning] = useState(false);

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustRecord, setAdjustRecord] = useState<any>(null);
  const [adjustForm] = Form.useForm();
  const [adjustLoading, setAdjustLoading] = useState(false);

  const [logsDrawerOpen, setLogsDrawerOpen] = useState(false);
  const [logsRecord, setLogsRecord] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (searchProductName) params.productName = searchProductName;
      if (belowWarning) params.belowWarning = true;
      const res: any = await inventoryApi.list(params);
      setData(res.data?.list || res.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      message.error('获取库存列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchProductName, belowWarning]);

  const handleAdjust = (record: any) => {
    setAdjustRecord(record);
    adjustForm.resetFields();
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async () => {
    try {
      const values = await adjustForm.validateFields();
      setAdjustLoading(true);
      await inventoryApi.adjust({
        productId: adjustRecord.productId || adjustRecord.id,
        quantity: values.quantity,
        remark: values.remark,
      });
      message.success('库存调整成功');
      setAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('库存调整失败');
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleViewLogs = async (record: any) => {
    setLogsRecord(record);
    setLogsDrawerOpen(true);
    setLogsLoading(true);
    try {
      const productId = record.productId || record.id;
      const res: any = await inventoryApi.logs(productId);
      setLogs(res.data?.list || res.data || []);
    } catch {
      message.error('获取变动记录失败');
    } finally {
      setLogsLoading(false);
    }
  };

  const columns = [
    { title: '商品名称', dataIndex: 'productName', key: 'productName' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: '当前库存', dataIndex: 'quantity', key: 'quantity' },
    { title: '锁定库存', dataIndex: 'lockedQuantity', key: 'lockedQuantity' },
    {
      title: '可用库存',
      key: 'available',
      render: (_: any, record: any) =>
        (record.quantity || 0) - (record.lockedQuantity || 0),
    },
    { title: '预警阈值', dataIndex: 'warningThreshold', key: 'warningThreshold' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => handleAdjust(record)}>
            调整库存
          </Button>
          <Button type="link" onClick={() => handleViewLogs(record)}>
            变动记录
          </Button>
        </Space>
      ),
    },
  ];

  const logColumns = [
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '变动数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '变动类型', dataIndex: 'type', key: 'type' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  return (
    <Card title="库存管理">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索商品名称"
          value={searchProductName}
          onChange={(e) => {
            setSearchProductName(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: 200 }}
        />
        <Checkbox
          checked={belowWarning}
          onChange={(e) => {
            setBelowWarning(e.target.checked);
            setPage(1);
          }}
        >
          仅显示低于预警
        </Checkbox>
      </Space>

      <Table
        rowKey={(record) => record.productId || record.id}
        columns={columns}
        dataSource={data}
        loading={loading}
        rowClassName={(record) =>
          record.quantity <= record.warningThreshold ? 'inventory-warning-row' : ''
        }
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

      <style>{`
        .inventory-warning-row {
          background-color: #fff1f0 !important;
        }
        .inventory-warning-row td {
          background-color: #fff1f0 !important;
        }
      `}</style>

      <Modal
        title="调整库存"
        open={adjustModalOpen}
        onOk={handleAdjustSubmit}
        onCancel={() => setAdjustModalOpen(false)}
        confirmLoading={adjustLoading}
        destroyOnClose
      >
        <Form form={adjustForm} layout="vertical">
          <Form.Item
            name="quantity"
            label="调整数量（正数增加，负数减少）"
            rules={[{ required: true, message: '请输入调整数量' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`变动记录 - ${logsRecord?.productName || ''}`}
        open={logsDrawerOpen}
        onClose={() => setLogsDrawerOpen(false)}
        width={600}
      >
        <Table
          rowKey="id"
          columns={logColumns}
          dataSource={logs}
          loading={logsLoading}
          pagination={false}
        />
      </Drawer>
    </Card>
  );
};

export default InventoryList;
