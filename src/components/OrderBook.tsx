import React, { useState, useEffect } from 'react';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';

// 订单类型定义
interface Order {
  price: string;
  quantity: string;
  total: string;
}

const OrderBook: React.FC = () => {
  const { isConnected, lastPrice, error, connect, disconnect } = useBinanceWebSocket();
  const [asks, setAsks] = useState<Order[]>([]); // 卖单
  const [bids, setBids] = useState<Order[]>([]); // 买单

  // 生成模拟订单数据
  useEffect(() => {
    if (lastPrice) {
      const price = parseFloat(lastPrice);
      
      // 生成卖单（价格高于当前价格）
      const newAsks: Order[] = [];
      for (let i = 1; i <= 5; i++) {
        const askPrice = (price + i * 0.01).toFixed(2);
        const quantity = (Math.random() * 10).toFixed(2);
        const total = (parseFloat(askPrice) * parseFloat(quantity)).toFixed(2);
        newAsks.push({ price: askPrice, quantity, total });
      }
      setAsks(newAsks);

      // 生成买单（价格低于当前价格）
      const newBids: Order[] = [];
      for (let i = 1; i <= 5; i++) {
        const bidPrice = (price - i * 0.01).toFixed(2);
        const quantity = (Math.random() * 10).toFixed(2);
        const total = (parseFloat(bidPrice) * parseFloat(quantity)).toFixed(2);
        newBids.push({ price: bidPrice, quantity, total });
      }
      // 买单按价格降序排列
      newBids.reverse();
      setBids(newBids);
    }
  }, [lastPrice]);

  // 组件挂载时自动连接
  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="order-book">
      <div className="order-book-header">
        <h3>订单簿</h3>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? '已连接' : '未连接'}</span>
        </div>
      </div>
      
      {lastPrice && (
        <div className="last-price">
          <span>最新价格: </span>
          <strong>{lastPrice}</strong>
        </div>
      )}

      {error && (
        <div className="error-message">
          错误: {error.message}
        </div>
      )}

      <div className="order-book-content">
        {/* 卖单区域 */}
        <div className="asks-section">
          <h4>卖单 (Asks)</h4>
          <div className="order-table">
            <div className="table-header">
              <span>价格</span>
              <span>数量</span>
              <span>总额</span>
            </div>
            {asks.map((ask, index) => (
              <div key={`ask-${index}`} className="order-row ask">
                <span>{ask.price}</span>
                <span>{ask.quantity}</span>
                <span>{ask.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 买单区域 */}
        <div className="bids-section">
          <h4>买单 (Bids)</h4>
          <div className="order-table">
            <div className="table-header">
              <span>价格</span>
              <span>数量</span>
              <span>总额</span>
            </div>
            {bids.map((bid, index) => (
              <div key={`bid-${index}`} className="order-row bid">
                <span>{bid.price}</span>
                <span>{bid.quantity}</span>
                <span>{bid.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="controls">
        <button 
          onClick={connect} 
          disabled={isConnected}
        >
          连接
        </button>
        <button 
          onClick={disconnect} 
          disabled={!isConnected}
        >
          断开
        </button>
      </div>
    </div>
  );
};

export default OrderBook;