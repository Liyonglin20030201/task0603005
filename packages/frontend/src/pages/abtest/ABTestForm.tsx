import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, InputNumber, Button, message, Space, Switch, Alert } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { abTestApi } from '../../api';

const { TextArea } = Input;

const typeOptions = [
  { label: '价格测试', value: 'price' },
  { label: '页面布局', value: 'page_layout' },
  { label: '促销策略', value: 'promotion' },
  { label: '文案测试', value: 'copy' },
  { label: '图片测试', value: 'image' },
  { label: '推荐算法', value: 'recommendation' },
];

const metricOptions = [
  { label: '转化率', value: 'conversion_rate' },
  { label: '点击率', value: 'click_rate' },
  { label: '收入', value: 'revenue' },
  { label: '客单价', value: 'aov' },
  { label: '跳出率', value: 'bounce_rate' },
  { label: '参与度', value: 'engagement' },
];

export default function ABTestForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      abTestApi.detail(+id).then((res: any) => {
        form.setFieldsValue({
          name: res.name,
          type: res.type,
          hypothesis: res.hypothesis,
          primaryMetric: res.primaryMetric,
          secondaryMetrics: res.secondaryMetrics || [],
          targetSampleSize: res.targetSampleSize,
          confidenceLevel: res.confidenceLevel,
          variants: res.variants?.map((v: any) => ({
            name: v.name,
            description: v.description,
            trafficPercent: v.trafficPercent,
            isControl: v.isControl,
            config: v.config ? JSON.stringify(v.config) : '',
          })) || [],
        });
      });
    } else {
      form.setFieldsValue({
        targetSampleSize: 1000,
        confidenceLevel: 0.95,
        variants: [
          { name: '对照组', description: '原始版本', trafficPercent: 50, isControl: true, config: '' },
          { name: '变体A', description: '测试版本', trafficPercent: 50, isControl: false, config: '' },
        ],
      });
    }
  }, [id]);

  const handleSubmit = async (values: any) => {
    // Validate traffic total
    const totalTraffic = values.variants.reduce((sum: number, v: any) => sum + (v.trafficPercent || 0), 0);
    if (totalTraffic !== 100) {
      message.error(`流量总和必须为100%，当前为${totalTraffic}%`);
      return;
    }

    const controlCount = values.variants.filter((v: any) => v.isControl).length;
    if (controlCount !== 1) {
      message.error('必须且只能有一个对照组');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: values.name,
        type: values.type,
        hypothesis: values.hypothesis,
        primaryMetric: values.primaryMetric,
        secondaryMetrics: values.secondaryMetrics || [],
        targetSampleSize: values.targetSampleSize,
        confidenceLevel: values.confidenceLevel,
        variants: values.variants.map((v: any) => ({
          name: v.name,
          description: v.description || '',
          trafficPercent: v.trafficPercent,
          isControl: v.isControl || false,
          config: v.config ? (typeof v.config === 'string' ? JSON.parse(v.config) : v.config) : {},
        })),
      };

      if (isEdit) {
        await abTestApi.update(+id, payload);
        message.success('更新成功');
      } else {
        await abTestApi.create(payload);
        message.success('创建成功');
      }
      navigate('/ab-tests');
    } catch (e: any) {
      if (e?.message?.includes('JSON')) {
        message.error('变体配置格式错误，请输入有效JSON');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isEdit ? '编辑A/B测试' : '创建A/B测试'}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 800 }}>
        <Form.Item name="name" label="测试名称" rules={[{ required: true, message: '请输入测试名称' }]}>
          <Input placeholder="例如: 首页Banner点击率优化" />
        </Form.Item>

        <Form.Item name="type" label="测试类型" rules={[{ required: true, message: '请选择测试类型' }]}>
          <Select options={typeOptions} placeholder="选择测试类型" />
        </Form.Item>

        <Form.Item name="hypothesis" label="假设" rules={[{ required: true, message: '请输入测试假设' }]}>
          <TextArea rows={3} placeholder="描述您的测试假设，例如: 将按钮颜色从蓝色改为红色将提高点击率" />
        </Form.Item>

        <Form.Item name="primaryMetric" label="主要指标" rules={[{ required: true, message: '请选择主要指标' }]}>
          <Select options={metricOptions} placeholder="选择主要评估指标" />
        </Form.Item>

        <Form.Item name="secondaryMetrics" label="次要指标">
          <Select mode="multiple" options={metricOptions} placeholder="选择次要指标(可多选)" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item name="targetSampleSize" label="目标样本量" rules={[{ required: true }]}>
            <InputNumber min={100} max={1000000} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="confidenceLevel" label="置信水平" rules={[{ required: true }]}>
            <Select style={{ width: 200 }} options={[
              { label: '80%', value: 0.8 },
              { label: '85%', value: 0.85 },
              { label: '90%', value: 0.9 },
              { label: '95%', value: 0.95 },
              { label: '99%', value: 0.99 },
            ]} />
          </Form.Item>
        </Space>

        <Alert
          message="变体配置"
          description="所有变体的流量占比之和必须等于100%，且必须有一个对照组。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name: fieldName, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: 12 }}
                  extra={fields.length > 2 && <MinusCircleOutlined onClick={() => remove(fieldName)} />}
                >
                  <Space style={{ display: 'flex', flexWrap: 'wrap' }} align="start">
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'name']}
                      rules={[{ required: true, message: '请输入变体名称' }]}
                      label="名称"
                    >
                      <Input placeholder="变体名称" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'description']}
                      label="描述"
                    >
                      <Input placeholder="变体描述" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'trafficPercent']}
                      rules={[{ required: true, message: '请输入流量占比' }]}
                      label="流量%"
                    >
                      <InputNumber min={1} max={99} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'isControl']}
                      valuePropName="checked"
                      label="对照组"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'config']}
                      label="配置(JSON)"
                    >
                      <Input placeholder='{"key":"value"}' style={{ width: 200 }} />
                    </Form.Item>
                  </Space>
                </Card>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ name: '', description: '', trafficPercent: 0, isControl: false, config: '' })} block icon={<PlusOutlined />}>
                  添加变体
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? '更新' : '创建'}
            </Button>
            <Button onClick={() => navigate('/ab-tests')}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
