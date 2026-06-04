import { useState, useEffect } from 'react';
import { Card, Table, Input, Space, Button, Tag, Row, Col, Statistic, Drawer, InputNumber, Checkbox } from 'antd';
import ReactECharts from 'echarts-for-react';
import { forecastApi } from '../../api';

export default function ForecastList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [productName, setProductName] = useState('');
  const [leadTime, setLeadTime] = useState(7);
  const [safetyStockDays, setSafetyStockDays] = useState(3);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [summary, setSummary] = useState<any>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize, leadTime, safetyStockDays };
      if (productName) params.productName = productName;
      if (onlyLowStock) params.onlyLowStock = 'true';
      const res: any = await forecastApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await forecastApi.summary(leadTime);
      setSummary(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    fetchSummary();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
    fetchSummary();
  };

  const getChartOption = () => {
    if (!currentProduct) return {};
    return {
      title: { text: `${currentProduct.productName} - 销售趋势`, left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['近30天日均', '近14天日均', '近7天日均', '预测需求'] },
      yAxis: { type: 'value', name: '数量' },
      series: [{
        type: 'line',
        data: [
          currentProduct.avgDailySales30,
          currentProduct.avgDailySales14,
          currentProduct.avgDailySales7,
          currentProduct.predictedDemand,
        ],
        smooth: true,
        markLine: {
          data: [{ yAxis: currentProduct.avgDailySales7, name: '日均销量' }],
        },
      }],
    };
  };

  const confidenceColors: Record<string, string> = { high: 'green', medium: 'orange', low: 'red' };
  const confidenceLabels: Record<string, string> = { high: '高', medium: '中', low: '低' };

  const columns = [
    { title: '商品', dataIndex: 'productName', ellipsis: true },
    { title: 'SKU', dataIndex: 'productSku', width: 120 },
    { title: '当前库存', dataIndex: 'currentStock', width: 90 },
    { title: '日均销量(7天)', dataIndex: 'avgDailySales7', width: 120 },
    { title: '预测需求', dataIndex: 'predictedDemand', width: 90 },
    {
      title: '可售天数',
      dataIndex: 'daysOfStockLeft',
      width: 90,
      render: (v: number) => (
        <span style={{ color: v <= 7 ? '#f5222d' : v <= 14 ? '#fa8c16' : '#52c41a', fontWeight: 'bold' }}>
          {v >= 9999 ? '充足' : v + '天'}
        </span>
      ),
    },
    {
      title: '建议补货',
      dataIndex: 'recommendedReorder',
      width: 90,
      render: (v: number) => (v > 0 ? <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{v}</span> : '-'),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      width: 80,
      render: (v: string) => <Tag color={confidenceColors[v]}>{confidenceLabels[v]}</Tag>,
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: any) => (
        <Button type="link" size="small" onClick={() => { setCurrentProduct(record); setDrawerOpen(true); }}>趋势</Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card><Statistic title="商品总数" value={summary.totalProducts || 0} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="需补货商品" value={summary.needReorder || 0} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="平均可售天数" value={summary.avgDaysOfStock || 0} suffix="天" /></Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="商品名称" value={productName} onChange={(e) => setProductName(e.target.value)} style={{ width: 160 }} />
          <span>补货周期:</span>
          <InputNumber min={1} max={30} value={leadTime} onChange={(v) => setLeadTime(v || 7)} style={{ width: 80 }} />
          <span>安全天数:</span>
          <InputNumber min={0} max={30} value={safetyStockDays} onChange={(v) => setSafetyStockDays(v || 3)} style={{ width: 80 }} />
          <Checkbox checked={onlyLowStock} onChange={(e) => setOnlyLowStock(e.target.checked)}>仅显示需补货</Checkbox>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="productId"
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
          rowClassName={(record: any) => record.daysOfStockLeft <= 7 ? 'forecast-warning-row' : ''}
        />
      </Card>

      <Drawer title="销售趋势分析" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={500}>
        {currentProduct && (
          <div>
            <p><strong>商品:</strong> {currentProduct.productName}</p>
            <p><strong>当前库存:</strong> {currentProduct.currentStock}</p>
            <p><strong>建议补货:</strong> {currentProduct.recommendedReorder}</p>
            <ReactECharts option={getChartOption()} style={{ height: 300 }} />
          </div>
        )}
      </Drawer>
    </div>
  );
}
