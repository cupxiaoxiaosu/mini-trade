import React, { useState } from 'react';
import { Form, Input, Button, Select, Radio, message, Card, Typography } from 'antd';
import { createOrder, OrderSide, OrderType, TimeInForce, type NewOrderParams } from '../adaptor/biance/api';
import type { token } from './Main';

const { Title, Text } = Typography;

interface TradeFormProps {
  selectedToken: token;
  onOrderCreated?: () => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ selectedToken, onOrderCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  // 处理订单提交
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      // 构建订单参数
      const orderParams: NewOrderParams = {
        symbol: selectedToken,
        side: values.side === 'BUY' ? OrderSide.BUY : OrderSide.SELL,
        type: values.orderType === 'LIMIT' ? OrderType.LIMIT : OrderType.MARKET,
        quantity: values.quantity
      };

      // 限价单需要价格和有效期
      if (values.orderType === 'LIMIT') {
        orderParams.price = values.price;
        orderParams.timeInForce = TimeInForce.GTC;
      }

      // 提交订单
      const result = await createOrder(orderParams);
      
      // 显示成功消息
      message.success(`订单创建成功！订单ID: ${result.orderId}`);
      
      // 通知父组件订单已创建，用于刷新其他组件
      if (onOrderCreated) {
        onOrderCreated();
      }
      
      // 重置表单
      form.resetFields();
      
      return result;
    } catch (error: any) {
      // 显示错误消息
      message.error(`订单创建失败: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 当选中的交易对变化时，重置表单
  React.useEffect(() => {
    form.resetFields();
  }, [selectedToken, form]);

  return (
    <Card title={<Title level={4}>交易表单</Title>} className="trade-form" variant="outlined">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          orderType: 'MARKET',
          side: 'BUY',
          symbol: selectedToken
        }}
      >
        {/* 交易对信息 */}
        <Form.Item label="交易对" name="symbol">
          <Select
            disabled
            options={[
              { value: 'ETHUSDT', label: 'ETH/USDT' },
              { value: 'BTCUSDT', label: 'BTC/USDT' },
              { value: 'SOLUSDT', label: 'SOL/USDT' }
            ]}
          />
        </Form.Item>

        {/* 交易方向 */}
        <Form.Item label="交易方向" name="side" rules={[{ required: true, message: '请选择交易方向' }]}>
          <Radio.Group>
            <Radio.Button value="BUY" style={{ color: 'green' }}>买入</Radio.Button>
            <Radio.Button value="SELL" style={{ color: 'red' }}>卖出</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* 订单类型 */}
        <Form.Item label="订单类型" name="orderType" rules={[{ required: true, message: '请选择订单类型' }]}>
          <Radio.Group>
            <Radio.Button value="MARKET">市价单</Radio.Button>
            <Radio.Button value="LIMIT">限价单</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* 价格（仅限价单需要） */}
        <Form.Item
          label="价格"
          name="price"
          noStyle
        >
          {({ getFieldValue }) => {
            // 只在限价单模式下显示价格输入
            if (getFieldValue('orderType') === 'LIMIT') {
              return (
                <Form.Item
                  label="价格"
                  rules={[
                    { required: true, message: '请输入价格' }
                  ]}
                >
                  <Input
                    placeholder="请输入价格"
                    type="number"
                    min={0}
                    step="any"
                  />
                  <Text type="secondary" style={{ marginTop: '4px', display: 'block' }}>
                    限价单需要指定价格，市价单将使用当前市场价格
                  </Text>
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>

        {/* 数量 */}
        <Form.Item
          label="数量"
          name="quantity"
          rules={[
            { required: true, message: '请输入数量' }, 
            {
              validator: (_, value) => {
                // 确保value是数字且大于0
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                  return Promise.reject(new Error('数量必须大于0'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="请输入交易数量" type="number" min="0.00000001" step="any" />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              {({ getFieldValue }) => {
                const side = getFieldValue('side');
                if (loading) {
                  return side === 'BUY' ? '买入中...' : '卖出中...';
                }
                return side === 'BUY' ? '买入' : '卖出';
              }}
            </Button>
            <Button onClick={() => form.resetFields()} disabled={loading}>
              重置
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TradeForm;