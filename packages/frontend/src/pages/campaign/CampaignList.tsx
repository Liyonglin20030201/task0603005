import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Select, Space, Tag, Popconfirm, message } from 'antd';
import { campaignApi } from '../../api';

const typeLabels: Record<string, string> = {
  flash_sale: '限时秒杀',
  bundle: '组合优惠',
  discount: '折扣促销',
  free_shipping: '满额包邮',
};

const statusLabels: Record<string, string> = {
  draft: '草稿',
  active: '进行中',
  paused: '已暂停',
  ended: '已结束',
};

const statusColors: Record<string, string> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  ended: 'default',
};

export default function CampaignList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (name) params.name = name;
      if (type) params.type = type;
      if (status) params.status = status;
      const res: any = await campaignApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleActivate = async (id: number) => {
    await campaignApi.activate(id);
    message.success('活动已激活');
    fetchData();
  };

  const handlePause = async (id: number) => {
    await campaignApi.pause(id);
    message.success('活动已暂停');
    fetchData();
  };

  const handleEnd = async (id: number) => {
    await campaignApi.end(id);
    message.success('活动已结束');
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await campaignApi.delete(id);
    message.success('删除成功');
    fetchData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '活动名称', dataIndex: 'name', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      render: (v: string) => typeLabels[v] || v,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag>,
    },
    { title: '开始时间', dataIndex: 'startTime', width: 160 },
    { title: '结束时间', dataIndex: 'endTime', width: 160 },
    { title: '预算', dataIndex: 'budget', render: (v: number) => v ? `¥${v}` : '-' },
    { title: '商品数', dataIndex: 'productCount', width: 70 },
    {
      title: '操作',
      width: 240,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/campaigns/${record.id}`)}>详情</Button>
          {(record.status === 'draft' || record.status === 'paused') && (
            <Button type="link" size="small" onClick={() => navigate(`/campaigns/${record.id}/edit`)}>编辑</Button>
          )}
          {(record.status === 'draft' || record.status === 'paused') && (
            <Button type="link" size="small" onClick={() => handleActivate(record.id)}>激活</Button>
          )}
          {record.status === 'active' && (
            <Button type="link" size="small" onClick={() => handlePause(record.id)}>暂停</Button>
          )}
          {(record.status === 'active' || record.status === 'paused') && (
            <Popconfirm title="确认结束?" onConfirm={() => handleEnd(record.id)}>
              <Button type="link" size="small">结束</Button>
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
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="活动名称" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 160 }} />
          <Select
            value={type}
            onChange={setType}
            allowClear
            placeholder="类型"
            style={{ width: 120 }}
            options={Object.entries(typeLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Select
            value={status}
            onChange={setStatus}
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
            options={Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={() => navigate('/campaigns/create')}>创建活动</Button>
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
