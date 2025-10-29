import { useState, useRef, useEffect } from 'react';
import { connect, TradeLists, KlineLists, BookTickerLists, WebSocketMessage, WebSocketCallbacks } from '../adaptor/biance/index';






interface UseBinanceWebSocketReturn {
  isConnected: boolean;
  error: Error | null;
  connect: (newSymbol?: string) => void;
  disconnect: () => void;
  trade: TradeLists;
  kline: KlineLists;
  bookTicker: BookTickerLists;
}



const TRADE_STORAGE_KEY = 'binance_trade_data';

// 从 localStorage 读取交易数据
const loadTradeFromStorage = (): TradeLists => {
  try {
    const stored = localStorage.getItem(TRADE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 验证数据格式
      if (parsed && typeof parsed === 'object' && 'ETHUSDT' in parsed && 'BTCUSDT' in parsed && 'SOLUSDT' in parsed) {
        return {
          ETHUSDT: Array.isArray(parsed.ETHUSDT) ? parsed.ETHUSDT : [],
          BTCUSDT: Array.isArray(parsed.BTCUSDT) ? parsed.BTCUSDT : [],
          SOLUSDT: Array.isArray(parsed.SOLUSDT) ? parsed.SOLUSDT : [],
        };
      }
    }
  } catch (error) {
    console.error('读取 localStorage 交易数据失败:', error);
  }
  return {
    ETHUSDT: [],
    BTCUSDT: [],
    SOLUSDT: [],
  };
};

// 保存交易数据到 localStorage
const saveTradeToStorage = (tradeData: TradeLists) => {
  try {
    localStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(tradeData));
  } catch (error) {
    console.error('保存交易数据到 localStorage 失败:', error);
  }
};

export const useBinanceWebSocket = (): UseBinanceWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);

  // 初始化时从 localStorage 读取数据
  const [trade, setTrade] = useState<TradeLists>(() => loadTradeFromStorage());
  
  const [kline, setKline] = useState<KlineLists>({
    ETHUSDT: [],
    BTCUSDT: [],
    SOLUSDT: [],
  });

  const [bookTicker, setBookTicker] = useState<BookTickerLists>({
    ETHUSDT: null,
    BTCUSDT: null,
    SOLUSDT: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 连接WebSocket
  const handleConnect = () => {
    // 如果已经连接，先断开
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const callbacks: WebSocketCallbacks = {
        onmessage(message: WebSocketMessage) {
          // 从data中获取交易数据
          const data = message as any; // 使用类型断言保持原有逻辑
          const symbol = data.s;
          
          if(data.e === 'trade') {
            setTrade(prev => {
              const newList = [...prev[symbol as keyof TradeLists], data];
              const updated = {
                ...prev,
                [symbol]: newList.slice(-20)
              };
              // 保存到 localStorage
              saveTradeToStorage(updated);
              return updated;
            });
          }
          else if(data.e === 'kline') {
            setKline(prev => {
              const newList = [...prev[symbol as keyof KlineLists], data];
              return {
                ...prev,
                [symbol]: newList.slice(-50)
              };
            });
          } else  {
            // 处理bookTicker行情数据
            setBookTicker(prev => ({
              ...prev,
              [symbol]: data
            }));
          } 
        },
      onerror(error: Event) {
        console.error('WebSocket连接错误:', error);
        setError(new Error('WebSocket连接错误'));
        setIsConnected(false);
      },
      onclose() {
        console.log('连接已关闭');
        setIsConnected(false);
      },
      onopen() {
        console.log('连接已建立');
        setIsConnected(true);
        setError(null);
      },
    };

    wsRef.current = connect(callbacks);
  };

  // 断开连接
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      console.log('已主动断开连接');
    }
  };

  // 组件挂载时自动连接
  useEffect(() => {
    handleConnect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    trade,
    kline,
    bookTicker,
    isConnected,
    error,
    connect: handleConnect,
    disconnect
  };
};