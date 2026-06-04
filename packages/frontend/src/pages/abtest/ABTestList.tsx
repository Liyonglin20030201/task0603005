import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Select, Space, Tag, Popconfirm, message, Row, Col, Statistic, Progress } from 'antd';
import { ExperimentOutlined, RiseOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { abTestApi } from '../../api';

const typeLabels: Record<string, string> = {
  price: '价格测试',
  page_layout: '页面布局',
  promotion: '促销策略',
  copy: '文案测试',
  image: '图片测试',
  recommendation: '推荐算法',
};

const statusLabels: Record<string, string> = {
  draft: '草稿',
  running: '运行中',
  paused: '已暂停',
  completed: '已完成',
  archived: '已归档',
};

const statusColors: Record<string, string> = {
  draft: 'default',
  running: 'processing',
  paused: 'warning',
  completed: 'success',
  archived: 'default',
};

const typeColors: Record<string, string> = {
  price: 'magenta',
  page_layout: 'blue',
  promotion: 'orange',
  copy: 'cyan',
  image: 'purple',
  recommendation: 'green',
};

export default function ABTestList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [dashboard, setDashboard] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (name) params.name = name;
      if (type) params.type = type;
      if (status) params.status = status;
      const res: any = await abTestApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res: any = await abTestApi.dashboard();
      setDashboard(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    fetchDashboard();
  }, [page, pageSize]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleStart = async (id: number) => {
    await abTestApi.start(id);
    message.success('测试已启动');
    fetchData();
    fetchDashboard();
  };

  const handlePause = async (id: number) => {
    await abTestApi.pause(id);
    message.success('测试已暂停');
    fetchData();
    fetchDashboard();
  };

  const handleComplete = async (id: number) => {
    await abTestApi.complete(id);
    message.success('测试已完成');
    fetchData();
    fetchDashboard();
  };

  const handleDelete = async (id: number) => {
    await abTestApi.delete(id);
    message.success('删除成功');
    fetchData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '测试名称', dataIndex: 'name', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      render: (v: string) => <Tag color={typeColors[v]}>{typeLabels[v] || v}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag>,
    },
    { title: '主要指标', dataIndex: 'primaryMetric', render: (v: string) => {
      const metricLabels: Record<string, string> = {
        conversion_rate: '转化率', click_rate: '点击率', revenue: '收入',
        aov: '客单价', bounce_rate: '跳出率', engagement: '参与度',
      };
      return metricLabels[v] || v;
    }},
    {
      title: '样本进度',
      width: 150,
      render: (_: any, record: any) => {
        const percent = record.targetSampleSize > 0
          ? Math.min(100, Math.round((record.currentSampleSize / record.targetSampleSize) * 100))
          : 0;
        return <Progress percent={percent} size="small" />;
      },
    },
    {
      title: '变体数',
      width: 70,
      render: (_: any, record: any) => record.variants?.length || 0,
    },
    {
      title: '赢家',
      width: 80,
      render: (_: any, record: any) => {
        if (!record.winnerVariantId) return '-';
        const winner = record.variants?.find((v: any) => v.id === record.winnerVariantId);
        return winner ? <Tag color="gold">{winner.name}</Tag> : '-';
      },
    },
    {
      title: '操作',
      width: 260,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/ab-tests/${record.id}`)}>详情</Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => navigate(`/ab-tests/${record.id}/edit`)}>编辑</Button>
          )}
          {(record.status === 'draft' || record.status === 'paused') && (
            <Button type="link" size="small" onClick={() => handleStart(record.id)}>启动</Button>
          )}
          {record.status === 'running' && (
            <Button type="link" size="small" onClick={() => handlePause(record.id)}>暂停</Button>
          )}
          {(record.status === 'running' || record.status === 'paused') && (
            <Popconfirm title="确认完成测试?" onConfirm={() => handleComplete(record.id)}>
              <Button type="link" size="small">完成</Button>
            </Popconfirm>
          )}
          {record.status === 'draft' && (
            <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger size="small">删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="运行中测试" value={dashboard.activeTests || 0} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总转化次数" value={dashboard.totalConversions || 0} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均提升" value={dashboard.avgImprovement || 0} suffix="%" prefix={<RiseOutlined />} precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成测试" value={dashboard.completedTests || 0} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="测试名称" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 160 }} />
          <Select
            value={type || undefined}
            onChange={(v) => setType(v || '')}
            allowClear
            placeholder="类型"
            style={{ width: 120 }}
            options={Object.entries(typeLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Select
            value={status || undefined}
            onChange={(v) => setStatus(v || '')}
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
            options={Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={() => navigate('/ab-tests/create')}>创建测试</Button>
        </Space>
      </Card>

      <Card>
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
      </Card>
    </div>
  );
}
