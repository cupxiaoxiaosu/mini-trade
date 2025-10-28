import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { createOrder, OrderSide, OrderType, TimeInForce, type NewOrderParams } from '@/adaptor/biance';
import './styles/trade.css';
import './styles/common.css';

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
      {/* 下划线切换按钮 */}
      <div>
        <div className="trade-tabs">
          <div
            className={`trade-tab trade-tab-buy ${side === 'BUY' ? 'active' : ''}`}
            onClick={() => handleSideChange('BUY')}
          >
            {t('tradeForm.buy')}
          </div>
          <div
            className={`trade-tab trade-tab-sell ${side === 'SELL' ? 'active' : ''}`}
            onClick={() => handleSideChange('SELL')}
          >
            {t('tradeForm.sell')}
          </div>
        </div>
        
        {/* 余额显示 */}
        <div className="balance-info">
          {side === 'BUY' ? (
            <>
              <Text className="text-secondary">{t('tradeForm.available')} USDT: </Text>
              <Text className="text-success text-bold">{balance.toFixed(2)}</Text>
              {currentPrice > 0 && (
                <>
                  <Text className="text-secondary margin-left-10">{t('tradeForm.maxCanBuy')}: </Text>
                  <Text className="text-primary text-bold">
                    {(balance / currentPrice).toFixed(6)}
                  </Text>
                  <Text className="text-secondary"> {coinSymbol}</Text>
                </>
              )}
            </>
          ) : (
            <>
              <Text className="text-secondary">{t('tradeForm.available')} {coinSymbol}: </Text>
              <Text className="text-success text-bold">{coinBalance.toFixed(6)}</Text>
              {currentPrice > 0 && (
                <>
                  <Text className="text-secondary margin-left-10">{t('tradeForm.canSellUSD')} </Text>
                  <Text className="text-primary text-bold">
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
        {/* 数量输入 */}
        <Form.Item label={t('tradeForm.quantity')} name="quantity" rules={[{ required: true }]}>
          <div>
            <Input 
              placeholder={t('tradeForm.enterQuantity', { coin: coinSymbol })} 
              type="number" 
              min="0.00000001" 
              step="any"
              className="border-radius-4 height-44 font-size-16"
              value={quantity}
              onChange={(e) => {
                form.setFieldValue('quantity', e.target.value);
                handleQuantityChange(e.target.value);
              }}
            />
            
            {/* 快捷百分比按钮 */}
            <div className="quick-buttons">
              {[25, 50, 75, 100].map((percent) => (
                <Button 
                  key={percent}
                  size="small" 
                  onClick={() => quickSelectQuantity(percent)}
                  className={`quick-button ${quantityPercentage === percent ? 'active' : ''}`}
                  disabled={loading}
                >
                  {percent}%
                </Button>
              ))}
            </div>
            
            {/* 交易信息 */}
            <div className="trade-info">
              {t('tradeForm.currentSelect')}: {quantityPercentage}%
            </div>
            
            {form.getFieldValue('quantity') && (
              <div className="trade-info-highlight">
                {side === 'BUY' ? 
                  `${t('tradeForm.investment')} $${calculateInvestment().toFixed(2)} (${quantityPercentage}% ${t('tradeForm.availableBalance')})` : 
                  t('tradeForm.sellCanGet', { quantity: form.getFieldValue('quantity'), coin: coinSymbol })+`: $${calculateInvestment().toFixed(2)}`
                }
              </div>
            )}
          </div>
        </Form.Item>

        {/* 订单摘要 */}
        <div className="order-summary">
          <div className="order-summary-row">
            <Text className="text-secondary">
              {side === 'BUY' ? t('tradeForm.expectedTotal') : t('tradeForm.expectedGet')}
            </Text>
            <Text className="text-primary text-bold">
              {calculateInvestment().toFixed(2)} USDT
            </Text>
          </div>
          <div className="order-summary-row">
            <Text className="text-secondary">{t('tradeForm.availableBalance')}</Text>
            <Text className="text-success">
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
            className={`submit-button ${side === 'BUY' ? 'submit-button-buy' : 'submit-button-sell'}`}
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