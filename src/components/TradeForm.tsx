import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, message, Typography, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { createOrder, OrderSide, OrderType, TimeInForce, type NewOrderParams } from '@/adaptor/biance';
import { useInvestmentCalculation } from '../hooks/useWorker';
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
  const [quantity, setQuantity] = useState(0);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [price, setPrice] = useState(0);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  
  // 使用 Web Worker 进行投资计算
  const { data: investmentData, loading: investmentLoading, calculateInvestment: calculateInvestmentWorker } = useInvestmentCalculation();
  // 使用 useMemo 缓存 quantity 计算，避免重复渲染
  const quantityPercentage = useMemo(() => {
    return side === 'BUY' ? (balance * quantity / 100) / currentPrice : (coinBalance * quantity / 100);
  }, [side, quantity, balance, currentPrice, coinBalance]);

  // 当数量、价格或交易方向变化时，重新计算投资
  useEffect(() => {
    if (quantity > 0) {
      const orderPrice = orderType === 'LIMIT' ? price : currentPrice;
      if (orderPrice > 0) {
        calculateInvestmentWorker({
          quantity,
          price: orderPrice,
          side,
          balance,
          coinBalance
        });
      }
    }
  }, [quantity, price, orderType, currentPrice, side, balance, coinBalance, calculateInvestmentWorker]);

  
  console.log('quantityPercentage', balance, coinBalance,balance * quantity / 100 , currentPrice);

  // 提交订单
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      console.log('开始处理订单提交...');
      
      // 1. 获取和验证交易参数
      const orderPrice = orderType === 'LIMIT' ? price : currentPrice;
      
      console.log('交易参数:', {
        symbol: selectedToken,
        side,
        quantity: quantity,
        price: orderPrice
      });
      
      // 2. 检查余额是否充足
      if (side === 'BUY') {
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
        type: orderType === 'LIMIT' ? OrderType.LIMIT : OrderType.MARKET,
        quantity: quantity.toString()
      };
      
      // 重要：记录最终发送到API的订单参数
      console.log('最终发送到API的订单参数:', JSON.stringify(orderParams));

      // 4. 添加限价单特有的参数
      if (orderType === 'LIMIT') {
        orderParams.price = price.toString();
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
    setOrderType('MARKET');
  }, [selectedToken, form]);

  const coinSymbol = selectedToken.split('USDT')[0];

  return (
    <>
      {/* 下划线切换按钮 */}
      <div>
        <div className="trade-tabs">
          <div
            className={`trade-tab trade-tab-buy ${side === 'BUY' ? 'active' : ''}`}
            onClick={() => setSide('BUY')}
          >
            {t('tradeForm.buy')}
          </div>
          <div
            className={`trade-tab trade-tab-sell ${side === 'SELL' ? 'active' : ''}`}
            onClick={() => setSide('SELL')}
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
        layout="horizontal"
        initialValues={{
          orderType: 'MARKET'
          // 移除side的初始化，避免可能的冲突
        }}
      >
        {/* 订单类型选择 */}
        <Form.Item label={t('tradeForm.orderType')} name="orderType" rules={[{ required: true }]}>
          <Radio.Group 
            value={orderType} 
            onChange={(e) => setOrderType(e.target.value)}
            className="order-type-group"
          >
            <Radio.Button value="MARKET" className="order-type-button">
              {t('tradeForm.marketOrder')}
            </Radio.Button>
            <Radio.Button value="LIMIT" className="order-type-button">
              {t('tradeForm.limitOrder')}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* 价格输入 - 仅限价单显示 */}
        {orderType === 'LIMIT' && (
          <Form.Item 
            label={t('tradeForm.price')} 
            name="price" 
            rules={[
              { 
                validator: (_, value) => {
                  // 检查空值
                  if (value === undefined || value === null || value === '' || value === ' ') {
                    return Promise.reject(new Error(t('tradeForm.priceRequired')));
                  }
                  // 检查是否为有效数字
                  const numValue = Number(value);
                  if (isNaN(numValue) || numValue <= 0) {
                    return Promise.reject(new Error(t('tradeForm.priceInvalid')));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              placeholder={t('tradeForm.enterPrice')}
              type="number"
              min="0.00000001"
              step="any"
              className="border-radius-4 height-44 font-size-16"
              suffix="USDT"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
            {currentPrice > 0 && (
              <div className="price-hint">
                <Text className="text-secondary font-size-12">
                  {t('tradeForm.currentPrice')}: {currentPrice.toFixed(2)} USDT
                </Text>
              </div>
            )}
          </Form.Item>
        )}

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
                setQuantity(parseFloat(e.target.value));
              }}
            />
            
            {/* 快捷百分比按钮 */}
            <div className="quick-buttons">
              {[25, 50, 75, 100].map((percent) => (
                <Button 
                  key={percent}
                  size="small" 
                  onClick={() => {
                    
                  }}
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
                {investmentLoading ? (
                  <div className="text-secondary">{t('common.loading')}</div>
                ) : investmentData ? (
                  <>
                    {side === 'BUY' ? 
                      `${t('tradeForm.investment')} $${investmentData.investment.toFixed(2)} (${quantityPercentage}% ${t('tradeForm.availableBalance')})` : 
                      t('tradeForm.sellCanGet', { quantity: form.getFieldValue('quantity'), coin: coinSymbol })+`: $${investmentData.investment.toFixed(2)}`
                    }
                    {!investmentData.canAfford && (
                      <div className="text-danger margin-top-4">
                        {side === 'BUY' ? t('tradeForm.insufficientUSDT') : t('tradeForm.insufficientCoin', { coin: coinSymbol })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-secondary">{t('common.noData')}</div>
                )}
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
              {investmentData ? `${investmentData.investment.toFixed(2)} USDT` : '-- USDT'}
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
              handleSubmit()
              
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