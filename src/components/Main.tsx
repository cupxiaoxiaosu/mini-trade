import React, { useState } from 'react';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';
type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';
import OrderBook from './OrderBook';
import { Kline } from './Kline';
import BookTicker from './BookTicker';
import Balance from './Balance';
import HistoricalOrders from './HistoricalOrders';
import TradeForm from './TradeForm';
import { Select, Button, Badge, Tabs } from 'antd';
import { CaretRightOutlined, CloseOutlined } from '@ant-design/icons';

import './OrderBook.css';
const Main: React.FC = () => {
  const { isConnected, connect, disconnect, error, trade, kline, bookTicker } = useBinanceWebSocket();
  const [selectedToken, setSelectedToken] = useState<token>('ETHUSDT');

  
  
  const handleSymbolChange = (value: string) => {
    setSelectedToken(value.toUpperCase() as token);
  };

 

  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleOrderCreated = () => {
    // 触发刷新，通过改变key强制重新渲染组件
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="order-book">
      <Balance key={`balance-${refreshKey}`} />  
        <div className="connection-status" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Badge 
            status={isConnected ? 'success' : 'error'} 
            text={isConnected ? '已连接' : '未连接'} 
          />
          <div className="connection-controls">
            <Button 
              type="primary" 
              icon={<CaretRightOutlined />} 
              onClick={() => connect()} 
              disabled={isConnected}
              style={{ marginRight: '8px' }}
            >
              连接
            </Button>
            <Button 
              danger 
              icon={<CloseOutlined />} 
              onClick={() => disconnect()} 
              disabled={!isConnected}
            >
              断开连接
            </Button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            错误: {error.message}
          </div>
        )}

        <div className="symbol-selector" style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>选择交易对:</label>
          <Select
            value={selectedToken.toLowerCase()}
            onChange={handleSymbolChange}
            style={{ width: 200 }}
            options={[
              { value: 'ethusdt', label: 'ETH/USDT' },
              { value: 'btcusdt', label: 'BTC/USDT' },
              { value: 'solusdt', label: 'SOL/USDT' }
            ]}
            placeholder="请选择交易对"
          />
        </div>

        <div className="trade-data">
          <h3>行情数据</h3>
          <BookTicker data={bookTicker[selectedToken]} token={selectedToken} />
        </div>
          
        <div className="trade-data">
          <h3>K线图</h3>
          <Kline data={kline[selectedToken]} token={selectedToken} />
        </div>

        <div className="trade-data">
          <h3>交易数据</h3>
          <OrderBook data={trade[selectedToken]} token={selectedToken} />
        </div>

        <div className="trade-data">
          <HistoricalOrders key={`orders-${refreshKey}`} />
        </div>
        
        <div className="trade-data">
          <TradeForm selectedToken={selectedToken} onOrderCreated={handleOrderCreated} />
        </div>
  
    </div>
  );
};

export default Main;