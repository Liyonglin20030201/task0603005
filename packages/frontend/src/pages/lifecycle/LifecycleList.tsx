import { useState, useEffect } from 'react';
import {
  Card, Tabs, Table, Button, Input, Select, Space, Tag, Modal, Form,
  message, Timeline, Drawer, InputNumber, DatePicker, Progress,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { lifecycleApi, batchApi, qualityApi } from '../../api';

const stageLabels: Record<string, string> = {
  development: '开发中',
  testing: '测试中',
  pre_sale: '预售',
  on_sale: '在售',
  promotion: '促销中',
  clearance: '清仓',
  discontinued: '已停产',
};

const stageColors: Record<string, string> = {
  development: 'default',
  testing: 'processing',
  pre_sale: 'cyan',
  on_sale: 'success',
  promotion: 'warning',
  clearance: 'orange',
  discontinued: 'error',
};

const batchStatusLabels: Record<string, string> = {
  active: '正常',
  quarantine: '隔离',
  recalled: '召回',
  expired: '过期',
  depleted: '已耗尽',
};

const batchStatusColors: Record<string, string> = {
  active: 'success',
  quarantine: 'warning',
  recalled: 'error',
  expired: 'default',
  depleted: 'default',
};

const qualityResultLabels: Record<string, string> = {
  passed: '合格',
  failed: '不合格',
  conditional: '有条件放行',
};

const qualityResultColors: Record<string, string> = {
  passed: 'success',
  failed: 'error',
  conditional: 'warning',
};

const LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  development: ['testing', 'discontinued'],
  testing: ['pre_sale', 'on_sale', 'development'],
  pre_sale: ['on_sale', 'discontinued'],
  on_sale: ['promotion', 'clearance', 'discontinued'],
  promotion: ['on_sale', 'clearance'],
  clearance: ['discontinued'],
  discontinued: [],
};

export default function LifecycleList() {
  const [activeTab, setActiveTab] = useState('lifecycle');

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        { key: 'lifecycle', label: '生命周期', children: <LifecycleTab /> },
        { key: 'batch', label: '批次管理', children: <BatchTab /> },
        { key: 'quality', label: '质量追溯', children: <QualityTab /> },
      ]} />
    </div>
  );
}

// ====== Lifecycle Tab ======
function LifecycleTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stageFilter, setStageFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (stageFilter) params.currentStage = stageFilter;
      const res: any = await lifecycleApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleViewTimeline = (record: any) => {
    setCurrentRecord(record);
    setDrawerOpen(true);
  };

  const handleTransition = (record: any) => {
    setTransitionTarget(record);
    setTransitionOpen(true);
    form.resetFields();
  };

  const handleDoTransition = async () => {
    const values = await form.validateFields();
    await lifecycleApi.transition(transitionTarget.productId, values);
    message.success('阶段切换成功');
    setTransitionOpen(false);
    fetchData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '商品ID', dataIndex: 'productId', width: 80 },
    { title: '商品名称', dataIndex: 'productName', ellipsis: true },
    { title: 'SKU', dataIndex: 'productSku', width: 120 },
    {
      title: '当前阶段',
      dataIndex: 'currentStage',
      render: (v: string) => <Tag color={stageColors[v]}>{stageLabels[v] || v}</Tag>,
    },
    { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewTimeline(record)}>历史</Button>
          {LIFECYCLE_TRANSITIONS[record.currentStage]?.length > 0 && (
            <Button type="link" size="small" onClick={() => handleTransition(record)}>切换</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={stageFilter}
            onChange={setStageFilter}
            allowClear
            placeholder="阶段筛选"
            style={{ width: 140 }}
            options={Object.entries(stageLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>

      <Modal
        title="切换生命周期阶段"
        open={transitionOpen}
        onOk={handleDoTransition}
        onCancel={() => setTransitionOpen(false)}
        destroyOnClose
      >
        {transitionTarget && (
          <div style={{ marginBottom: 16 }}>
            当前阶段: <Tag color={stageColors[transitionTarget.currentStage]}>
              {stageLabels[transitionTarget.currentStage]}
            </Tag>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item name="stage" label="目标阶段" rules={[{ required: true, message: '请选择目标阶段' }]}>
            <Select
              placeholder="选择目标阶段"
              options={(transitionTarget ? LIFECYCLE_TRANSITIONS[transitionTarget.currentStage] || [] : [])
                .map((s: string) => ({ label: stageLabels[s], value: s }))}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="阶段变更历史" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={420}>
        {currentRecord && (
          <div>
            <p><strong>商品:</strong> {currentRecord.productName || currentRecord.productId}</p>
            <p><strong>当前阶段:</strong> <Tag color={stageColors[currentRecord.currentStage]}>{stageLabels[currentRecord.currentStage]}</Tag></p>
            <Timeline
              style={{ marginTop: 24 }}
              items={(currentRecord.stageHistory || []).slice().reverse().map((item: any) => ({
                color: stageColors[item.stage] === 'success' ? 'green' : stageColors[item.stage] === 'error' ? 'red' : 'blue',
                children: (
                  <div>
                    <div><strong>{stageLabels[item.stage] || item.stage}</strong></div>
                    {item.remark && <div>{item.remark}</div>}
                    <div style={{ color: '#999', fontSize: 12 }}>{item.enteredAt}</div>
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </Drawer>
    </>
  );
}

// ====== Batch Tab ======
function BatchTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [traceCode, setTraceCode] = useState('');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (statusFilter) params.status = statusFilter;
      const res: any = await batchApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleCreate = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      productionDate: values.productionDate?.format('YYYY-MM-DD'),
      expirationDate: values.expirationDate?.format('YYYY-MM-DD') || undefined,
    };
    await batchApi.create(payload);
    message.success('创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchData();
  };

  const handleTrace = async () => {
    if (!traceCode) { message.warning('请输入追溯码'); return; }
    try {
      const res: any = await batchApi.trace(traceCode);
      setTraceData(res);
      setTraceOpen(true);
    } catch {
      message.error('追溯码无效');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '商品名称', dataIndex: 'productName', ellipsis: true },
    { title: '批次号', dataIndex: 'batchNo', width: 120 },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '剩余', dataIndex: 'remainingQuantity', width: 80 },
    { title: '成本价', dataIndex: 'costPrice', width: 90 },
    { title: '供应商', dataIndex: 'supplier', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={batchStatusColors[v]}>{batchStatusLabels[v] || v}</Tag>,
    },
    {
      title: '质量分',
      dataIndex: 'qualityScore',
      width: 100,
      render: (v: number | null) => v !== null ? <Progress percent={v} size="small" /> : '-',
    },
    { title: '生产日期', dataIndex: 'productionDate', width: 110 },
    { title: '追溯码', dataIndex: 'traceCode', width: 160, ellipsis: true },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
            options={Object.entries(batchStatusLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={() => setCreateOpen(true)}>创建批次</Button>
          <Input
            placeholder="追溯码"
            value={traceCode}
            onChange={(e) => setTraceCode(e.target.value)}
            style={{ width: 200 }}
          />
          <Button onClick={handleTrace}>追溯</Button>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>

      <Modal title="创建批次" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnClose width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="productId" label="商品ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="costPrice" label="成本价" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="supplier" label="供应商" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="productionDate" label="生产日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expirationDate" label="过期日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="批次追溯" open={traceOpen} onClose={() => setTraceOpen(false)} width={500}>
        {traceData && (
          <div>
            {traceData.product && (
              <Card size="small" title="商品信息" style={{ marginBottom: 16 }}>
                <p><strong>名称:</strong> {traceData.product.name}</p>
                <p><strong>SKU:</strong> {traceData.product.sku}</p>
              </Card>
            )}
            <Card size="small" title="批次信息" style={{ marginBottom: 16 }}>
              <p><strong>批次号:</strong> {traceData.batch.batchNo}</p>
              <p><strong>供应商:</strong> {traceData.batch.supplier}</p>
              <p><strong>数量:</strong> {traceData.batch.quantity} / 剩余: {traceData.batch.remainingQuantity}</p>
              <p><strong>状态:</strong> <Tag color={batchStatusColors[traceData.batch.status]}>{batchStatusLabels[traceData.batch.status]}</Tag></p>
              <p><strong>生产日期:</strong> {traceData.batch.productionDate}</p>
              {traceData.batch.expirationDate && <p><strong>过期日期:</strong> {traceData.batch.expirationDate}</p>}
            </Card>
            {traceData.lifecycle && (
              <Card size="small" title="生命周期" style={{ marginBottom: 16 }}>
                <p><strong>当前阶段:</strong> <Tag color={stageColors[traceData.lifecycle.currentStage]}>{stageLabels[traceData.lifecycle.currentStage]}</Tag></p>
              </Card>
            )}
            {traceData.qualityRecords?.length > 0 && (
              <Card size="small" title="质量记录">
                {traceData.qualityRecords.map((r: any) => (
                  <div key={r.id} style={{ marginBottom: 8, padding: 8, background: '#fafafa', borderRadius: 4 }}>
                    <Space>
                      <Tag color={qualityResultColors[r.result]}>{qualityResultLabels[r.result]}</Tag>
                      <span>{r.checkType}</span>
                      <span>得分: {r.score}</span>
                    </Space>
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{r.checkedAt}</div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}

// ====== Quality Tab ======
function QualityTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [resultFilter, setResultFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (resultFilter) params.result = resultFilter;
      const res: any = await qualityApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleCreate = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      checkedAt: values.checkedAt?.toISOString() || undefined,
      checkItems: (values.checkItems || []).map((item: any) => ({
        ...item,
        passed: item.actual === item.standard || item.passed,
      })),
    };
    await qualityApi.create(payload);
    message.success('创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '商品名称', dataIndex: 'productName', ellipsis: true },
    { title: '检验类型', dataIndex: 'checkType', width: 100 },
    {
      title: '结果',
      dataIndex: 'result',
      width: 100,
      render: (v: string) => <Tag color={qualityResultColors[v]}>{qualityResultLabels[v] || v}</Tag>,
    },
    {
      title: '质量评分',
      dataIndex: 'score',
      width: 120,
      render: (v: number) => <Progress percent={v} size="small" status={v >= 80 ? 'success' : v >= 60 ? 'normal' : 'exception'} />,
    },
    { title: '检验员', dataIndex: 'inspector', width: 100 },
    { title: '检验时间', dataIndex: 'checkedAt', width: 160 },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={resultFilter}
            onChange={setResultFilter}
            allowClear
            placeholder="检验结果"
            style={{ width: 140 }}
            options={Object.entries(qualityResultLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={() => setCreateOpen(true)}>创建质检记录</Button>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>

      <Modal
        title="创建质检记录"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productId" label="商品ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="batchId" label="批次ID">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="checkType" label="检验类型" rules={[{ required: true }]}>
            <Select options={[
              { label: '入库检验', value: '入库检验' },
              { label: '出库检验', value: '出库检验' },
              { label: '例行抽检', value: '例行抽检' },
            ]} />
          </Form.Item>
          <Form.Item name="result" label="检验结果" rules={[{ required: true }]}>
            <Select options={Object.entries(qualityResultLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item name="score" label="质量评分(0-100)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inspector" label="检验员" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.List name="checkItems">
            {(fields, { add, remove }) => (
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>检验项目</div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'item']} rules={[{ required: true, message: '项目名' }]}>
                      <Input placeholder="项目名" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'standard']} rules={[{ required: true, message: '标准值' }]}>
                      <Input placeholder="标准值" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'actual']} rules={[{ required: true, message: '实际值' }]}>
                      <Input placeholder="实际值" style={{ width: 120 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加检验项
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
}
