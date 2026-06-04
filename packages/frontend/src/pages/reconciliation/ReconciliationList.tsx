import { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Select, Space, Tag, Modal, Form, Input,
  DatePicker, Tabs, Statistic, Row, Col, Drawer, Descriptions,
  message, InputNumber, Popconfirm,
} from 'antd';
import {
  DollarOutlined, FileSearchOutlined, WarningOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { reconciliationApi, settlementApi, feeRuleApi } from '../../api';

const { RangePicker } = DatePicker;

const reconciliationStatusLabels: Record<string, string> = {
  pending: '待对账',
  matched: '已匹配',
  discrepancy: '有差异',
  resolved: '已处理',
};

const reconciliationStatusColors: Record<string, string> = {
  pending: 'default',
  matched: 'success',
  discrepancy: 'error',
  resolved: 'processing',
};

const settlementStatusLabels: Record<string, string> = {
  unsettled: '未结算',
  settling: '结算中',
  settled: '已结算',
  disputed: '有争议',
};

const settlementStatusColors: Record<string, string> = {
  unsettled: 'default',
  settling: 'processing',
  settled: 'success',
  disputed: 'error',
};

const feeTypeLabels: Record<string, string> = {
  platform_commission: '平台佣金',
  payment_fee: '支付手续费',
  shipping_fee: '运费',
  refund_fee: '退款手续费',
  promotion_fee: '推广费',
  service_fee: '服务费',
};

const platformOptions = [
  { label: '淘宝', value: 'taobao' },
  { label: '京东', value: 'jd' },
  { label: '拼多多', value: 'pdd' },
  { label: '抖音', value: 'douyin' },
  { label: '微信小程序', value: 'wechat' },
];

export default function ReconciliationList() {
  const [activeTab, setActiveTab] = useState('reconciliation');
  const [dashboard, setDashboard] = useState<any>({});

  const fetchDashboard = async () => {
    try {
      const res: any = await reconciliationApi.dashboard();
      setDashboard(res);
    } catch {}
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月净收入"
              value={dashboard.netRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待对账"
              value={dashboard.pendingReconciliations || 0}
              prefix={<FileSearchOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="有差异"
              value={dashboard.discrepancyReconciliations || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: dashboard.discrepancyReconciliations > 0 ? '#cf1322' : undefined }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已结算金额"
              value={dashboard.totalSettledAmount || 0}
              prefix={<CheckCircleOutlined />}
              precision={2}
              suffix="元"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'reconciliation', label: '对账管理', children: <ReconciliationTab onRefresh={fetchDashboard} /> },
            { key: 'settlement', label: '结算管理', children: <SettlementTab /> },
            { key: 'feeRules', label: '费率配置', children: <FeeRuleTab /> },
          ]}
        />
      </Card>
    </div>
  );
}

function ReconciliationTab({ onRefresh }: { onRefresh: () => void }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentDetail, setCurrentDetail] = useState<any>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [currentResolveId, setCurrentResolveId] = useState<number>(0);
  const [form] = Form.useForm();
  const [resolveForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (platform) params.platform = platform;
      if (status) params.status = status;
      const res: any = await reconciliationApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, platform, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleCreate = async () => {
    const values = await form.validateFields();
    const payload = {
      platform: values.platform,
      periodStart: values.period[0].format('YYYY-MM-DD'),
      periodEnd: values.period[1].format('YYYY-MM-DD'),
    };
    await reconciliationApi.create(payload);
    message.success('创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchData();
    onRefresh();
  };

  const handleExecute = async (id: number) => {
    await reconciliationApi.execute(id);
    message.success('对账执行成功');
    fetchData();
    onRefresh();
  };

  const handleViewDetail = async (id: number) => {
    const res: any = await reconciliationApi.detail(id);
    setCurrentDetail(res);
    setDrawerOpen(true);
  };

  const handleResolve = async () => {
    const values = await resolveForm.validateFields();
    await reconciliationApi.resolveDetail(currentResolveId, values);
    message.success('处理成功');
    setResolveOpen(false);
    resolveForm.resetFields();
    if (currentDetail) {
      handleViewDetail(currentDetail.id);
    }
    fetchData();
    onRefresh();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '平台',
      dataIndex: 'platform',
      render: (v: string) => platformOptions.find(p => p.value === v)?.label || v,
    },
    { title: '对账周期', render: (_: any, r: any) => `${r.periodStart?.slice(0, 10)} ~ ${r.periodEnd?.slice(0, 10)}` },
    { title: '总订单', dataIndex: 'totalOrders', width: 80 },
    { title: '已匹配', dataIndex: 'matchedOrders', width: 80 },
    { title: '有差异', dataIndex: 'discrepancyOrders', width: 80, render: (v: number) => <span style={{ color: v > 0 ? '#f5222d' : undefined }}>{v}</span> },
    { title: '平台金额', dataIndex: 'platformAmount', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '本地金额', dataIndex: 'localAmount', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '差异金额', dataIndex: 'differenceAmount', render: (v: number) => <span style={{ color: Math.abs(+v) > 0.01 ? '#f5222d' : undefined }}>{`¥${(+v).toFixed(2)}`}</span> },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={reconciliationStatusColors[v]}>{reconciliationStatusLabels[v] || v}</Tag>,
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => handleExecute(record.id)}>执行对账</Button>
          )}
          <Button type="link" size="small" onClick={() => handleViewDetail(record.id)}>详情</Button>
        </Space>
      ),
    },
  ];

  const detailColumns = [
    { title: '平台订单号', dataIndex: 'platformOrderNo', ellipsis: true },
    { title: '本地订单号', dataIndex: 'localOrderNo', render: (v: string) => v || '-' },
    { title: '平台金额', dataIndex: 'platformAmount', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '本地金额', dataIndex: 'localAmount', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '差异金额', dataIndex: 'differenceAmount', render: (v: number) => <span style={{ color: Math.abs(+v) > 0.01 ? '#f5222d' : undefined }}>{`¥${(+v).toFixed(2)}`}</span> },
    { title: '差异原因', dataIndex: 'differenceReason', render: (v: string) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={reconciliationStatusColors[v]}>{reconciliationStatusLabels[v] || v}</Tag>,
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: any) => record.status === 'discrepancy' ? (
        <Button type="link" size="small" onClick={() => { setCurrentResolveId(record.id); setResolveOpen(true); }}>处理</Button>
      ) : null,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={platform}
          onChange={setPlatform}
          allowClear
          placeholder="平台"
          style={{ width: 120 }}
          options={platformOptions}
        />
        <Select
          value={status}
          onChange={setStatus}
          allowClear
          placeholder="状态"
          style={{ width: 120 }}
          options={Object.entries(reconciliationStatusLabels).map(([k, v]) => ({ label: v, value: k }))}
        />
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        <Button onClick={() => setCreateOpen(true)}>创建对账</Button>
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
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <Modal title="创建对账" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="platform" label="平台" rules={[{ required: true, message: '请选择平台' }]}>
            <Select options={platformOptions} placeholder="选择平台" />
          </Form.Item>
          <Form.Item name="period" label="对账周期" rules={[{ required: true, message: '请选择对账周期' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="对账明细" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={900}>
        {currentDetail && (
          <div>
            <Descriptions bordered size="small" column={3} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="平台">{platformOptions.find(p => p.value === currentDetail.platform)?.label || currentDetail.platform}</Descriptions.Item>
              <Descriptions.Item label="对账周期">{currentDetail.periodStart?.slice(0, 10)} ~ {currentDetail.periodEnd?.slice(0, 10)}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={reconciliationStatusColors[currentDetail.status]}>{reconciliationStatusLabels[currentDetail.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="总订单数">{currentDetail.totalOrders}</Descriptions.Item>
              <Descriptions.Item label="已匹配">{currentDetail.matchedOrders}</Descriptions.Item>
              <Descriptions.Item label="有差异">{currentDetail.discrepancyOrders}</Descriptions.Item>
            </Descriptions>
            <Table
              rowKey="id"
              columns={detailColumns}
              dataSource={currentDetail.details || []}
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
      </Drawer>

      <Modal title="处理差异" open={resolveOpen} onOk={handleResolve} onCancel={() => setResolveOpen(false)} destroyOnClose>
        <Form form={resolveForm} layout="vertical">
          <Form.Item name="status" label="处理结果" rules={[{ required: true }]} initialValue="resolved">
            <Select options={[
              { label: '已处理', value: 'resolved' },
              { label: '已匹配', value: 'matched' },
            ]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function SettlementTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentSettlement, setCurrentSettlement] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (platform) params.platform = platform;
      if (status) params.status = status;
      const res: any = await settlementApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, platform, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleCreate = async () => {
    const values = await form.validateFields();
    const payload = {
      platform: values.platform,
      periodStart: values.period[0].format('YYYY-MM-DD'),
      periodEnd: values.period[1].format('YYYY-MM-DD'),
      grossAmount: values.grossAmount,
      orderCount: values.orderCount,
      refundCount: values.refundCount || 0,
      refundAmount: values.refundAmount || 0,
    };
    await settlementApi.create(payload);
    message.success('创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchData();
  };

  const handleViewDetail = async (id: number) => {
    const res: any = await settlementApi.detail(id);
    setCurrentSettlement(res);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    await settlementApi.update(id, { status: newStatus });
    message.success('状态更新成功');
    fetchData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '结算单号', dataIndex: 'settlementNo', ellipsis: true },
    {
      title: '平台',
      dataIndex: 'platform',
      render: (v: string) => platformOptions.find(p => p.value === v)?.label || v,
    },
    { title: '结算周期', render: (_: any, r: any) => `${r.periodStart?.slice(0, 10)} ~ ${r.periodEnd?.slice(0, 10)}` },
    { title: '总金额', dataIndex: 'grossAmount', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '手续费', dataIndex: 'totalFees', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '净金额', dataIndex: 'netAmount', render: (v: number) => <span style={{ color: '#3f8600', fontWeight: 'bold' }}>{`¥${(+v).toFixed(2)}`}</span> },
    { title: '订单数', dataIndex: 'orderCount', width: 70 },
    { title: '退款数', dataIndex: 'refundCount', width: 70 },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={settlementStatusColors[v]}>{settlementStatusLabels[v] || v}</Tag>,
    },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record.id)}>详情</Button>
          {record.status === 'unsettled' && (
            <Button type="link" size="small" onClick={() => handleUpdateStatus(record.id, 'settling')}>开始结算</Button>
          )}
          {record.status === 'settling' && (
            <Button type="link" size="small" onClick={() => handleUpdateStatus(record.id, 'settled')}>确认结算</Button>
          )}
          {(record.status === 'unsettled' || record.status === 'settling') && (
            <Button type="link" size="small" danger onClick={() => handleUpdateStatus(record.id, 'disputed')}>标记争议</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={platform}
          onChange={setPlatform}
          allowClear
          placeholder="平台"
          style={{ width: 120 }}
          options={platformOptions}
        />
        <Select
          value={status}
          onChange={setStatus}
          allowClear
          placeholder="状态"
          style={{ width: 120 }}
          options={Object.entries(settlementStatusLabels).map(([k, v]) => ({ label: v, value: k }))}
        />
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        <Button onClick={() => setCreateOpen(true)}>创建结算</Button>
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
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <Modal title="创建结算" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnClose width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="platform" label="平台" rules={[{ required: true, message: '请选择平台' }]}>
            <Select options={platformOptions} placeholder="选择平台" />
          </Form.Item>
          <Form.Item name="period" label="结算周期" rules={[{ required: true, message: '请选择结算周期' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="grossAmount" label="总金额" rules={[{ required: true, message: '请输入总金额' }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" />
          </Form.Item>
          <Form.Item name="orderCount" label="订单数" rules={[{ required: true, message: '请输入订单数' }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
          <Form.Item name="refundCount" label="退款订单数">
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
          <Form.Item name="refundAmount" label="退款金额">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="结算详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={600}>
        {currentSettlement && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="结算单号">{currentSettlement.settlementNo}</Descriptions.Item>
              <Descriptions.Item label="平台">{platformOptions.find(p => p.value === currentSettlement.platform)?.label || currentSettlement.platform}</Descriptions.Item>
              <Descriptions.Item label="结算周期">{currentSettlement.periodStart?.slice(0, 10)} ~ {currentSettlement.periodEnd?.slice(0, 10)}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={settlementStatusColors[currentSettlement.status]}>{settlementStatusLabels[currentSettlement.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="总金额">¥{(+currentSettlement.grossAmount).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="手续费总计">¥{(+currentSettlement.totalFees).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="净金额"><span style={{ color: '#3f8600', fontWeight: 'bold' }}>¥{(+currentSettlement.netAmount).toFixed(2)}</span></Descriptions.Item>
              <Descriptions.Item label="订单数">{currentSettlement.orderCount}</Descriptions.Item>
              <Descriptions.Item label="退款数">{currentSettlement.refundCount}</Descriptions.Item>
              <Descriptions.Item label="退款金额">¥{(+currentSettlement.refundAmount).toFixed(2)}</Descriptions.Item>
              {currentSettlement.bankAccount && <Descriptions.Item label="银行账户">{currentSettlement.bankAccount}</Descriptions.Item>}
              {currentSettlement.settledAt && <Descriptions.Item label="结算时间">{currentSettlement.settledAt}</Descriptions.Item>}
            </Descriptions>

            <h4 style={{ marginBottom: 12 }}>费用明细</h4>
            {currentSettlement.feeBreakdown && currentSettlement.feeBreakdown.length > 0 ? (
              <Table
                rowKey="type"
                dataSource={currentSettlement.feeBreakdown}
                size="small"
                pagination={false}
                columns={[
                  { title: '费用类型', dataIndex: 'type', render: (v: string) => feeTypeLabels[v] || v },
                  { title: '费率', dataIndex: 'rate', render: (v: number) => v ? `${(v * 100).toFixed(2)}%` : '-' },
                  { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${(+v).toFixed(2)}` },
                ]}
              />
            ) : (
              <p>暂无费用明细</p>
            )}

            {currentSettlement.feeBreakdown && currentSettlement.feeBreakdown.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12 }}>费用占比</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentSettlement.feeBreakdown.map((item: any) => {
                    const pct = currentSettlement.totalFees > 0 ? ((+item.amount / +currentSettlement.totalFees) * 100).toFixed(1) : '0';
                    return (
                      <Tag key={item.type} color="blue">
                        {feeTypeLabels[item.type] || item.type}: ¥{(+item.amount).toFixed(2)} ({pct}%)
                      </Tag>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function FeeRuleTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await feeRuleApi.list();
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      effectiveFrom: values.effectiveFrom.format('YYYY-MM-DD'),
      effectiveTo: values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DD') : undefined,
    };
    await feeRuleApi.create(payload);
    message.success('创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchData();
  };

  const handleEdit = (record: any) => {
    setCurrentRule(record);
    setEditOpen(true);
    editForm.setFieldsValue({
      platform: record.platform,
      feeType: record.feeType,
      rate: +record.rate,
      fixedAmount: +record.fixedAmount,
      minAmount: +record.minAmount,
      maxAmount: +record.maxAmount,
    });
  };

  const handleUpdate = async () => {
    const values = await editForm.validateFields();
    const payload = {
      ...values,
      effectiveFrom: values.effectiveFrom ? values.effectiveFrom.format('YYYY-MM-DD') : undefined,
      effectiveTo: values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DD') : undefined,
    };
    await feeRuleApi.update(currentRule.id, payload);
    message.success('更新成功');
    setEditOpen(false);
    editForm.resetFields();
    fetchData();
  };

  const handleDisable = async (id: number) => {
    await feeRuleApi.update(id, { status: 0 } as any);
    message.success('已禁用');
    fetchData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '平台',
      dataIndex: 'platform',
      render: (v: string) => platformOptions.find(p => p.value === v)?.label || v,
    },
    {
      title: '费用类型',
      dataIndex: 'feeType',
      render: (v: string) => feeTypeLabels[v] || v,
    },
    { title: '费率', dataIndex: 'rate', render: (v: number) => `${(+v * 100).toFixed(2)}%` },
    { title: '固定金额', dataIndex: 'fixedAmount', render: (v: number) => +v > 0 ? `¥${(+v).toFixed(2)}` : '-' },
    { title: '最小金额', dataIndex: 'minAmount', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '最大金额', dataIndex: 'maxAmount', render: (v: number) => `¥${(+v).toFixed(2)}` },
    { title: '生效起始', dataIndex: 'effectiveFrom', render: (v: string) => v?.slice(0, 10) },
    { title: '生效截止', dataIndex: 'effectiveTo', render: (v: string) => v?.slice(0, 10) || '永久' },
    {
      title: '操作',
      width: 140,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认禁用?" onConfirm={() => handleDisable(record.id)}>
            <Button type="link" danger size="small">禁用</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const ruleFormItems = (
    <>
      <Form.Item name="platform" label="平台" rules={[{ required: true, message: '请选择平台' }]}>
        <Select options={platformOptions} placeholder="选择平台" />
      </Form.Item>
      <Form.Item name="feeType" label="费用类型" rules={[{ required: true, message: '请选择费用类型' }]}>
        <Select options={Object.entries(feeTypeLabels).map(([k, v]) => ({ label: v, value: k }))} placeholder="选择费用类型" />
      </Form.Item>
      <Form.Item name="rate" label="费率" rules={[{ required: true, message: '请输入费率' }]} extra="例如 0.03 表示 3%">
        <InputNumber style={{ width: '100%' }} min={0} max={1} step={0.001} precision={4} />
      </Form.Item>
      <Form.Item name="fixedAmount" label="固定金额">
        <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" />
      </Form.Item>
      <Form.Item name="minAmount" label="最小金额">
        <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" />
      </Form.Item>
      <Form.Item name="maxAmount" label="最大金额">
        <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" />
      </Form.Item>
      <Form.Item name="effectiveFrom" label="生效起始日期" rules={[{ required: true, message: '请选择生效日期' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="effectiveTo" label="生效截止日期">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
    </>
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>新增费率规则</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
      />

      <Modal title="新增费率规则" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          {ruleFormItems}
        </Form>
      </Modal>

      <Modal title="编辑费率规则" open={editOpen} onOk={handleUpdate} onCancel={() => setEditOpen(false)} destroyOnClose>
        <Form form={editForm} layout="vertical">
          {ruleFormItems}
        </Form>
      </Modal>
    </div>
  );
}
