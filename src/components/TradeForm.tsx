import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { createOrder, OrderSide, OrderType, TimeInForce, type NewOrderParams } from '@/adaptor/biance';

type Token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

const { Text } = Typography;

interface TradeFormProps {
  selectedToken: Token;
  onOrderCreated?: () => void;
  balance?: number;
  coinBalance?: number;
  currentPrice: number;
}

const TradeForm: React.FC<TradeFormProps> = ({ 
  selectedToken, 
  onOrderCreated, 
  balance = 10000, 
  coinBalance = 10,
  currentPrice = 0
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [quantityPercentage, setQuantityPercentage] = useState(0);
  

  
  const quantity = form.getFieldValue('side') === 'BUY' ? (balance * quantityPercentage / 100) / currentPrice : (coinBalance * quantityPercentage / 100);

  const quickSelectQuantity = (percentage: number) => {
    const precision = selectedToken.includes('BTC') ? 6 : 4;
    const quantityStr = quantity.toFixed(precision);
    // 确保数量值立即更新到表单中
    form.setFieldsValue({ quantity: quantityStr });
    
    // 同时更新百分比状态
    setQuantityPercentage(percentage);
    
    console.log(`已选择${percentage}%，数量设置为: ${quantityStr}`);
  };
  
  // 处理数量变化，更新百分比
  const handleQuantityChange = (value: string) => {
    const side = form.getFieldValue('side');
    const quantity = parseFloat(value) || 0;
    const price = currentPrice || 1;
    
    let maxQuantity = 0;
    if (side === 'BUY') {
      maxQuantity = balance / price;
    } else {
      maxQuantity = coinBalance;
    }
    
    if (maxQuantity > 0) {
      const percentage = (quantity / maxQuantity) * 100;
      // 检查是否接近预设百分比
      if (Math.abs(percentage - 25) < 1) setQuantityPercentage(25);
      else if (Math.abs(percentage - 50) < 1) setQuantityPercentage(50);
      else if (Math.abs(percentage - 75) < 1) setQuantityPercentage(75);
      else if (Math.abs(percentage - 100) < 1) setQuantityPercentage(100);
      else setQuantityPercentage(Math.round(percentage));
    }
  };

  // 计算投入金额
  const calculateInvestment = () => {
    const quantity = parseFloat(form.getFieldValue('quantity') || '0');
    return quantity * (form.getFieldValue('price') || currentPrice || 1);
  };
  
  // 切换买卖方向
  const handleSideChange = (newSide: string) => {
    console.log('切换买卖方向:', newSide);
    // 更新表单中的side字段
    form.setFieldValue('side', newSide);
    setQuantityPercentage(0);
    form.setFieldValue('quantity', '');
  };
  
  // 提交订单
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      console.log('开始处理订单提交...');
      
      // 1. 获取和验证交易参数
      const quantity = parseFloat(values.quantity);
      const orderPrice = values.orderType === 'LIMIT' ? parseFloat(values.price) : currentPrice;
      
      console.log('交易参数:', {
        symbol: selectedToken,
        side: values.side,
        type: values.orderType,
        quantity: quantity,
        price: orderPrice
      });
      
      // 2. 检查余额是否充足
      if (values.side === 'BUY') {
        const requiredAmount = quantity * orderPrice;
        console.log('买入所需USDT:', requiredAmount, '可用余额:', balance);
        if (requiredAmount > balance) {
          message.error(t('tradeForm.insufficientUSDT'));
          return;
        }
      } else {
        console.log('卖出数量:', quantity, '可用余额:', coinBalance);
        if (quantity > coinBalance) {
          message.error(t('tradeForm.insufficientCoin', { coin: coinSymbol }));
          return;
        }
      }
      
      // 3. 构建订单参数对象
      console.log('当前用户选择的交易方向:', side);
      
      // 完全基于UI上显示的交易方向构建订单参数
      const orderSide = side === 'BUY' ? OrderSide.BUY : OrderSide.SELL;
      
      const orderParams: NewOrderParams = {
        symbol: selectedToken,
        side: orderSide,
        type: values.orderType === 'LIMIT' ? OrderType.LIMIT : OrderType.MARKET,
        quantity: values.quantity
      };
      
      // 重要：记录最终发送到API的订单参数
      console.log('最终发送到API的订单参数:', JSON.stringify(orderParams));

      // 4. 添加限价单特有的参数
      if (values.orderType === 'LIMIT') {
        orderParams.price = values.price;
        orderParams.timeInForce = TimeInForce.GTC;
        console.log('限价单参数已添加');
      }

      // 5. 调用下单接口
      console.log('调用createOrder接口...');
      const orderResult = await createOrder(orderParams);
      console.log('订单创建成功:', orderResult);
      
      // 6. 处理成功响应
      message.success(`${t('tradeForm.orderCreated')}! ${t('historicalOrders.orderId')}: ${orderResult?.orderId || 'N/A'}`);
      
      // 7. 通知父组件订单已创建
      if (onOrderCreated) {
        console.log('通知父组件订单已创建');
        onOrderCreated();
      }
      
      // 8. 重置表单
      form.resetFields();
      setQuantityPercentage(0);
      console.log('表单已重置');
      
    } catch (error: any) {
      // 9. 处理错误
      console.error('下单失败:', error);
      message.error(`${t('tradeForm.orderFailed')}: ${error.message || '未知错误'}`);
    } finally {
      // 10. 无论成功失败，都设置loading为false
      setLoading(false);
      console.log('订单处理完成');
    }
  };

  // 重置表单
  useEffect(() => {
    form.resetFields();
    setQuantityPercentage(0);
  }, [selectedToken, form]);

  const coinSymbol = selectedToken.split('USDT')[0];
  const side = form.getFieldValue('side') || 'BUY';

  return (
    <>
      {/* 交易对和价格 */}
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>{coinSymbol}/USDT</Title>
        <div style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 14, color: '#8c8c8c' }}>最新价格</Text>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: currentPrice > 0 ? '#1976d2' : '#8c8c8c' }}>
            {currentPrice > 0 ? currentPrice.toFixed(2) : '--'} USDT
          </div>
        </div>
      </div> */}
      
      {/* 下划线切换按钮 */}
      <div >
        <div style={{ display: 'flex', width: '100%' }}>
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '10px 0',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              color: side === 'BUY' ? '#52c41a' : '#8c8c8c',
              borderBottom: side === 'BUY' ? '3px solid #52c41a' : 'none'
            }}
            onClick={() => handleSideChange('BUY')}
          >
            {t('tradeForm.buy')}
          </div>
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '10px 0',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              color: side === 'SELL' ? '#f5222d' : '#8c8c8c',
              borderBottom: side === 'SELL' ? '3px solid #f5222d' : 'none'
            }}
            onClick={() => handleSideChange('SELL')}
          >
            {t('tradeForm.sell')}
          </div>
        </div>
        
        {/* 余额显示 */}
        <div style={{ textAlign: 'right', marginTop: 8, fontSize: 14 }}>
          {side === 'BUY' ? (
            <>
              <Text style={{ color: '#8c8c8c' }}>{t('tradeForm.available')} USDT: </Text>
              <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{balance.toFixed(2)}</Text>
              {currentPrice > 0 && (
                <>
                  <Text style={{ color: '#8c8c8c', marginLeft: 10 }}>{t('tradeForm.maxCanBuy')}: </Text>
                  <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {(balance / currentPrice).toFixed(6)}
                  </Text>
                  <Text style={{ color: '#8c8c8c' }}> {coinSymbol}</Text>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={{ color: '#8c8c8c' }}>{t('tradeForm.available')} {coinSymbol}: </Text>
              <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{coinBalance.toFixed(6)}</Text>
              {currentPrice > 0 && (
                <>
                  <Text style={{ color: '#8c8c8c', marginLeft: 10 }}>{t('tradeForm.canSellUSD')} </Text>
                  <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {(coinBalance * currentPrice).toFixed(2)}
                  </Text>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          orderType: 'MARKET'
          // 移除side的初始化，避免可能的冲突
        }}
      >
        {/* 订单类型 */}
        {/* <Form.Item label="订单类型" name="orderType" rules={[{ required: true }]}>
          <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
            <Radio.Button value="MARKET" style={{ flex: 1 }}>市价单</Radio.Button>
            <Radio.Button value="LIMIT" style={{ flex: 1 }}>限价单</Radio.Button>
          </Radio.Group>
        </Form.Item> */}

        {/* 价格输入 */}
        {/* <Form.Item
          shouldUpdate={(prevValues, currentValues) => prevValues.orderType !== currentValues.orderType}
        >
          {({ getFieldValue }) => {
            if (getFieldValue('orderType') === 'LIMIT') {
              return (
                <Form.Item label="价格" name="price" rules={[{ required: true }]}>
                  <Input
                    placeholder="请输入价格"
                    type="number"
                    min={0}
                    step="any"
                    style={{ borderRadius: 4, height: 44, fontSize: 16 }}
                  />
                  {currentPrice > 0 && (
                    <Text type="secondary" style={{ marginTop: '4px', display: 'block' }}>
                      当前市场价格: {currentPrice.toFixed(2)} USDT
                    </Text>
                  )}
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item> */}

        {/* 数量输入 */}
        <Form.Item label={t('tradeForm.quantity')} name="quantity" rules={[{ required: true }]}>
          <div>
            <Input 
              placeholder={t('tradeForm.enterQuantity', { coin: coinSymbol })} 
              type="number" 
              min="0.00000001" 
              step="any"
              style={{ borderRadius: 4, height: 44, fontSize: 16 }}
              value={quantity}
              onChange={(e) => {
                form.setFieldValue('quantity', e.target.value);
                handleQuantityChange(e.target.value);
              }}
            />
            
            {/* 快捷百分比按钮 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[25, 50, 75, 100].map((percent) => (
                <Button 
                  key={percent}
                  size="small" 
                  onClick={() => quickSelectQuantity(percent)}
                  style={{
                    flex: 1,
                    backgroundColor: quantityPercentage === percent ? '#1890ff' : 'transparent',
                    borderColor: quantityPercentage === percent ? '#1890ff' : '#d9d9d9',
                    color: quantityPercentage === percent ? 'white' : '#333'
                  }}
                  disabled={loading}
                >
                  {percent}%
                </Button>
              ))}
            </div>
            
            {/* 交易信息 */}
            <div style={{ marginTop: '4px', fontSize: 12, color: '#8c8c8c' }}>
              {t('tradeForm.currentSelect')}: {quantityPercentage}%
            </div>
            
            {form.getFieldValue('quantity') && (
              <div style={{ marginTop: '4px', fontSize: 12, color: '#1890ff' }}>
                {side === 'BUY' ? 
                  `${t('tradeForm.investment')} $${calculateInvestment().toFixed(2)} (${quantityPercentage}% ${t('tradeForm.availableBalance')})` : 
                  t('tradeForm.sellCanGet', { quantity: form.getFieldValue('quantity'), coin: coinSymbol })+`: $${calculateInvestment().toFixed(2)}`
                }
              </div>
            )}
          </div>
        </Form.Item>

        {/* 订单摘要 */}
        <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: 4, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <Text style={{ color: '#8c8c8c' }}>
              {side === 'BUY' ? t('tradeForm.expectedTotal') : t('tradeForm.expectedGet')}
            </Text>
            <Text style={{ fontWeight: 'bold', color: '#1976d2' }}>
              {calculateInvestment().toFixed(2)} USDT
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 4 }}>
            <Text style={{ color: '#8c8c8c' }}>{t('tradeForm.availableBalance')}</Text>
            <Text style={{ color: '#52c41a' }}>
              {side === 'BUY' ? `${balance.toFixed(2)} USDT` : `${coinBalance.toFixed(6)} ${coinSymbol}`}
            </Text>
          </div>
        </div>
        
        {/* 提交按钮 */}
        <Form.Item>
          <Button 
            type="primary" 
            loading={loading}
            onClick={() => {
              console.log("按钮点击时，当前显示的交易方向:", side);
              
              form.validateFields().then(values => {
                console.log('表单验证通过，values:', values);
                // 直接调用handleSubmit，不再传递可能有问题的values.side
                handleSubmit(values);
              }).catch(info => {
                console.log('表单验证失败:', info);
              });
            }}
            style={{
              width: '100%',
              height: 48,
              fontSize: 16,
              fontWeight: 'bold',
              backgroundColor: side === 'BUY' ? '#52c41a' : '#f5222d',
              borderColor: side === 'BUY' ? '#52c41a' : '#f5222d'
            }}
          >
            {loading ? 
              (side === 'BUY' ? t('tradeForm.buying') : t('tradeForm.selling')) : 
              (side === 'BUY' ? t('tradeForm.buyButton', { coin: coinSymbol }) : t('tradeForm.sellButton', { coin: coinSymbol }))
            }
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default TradeForm;