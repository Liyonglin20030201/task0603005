import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Row, Col, Statistic, Progress, Space, message, Popconfirm, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import * as echarts from 'echarts';
import { abTestApi } from '../../api';

const typeLabels: Record<string, string> = {
  price: '价格测试', page_layout: '页面布局', promotion: '促销策略',
  copy: '文案测试', image: '图片测试', recommendation: '推荐算法',
};
const statusLabels: Record<string, string> = {
  draft: '草稿', running: '运行中', paused: '已暂停', completed: '已完成', archived: '已归档',
};
const statusColors: Record<string, string> = {
  draft: 'default', running: 'processing', paused: 'warning', completed: 'success', archived: 'default',
};
const metricLabels: Record<string, string> = {
  conversion_rate: '转化率', click_rate: '点击率', revenue: '收入',
  aov: '客单价', bounce_rate: '跳出率', engagement: '参与度',
};

export default function ABTestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const funnelChartRef = useRef<HTMLDivElement>(null);

  const fetchDetail = async () => {
    const res = await abTestApi.detail(+id!);
    setTest(res);
  };

  const fetchReport = async () => {
    try {
      const res = await abTestApi.report(+id!);
      setReport(res);
    } catch {
      // test may not have enough data
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchReport();
  }, [id]);

  useEffect(() => {
    if (!report) return;
    renderLineChart();
    renderBarChart();
    renderFunnelChart();

    const handleResize = () => {
      if (lineChartRef.current) echarts.getInstanceByDom(lineChartRef.current)?.resize();
      if (barChartRef.current) echarts.getInstanceByDom(barChartRef.current)?.resize();
      if (funnelChartRef.current) echarts.getInstanceByDom(funnelChartRef.current)?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (lineChartRef.current) echarts.dispose(lineChartRef.current);
      if (barChartRef.current) echarts.dispose(barChartRef.current);
      if (funnelChartRef.current) echarts.dispose(funnelChartRef.current);
    };
  }, [report]);

  const renderLineChart = () => {
    if (!lineChartRef.current || !report?.dailyData?.length) return;
    const chart = echarts.init(lineChartRef.current);
    const variantNames = [...new Set(report.dailyData.map((d: any) => d.variantName))] as string[];
    const dates = [...new Set(report.dailyData.map((d: any) => d.date))] as string[];

    const series = variantNames.map((name: string) => ({
      name,
      type: 'line',
      smooth: true,
      data: dates.map((date: string) => {
        const item = report.dailyData.find((d: any) => d.date === date && d.variantName === name);
        return item ? item.conversionRate : 0;
      }),
    }));

    chart.setOption({
      title: { text: '每日转化率趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, data: variantNames },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value', name: '转化率(%)' },
      series,
    });
  };

  const renderBarChart = () => {
    if (!barChartRef.current || !report?.variants?.length) return;
    const chart = echarts.init(barChartRef.current);
    const names = report.variants.map((v: any) => v.name);
    const rates = report.variants.map((v: any) => v.conversionRate);

    chart.setOption({
      title: { text: '变体转化率对比', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names },
      yAxis: { type: 'value', name: '转化率(%)' },
      series: [{
        type: 'bar',
        data: rates.map((r: number, i: number) => ({
          value: r,
          itemStyle: { color: report.variants[i].isControl ? '#1890ff' : '#52c41a' },
        })),
        label: { show: true, position: 'top', formatter: '{c}%' },
      }],
    });
  };

  const renderFunnelChart = () => {
    if (!funnelChartRef.current || !report?.variants?.length) return;
    const chart = echarts.init(funnelChartRef.current);

    const totalImpressions = report.variants.reduce((sum: number, v: any) => sum + v.impressions, 0);
    const totalConversions = report.variants.reduce((sum: number, v: any) => sum + v.conversions, 0);
    const estimatedClicks = Math.floor((totalImpressions + totalConversions) / 2);

    chart.setOption({
      title: { text: '转化漏斗', left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [{
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 20,
        width: '80%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', formatter: '{b}\n{c}' },
        data: [
          { value: totalImpressions, name: '曝光' },
          { value: estimatedClicks, name: '点击' },
          { value: totalConversions, name: '转化' },
        ],
      }],
    });
  };

  const handleStart = async () => {
    await abTestApi.start(+id!);
    message.success('测试已启动');
    fetchDetail();
    fetchReport();
  };

  const handlePause = async () => {
    await abTestApi.pause(+id!);
    message.success('测试已暂停');
    fetchDetail();
  };

  const handleComplete = async () => {
    await abTestApi.complete(+id!);
    message.success('测试已完成');
    fetchDetail();
    fetchReport();
  };

  const handleArchive = async () => {
    await abTestApi.archive(+id!);
    message.success('测试已归档');
    fetchDetail();
  };

  if (!test) return null;

  const samplePercent = test.targetSampleSize > 0
    ? Math.min(100, Math.round((test.currentSampleSize / test.targetSampleSize) * 100))
    : 0;

  return (
    <div>
      <Card
        title="A/B测试详情"
        extra={
          <Space>
            {(test.status === 'draft' || test.status === 'paused') && (
              <Button type="primary" onClick={handleStart}>启动测试</Button>
            )}
            {test.status === 'running' && (
              <Button onClick={handlePause}>暂停测试</Button>
            )}
            {(test.status === 'running' || test.status === 'paused') && (
              <Popconfirm title="确认完成测试?" onConfirm={handleComplete}>
                <Button>完成测试</Button>
              </Popconfirm>
            )}
            {test.status === 'completed' && (
              <Popconfirm title="确认归档?" onConfirm={handleArchive}>
                <Button>归档</Button>
              </Popconfirm>
            )}
            <Button onClick={() => navigate('/ab-tests')}>返回</Button>
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="测试名称">{test.name}</Descriptions.Item>
          <Descriptions.Item label="类型">{typeLabels[test.type]}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={statusColors[test.status]}>{statusLabels[test.status]}</Tag></Descriptions.Item>
          <Descriptions.Item label="主要指标">{metricLabels[test.primaryMetric]}</Descriptions.Item>
          <Descriptions.Item label="假设" span={2}>{test.hypothesis}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{test.startDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{test.endDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="置信水平">{(test.confidenceLevel * 100).toFixed(0)}%</Descriptions.Item>
          <Descriptions.Item label="样本进度">
            <Progress percent={samplePercent} size="small" style={{ width: 200 }} />
            <span style={{ marginLeft: 8 }}>{test.currentSampleSize} / {test.targetSampleSize}</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {report && report.variants && (
        <>
          <Row gutter={16} style={{ marginTop: 16 }}>
            {report.variants.map((v: any) => (
              <Col span={Math.floor(24 / report.variants.length)} key={v.id}>
                <Card
                  title={
                    <Space>
                      {v.name}
                      {v.isControl && <Tag color="blue">对照组</Tag>}
                      {!v.isControl && v.isSignificant && v.improvement > 0 && <Tag color="green">显著优胜</Tag>}
                    </Space>
                  }
                  size="small"
                >
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Statistic title="转化率" value={v.conversionRate} suffix="%" precision={2} />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="提升"
                        value={Math.abs(v.improvement)}
                        suffix="%"
                        precision={2}
                        prefix={v.improvement > 0 ? <ArrowUpOutlined /> : v.improvement < 0 ? <ArrowDownOutlined /> : null}
                        valueStyle={{ color: v.improvement > 0 ? '#3f8600' : v.improvement < 0 ? '#cf1322' : undefined }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic title="曝光量" value={v.impressions} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="转化数" value={v.conversions} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="收入" value={v.revenue} prefix="¥" precision={2} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="客单价" value={v.avgOrderValue} prefix="¥" precision={2} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="P值" value={v.pValue} precision={4} />
                    </Col>
                    <Col span={12}>
                      <Space>
                        <span>显著性:</span>
                        {v.isSignificant
                          ? <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                          : <CloseCircleFilled style={{ color: '#d9d9d9', fontSize: 20 }} />
                        }
                      </Space>
                    </Col>
                    {v.confidenceInterval && (
                      <Col span={24}>
                        <span style={{ color: '#666' }}>置信区间: [{v.confidenceInterval.lower}%, {v.confidenceInterval.upper}%]</span>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>

          {report.recommendation && (
            <Alert
              message="推荐"
              description={report.recommendation}
              type={report.variants.some((v: any) => !v.isControl && v.isSignificant && v.improvement > 0) ? 'success' : 'info'}
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="趋势分析">
                <div ref={lineChartRef} style={{ height: 350 }} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card>
                <div ref={barChartRef} style={{ height: 300 }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <div ref={funnelChartRef} style={{ height: 300 }} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
