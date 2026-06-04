import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, InputNumber, Button, message, Space } from 'antd';
import dayjs from 'dayjs';
import { campaignApi } from '../../api';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function CampaignForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      campaignApi.detail(+id).then((res: any) => {
        form.setFieldsValue({
          ...res,
          timeRange: [dayjs(res.startTime), dayjs(res.endTime)],
        });
      });
    }
  }, [id]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        type: values.type,
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString(),
        budget: values.budget,
        description: values.description,
        rules: values.rules ? JSON.parse(values.rules) : null,
      };
      if (isEdit) {
        await campaignApi.update(+id, payload);
        message.success('更新成功');
      } else {
        await campaignApi.create(payload);
        message.success('创建成功');
      }
      navigate('/campaigns');
    } catch (e: any) {
      if (e?.message?.includes('JSON')) {
        message.error('规则格式错误，请输入有效JSON');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isEdit ? '编辑活动' : '创建活动'}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 600 }}>
        <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="type" label="活动类型" rules={[{ required: true, message: '请选择活动类型' }]}>
          <Select options={[
            { label: '限时秒杀', value: 'flash_sale' },
            { label: '组合优惠', value: 'bundle' },
            { label: '折扣促销', value: 'discount' },
            { label: '满额包邮', value: 'free_shipping' },
          ]} />
        </Form.Item>
        <Form.Item name="timeRange" label="活动时间" rules={[{ required: true, message: '请选择活动时间' }]}>
          <RangePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="budget" label="预算">
          <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="不填则无限制" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="rules" label="规则(JSON)">
          <TextArea rows={4} placeholder='例如: {"discount": 0.8, "minQuantity": 2}' />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? '更新' : '创建'}
            </Button>
            <Button onClick={() => navigate('/campaigns')}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
