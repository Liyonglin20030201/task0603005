import React, { useState, useEffect } from 'react';
import { Tabs, DatePicker, Space, message, Card, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { reportApi } from '../../api';

const { RangePicker } = DatePicker;

const ReportDashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesRange, setSalesRange] = useState<[any, any] | null>(null);

  const [orderStatusData, setOrderStatusData] = useState<any>(null);
  const [orderStatusLoading, setOrderStatusLoading] = useState(false);

  const [topProductsData, setTopProductsData] = useState<any>(null);
  const [topProductsLoading, setTopProductsLoading] = useState(false);

  const [inventoryData, setInventoryData] = useState<any>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const fetchSalesData = async () => {
    if (!salesRange || !salesRange[0] || !salesRange[1]) return;
    setSalesLoading(true);
    try {
      const startDate = salesRange[0].format('YYYY-MM-DD');
      const endDate = salesRange[1].format('YYYY-MM-DD');
      const res: any = await reportApi.sales(startDate, endDate);
      setSalesData(res.data);
    } catch {
      message.error('获取销售报表失败');
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchOrderStatus = async () => {
    setOrderStatusLoading(true);
    try {
      const res: any = await reportApi.orderStatus();
      setOrderStatusData(res.data);
    } catch {
      message.error('获取订单状态分布失败');
    } finally {
      setOrderStatusLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    setTopProductsLoading(true);
    try {
      const res: any = await reportApi.topProducts(10);
      setTopProductsData(res.data);
    } catch {
      message.error('获取热销商品失败');
    } finally {
      setTopProductsLoading(false);
    }
  };

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const res: any = await reportApi.inventory();
      setInventoryData(res.data);
    } catch {
      message.error('获取库存报表失败');
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [salesRange]);

  useEffect(() => {
    fetchOrderStatus();
    fetchTopProducts();
    fetchInventory();
  }, []);

  const getSalesOption = () => {
    if (!salesData) return {};
    const days = salesData.list || salesData || [];
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['订单数', '销售额'] },
      xAxis: {
        type: 'category',
        data: days.map((d: any) => d.date),
      },
      yAxis: [
        { type: 'value', name: '订单数' },
        { type: 'value', name: '销售额' },
      ],
      series: [
        {
          name: '订单数',
          type: 'line',
          data: days.map((d: any) => d.orderCount),
        },
        {
          name: '销售额',
          type: 'line',
          yAxisIndex: 1,
          data: days.map((d: any) => d.salesAmount),
        },
      ],
    };
  };

  const getOrderStatusOption = () => {
    if (!orderStatusData) return {};
    const items = orderStatusData.list || orderStatusData || [];
    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '订单状态',
          type: 'pie',
          radius: '60%',
          data: items.map((item: any) => ({
            name: item.status || item.name,
            value: item.count || item.value,
          })),
        },
      ],
    };
  };

  const getTopProductsOption = () => {
    if (!topProductsData) return {};
    const items = topProductsData.list || topProductsData || [];
    return {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: items.map((item: any) => item.productName || item.name),
        axisLabel: { rotate: 30 },
      },
      yAxis: { type: 'value', name: '销量' },
      series: [
        {
          name: '销量',
          type: 'bar',
          data: items.map((item: any) => item.salesCount || item.count || item.value),
        },
      ],
    };
  };

  const getInventoryOption = () => {
    if (!inventoryData) return {};
    const items = inventoryData.list || inventoryData || [];
    // If it's already categorized data
    if (Array.isArray(items) && items.length > 0 && items[0].name) {
      return {
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            name: '库存状态',
            type: 'pie',
            radius: '60%',
            data: items.map((item: any) => ({
              name: item.name,
              value: item.count || item.value,
            })),
          },
        ],
      };
    }
    // Otherwise build from summary fields
    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '库存状态',
          type: 'pie',
          radius: '60%',
          data: [
            { name: '正常', value: inventoryData.normal || 0 },
            { name: '低库存', value: inventoryData.lowStock || 0 },
            { name: '缺货', value: inventoryData.outOfStock || 0 },
          ],
        },
      ],
    };
  };

  const tabItems = [
    {
      key: 'sales',
      label: '销售报表',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <RangePicker
              onChange={(dates) => setSalesRange(dates as [any, any] | null)}
            />
          </Space>
          <Spin spinning={salesLoading}>
            {salesData ? (
              <ReactECharts option={getSalesOption()} style={{ height: 400 }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                请选择日期范围查看销售报表
              </div>
            )}
          </Spin>
        </div>
      ),
    },
    {
      key: 'orderStatus',
      label: '订单状态分布',
      children: (
        <Spin spinning={orderStatusLoading}>
          {orderStatusData ? (
            <ReactECharts option={getOrderStatusOption()} style={{ height: 400 }} />
          ) : null}
        </Spin>
      ),
    },
    {
      key: 'topProducts',
      label: '热销商品',
      children: (
        <Spin spinning={topProductsLoading}>
          {topProductsData ? (
            <ReactECharts option={getTopProductsOption()} style={{ height: 400 }} />
          ) : null}
        </Spin>
      ),
    },
    {
      key: 'inventory',
      label: '库存报表',
      children: (
        <Spin spinning={inventoryLoading}>
          {inventoryData ? (
            <ReactECharts option={getInventoryOption()} style={{ height: 400 }} />
          ) : null}
        </Spin>
      ),
    },
  ];

  return (
    <Card title="数据报表">
      <Tabs items={tabItems} />
    </Card>
  );
};

export default ReportDashboard;
