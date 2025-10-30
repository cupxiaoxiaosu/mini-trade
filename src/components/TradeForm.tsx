import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, message, Typography, Radio, App } from 'antd';
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
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [price, setPrice] = useState(0);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  
  // 使用 Web Worker 进行投资计算
  const { data: investmentData, calculateInvestment: calculateInvestmentWorker } = useInvestmentCalculation();
  // 使用 useMemo 缓存 quantityPercentage 计算，避免重复渲染
  // quantityPercentage 表示当前数量占可用余额的百分比（0-100）
  const quantityPercentage = useMemo(() => {
    if (quantity <= 0) return 0;
    if (side === 'BUY') {
      if (currentPrice > 0 && balance > 0) {
        const maxBuyable = balance / currentPrice;
        return maxBuyable > 0 ? Math.round((quantity / maxBuyable) * 100) : 0;
      }
      return 0;
    } else {
      return coinBalance > 0 ? Math.round((quantity / coinBalance) * 100) : 0;
    }
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
      
      // 6. 处理成功响应 - 使用 notification 显示详细信息
      notification.success({
        message: t('tradeForm.orderCreated'),
        description: (
          <div style={{ lineHeight: '1.8' }}>
            <div style={{ marginBottom: '4px' }}><strong>{t('historicalOrders.orderId')}:</strong> {orderResult?.orderId || 'N/A'}</div>
            <div style={{ marginBottom: '4px' }}><strong>{t('historicalOrders.symbol')}:</strong> {selectedToken}</div>
            <div style={{ marginBottom: '4px' }}><strong>{t('historicalOrders.direction')}:</strong> {side === 'BUY' ? t('orderBook.buy') : t('orderBook.sell')}</div>
            <div style={{ marginBottom: '4px' }}><strong>{t('historicalOrders.type')}:</strong> {orderType === 'MARKET' ? t('historicalOrders.marketOrder') : t('historicalOrders.limitOrder')}</div>
            <div style={{ marginBottom: '4px' }}><strong>{t('historicalOrders.price')}:</strong> {orderPrice.toFixed(4)} USDT</div>
            <div><strong>{t('historicalOrders.quantity')}:</strong> {quantity.toFixed(4)} {coinSymbol}</div>
          </div>
        ),
        duration: 5,
        placement: 'topRight',
      });
      
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
  }, [selectedToken]);

  const coinSymbol = selectedToken.split('USDT')[0];

  console.log('trade form render')
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
      </div>
      
      <div style={{ marginTop: '16px' }}>
        {/* 订单类型选择 */}
        <div style={{ marginBottom: '20px' }}>
        
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
        </div>

        {/* 价格输入 - 仅限价单显示 */}
        {orderType === 'LIMIT' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {t('tradeForm.price')}
            </div>
            <Input
              placeholder={t('tradeForm.enterPrice')}
              type="number"
              min="0.00000001"
              step="any"
              className="border-radius-4 height-44 font-size-16"
              suffix="USDT"
              value={price}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setPrice(value);
                } else if (e.target.value === '') {
                  setPrice(0);
                }
              }}
            />
            {currentPrice > 0 && (
              <div className="price-hint">
                <Text className="text-secondary font-size-12">
                  {t('tradeForm.currentPrice')}: {currentPrice.toFixed(2)} USDT
                </Text>
              </div>
            )}
          </div>
        )}

        {/* 数量输入 */}
        <div style={{ marginBottom: '20px' }}>
          
          <div>
            <Input 
              placeholder={t('tradeForm.enterQuantity', { coin: coinSymbol })} 
              type="number" 
              min="0.00000001" 
              step="any"
              className="border-radius-4 height-44 font-size-16"
              value={quantity}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setQuantity(value);
                } else if (e.target.value === '') {
                  setQuantity(0);
                }
              }}
            />
            
            {/* 快捷百分比按钮 */}
            <div className="quick-buttons">
              {[25, 50, 75, 100].map((percent) => (
                <Button 
                  key={percent}
                  size="small" 
                  onClick={() => {
                    if (side === 'BUY' && currentPrice > 0) {
                      // 买入：计算可用余额可以买入的数量，然后按百分比
                      const maxBuyable = balance / currentPrice;
                      setQuantity(parseFloat((maxBuyable * (percent / 100)).toFixed(4)));
                    } else if (side === 'SELL') {
                      // 卖出：按币种余额的百分比
                      setQuantity(parseFloat((coinBalance * (percent / 100)).toFixed(4)));
                    }
                  }}
                  className={`quick-button ${quantityPercentage === percent ? 'active' : ''}`}
                  disabled={loading}
                >
                  {percent}%
                </Button>
              ))}
            </div>
            
       
        
          </div>
        </div>

        {/* 订单摘要 */}
        <div className="order-summary">
          <div className="order-summary-row">
            <Text className="text-secondary">
              {side === 'BUY' ? t('tradeForm.expectedTotal') : t('tradeForm.expectedGet')}
            </Text>
            <Text className="text-primary text-bold">
              {(() => {
                if (investmentData && investmentData.investment > 0) {
                  return `${investmentData.investment.toFixed(2)} USDT`;
                }
                // 备用计算：如果 investmentData 不可用，直接计算
                if (quantity > 0) {
                  const orderPrice = orderType === 'LIMIT' ? price : currentPrice;
                  if (orderPrice > 0) {
                    const totalPrice = quantity * orderPrice;
                    return `${totalPrice.toFixed(2)} USDT`;
                  }
                }
                return '-- USDT';
              })()}
            </Text>
          </div>
          <div className="order-summary-row">
            <Text className="text-secondary">{t('tradeForm.availableBalance')}</Text>
            <Text className="text-success">
              {side === 'BUY' ? `${balance.toFixed(2)} USDT` : `${coinBalance.toFixed(6)} ${coinSymbol}`}
            </Text>
          </div>
          {currentPrice > 0 && (
            <div className="order-summary-row">
              <Text className="text-secondary">
                {side === 'BUY' ? t('tradeForm.maxCanBuy') : t('tradeForm.canSellUSD')}
              </Text>
              <Text className="text-primary text-bold">
                {side === 'BUY' 
                  ? `${(balance / currentPrice).toFixed(6)} ${coinSymbol}`
                  : `${(coinBalance * currentPrice).toFixed(2)} USDT`
                }
              </Text>
            </div>
          )}
        </div>
        
        {/* 提交按钮 */}
        <div style={{ marginTop: '20px' }}>
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
        </div>
      </div>
    </>
  );
};

// 自定义比较函数，优化组件重渲染
const arePropsEqual = (prevProps: TradeFormProps, nextProps: TradeFormProps): boolean => {
  // 只有当关键属性发生变化时才重渲染
  return prevProps.selectedToken === nextProps.selectedToken &&
         prevProps.onOrderCreated === nextProps.onOrderCreated &&
         prevProps.balance === nextProps.balance &&
         prevProps.coinBalance === nextProps.coinBalance &&
         prevProps.currentPrice === nextProps.currentPrice;
};

export default React.memo(TradeForm, arePropsEqual);