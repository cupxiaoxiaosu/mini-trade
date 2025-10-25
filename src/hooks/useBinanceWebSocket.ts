import React, { useState, useRef, useCallback } from 'react';

interface UseBinanceWebSocketOptions {
  symbol?: string;
  url?: string;
}

interface UseBinanceWebSocketReturn {
  isConnected: boolean;
  lastPrice: string | null;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

export const useBinanceWebSocket = ({
  symbol = 'ethusdt',
  url
}: UseBinanceWebSocketOptions = {}): UseBinanceWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPrice, setLastPrice] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 使用与binance-ws.js相同的URL配置
  const wsUrl = url || `wss://stream.testnet.binance.vision/ws/${symbol}@trade`;

  // 连接WebSocket - 严格按照binance-ws.js的逻辑实现
  const connect = useCallback(() => {
    try {
      // 重置错误状态
      setError(null);
      
      // 如果已经连接，先断开
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log(`正在连接到 Binance 测试网 - ${symbol.toUpperCase()}`);

      // 创建新的WebSocket连接
      wsRef.current = new WebSocket(wsUrl);

      // onopen事件处理 - 与binance-ws.js保持一致
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log(`成功连接到 Binance 测试网 - ${symbol.toUpperCase()}`);

        // 发送订阅消息 - 与binance-ws.js中的订阅逻辑完全一致
        const subscribeMessage = {
          method: 'SUBSCRIBE',
          params: [`${symbol}@trade`],
          id: 1
        };
        wsRef.current?.send(JSON.stringify(subscribeMessage));
      };

      // onmessage事件处理 - 按照binance-ws.js的方式处理
      wsRef.current.onmessage = (event) => {
        try {
          // 解析消息，不强制类型转换
          const message = JSON.parse(event.data);
          
          // 处理订阅确认消息
          if (message.id && message.result === null) {
            console.log(`成功订阅 ${symbol.toUpperCase()}@trade 流`);
            return;
          }
          
          // 更新最新价格 - 只要消息包含价格字段就更新
          if (message.p) {
            setLastPrice(message.p);
          }
        } catch (parseError) {
          console.error('解析消息失败:', parseError);
          // 不设置错误状态，避免因格式问题中断正常流程
        }
      };

      // onerror事件处理
      wsRef.current.onerror = (wsError) => {
        const errorObj = wsError instanceof Error ? wsError : new Error('WebSocket连接错误');
        console.error('WebSocket错误:', errorObj);
        setError(errorObj);
        // 错误时设置断开连接状态
        setIsConnected(false);
      };

      // onclose事件处理
      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log(`连接已关闭: ${event.code} - ${event.reason || '无原因'}`);
      };
    } catch (connectError) {
      const errorObj = connectError instanceof Error ? connectError : new Error(String(connectError));
      console.error('连接初始化失败:', errorObj);
      setError(errorObj);
      setIsConnected(false);
    }
  }, [symbol, wsUrl]);

  // 断开连接 - 严格按照binance-ws.js的逻辑
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      console.log('已主动断开连接');
    }
  }, []);

  // 组件卸载时断开连接
  React.useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastPrice,
    error,
    connect,
    disconnect
  };
};