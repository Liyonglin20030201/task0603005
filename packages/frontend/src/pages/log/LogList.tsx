import React, { useState, useEffect } from 'react';
import {
  Table,
  Select,
  Input,
  InputNumber,
  DatePicker,
  Space,
  message,
  Card,
} from 'antd';
import { logApi } from '../../api';

const { RangePicker } = DatePicker;

const MODULE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '角色', value: 'role' },
  { label: '用户', value: 'user' },
  { label: '商品', value: 'product' },
  { label: '分类', value: 'category' },
  { label: '订单', value: 'order' },
  { label: '库存', value: 'inventory' },
  { label: '优惠券', value: 'coupon' },
  { label: '导入导出', value: 'import-export' },
];

const LogList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchModule, setSearchModule] = useState<string | undefined>(undefined);
  const [searchAction, setSearchAction] = useState('');
  const [searchAdminId, setSearchAdminId] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (searchModule) params.module = searchModule;
      if (searchAction) params.action = searchAction;
      if (searchAdminId !== undefined) params.adminId = searchAdminId;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res: any = await logApi.list(params);
      setData(res.data?.list || res.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      message.error('获取日志列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchModule, searchAction, searchAdminId, dateRange]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '管理员ID', dataIndex: 'adminId', key: 'adminId', width: 90 },
    { title: '模块', dataIndex: 'module', key: 'module', width: 100 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 120 },
    { title: '目标ID', dataIndex: 'targetId', key: 'targetId', width: 80 },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 140 },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <Card title="操作日志">
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="模块"
          value={searchModule}
          onChange={(val) => {
            setSearchModule(val);
            setPage(1);
          }}
          allowClear
          style={{ width: 140 }}
          options={MODULE_OPTIONS}
        />
        <Input
          placeholder="操作"
          value={searchAction}
          onChange={(e) => {
            setSearchAction(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: 140 }}
        />
        <InputNumber
          placeholder="管理员ID"
          value={searchAdminId}
          onChange={(val) => {
            setSearchAdminId(val ?? undefined);
            setPage(1);
          }}
          style={{ width: 120 }}
        />
        <RangePicker
          onChange={(dates) => {
            setDateRange(dates as [any, any] | null);
            setPage(1);
          }}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{
          expandedRowRender: (record: any) => (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(record.detail || record, null, 2)}
            </pre>
          ),
        }}
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
    </Card>
  );
};

export default LogList;
