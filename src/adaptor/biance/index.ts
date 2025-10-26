// 交易数据接口
export interface TradeData {
  e: string;  // 事件类型
  E: number;  // 事件时间戳
  s: string;  // 交易对
  t: number;  // 交易ID
  p: string;  // 价格
  q: string;  // 交易量
  b: number;  // 买单ID
  a: number;  // 卖单ID
  T: number;  // 交易时间戳
  m: boolean; // 是否是卖家
  M: boolean; // 是否是最佳价格匹配
}

// K线数据接口
export interface KlineData {
  e: string;  // 事件类型
  E: number;  // 事件时间戳
  s: string;  // 交易对
  k: {
    t: number;  // K线开始时间
    T: number;  // K线结束时间
    s: string;  // 交易对
    i: string;  // 间隔
    f: number;  // 第一笔成交ID
    L: number;  // 最后一笔成交ID
    o: string;  // 开盘价
    c: string;  // 收盘价
    h: string;  // 最高价
    l: string;  // 最低价
    v: string;  // 成交量
    n: number;  // 成交笔数
    x: boolean; // 是否是K线收盘
    q: string;  // 成交额
    V: string;  // 主动买入成交量
    Q: string;  // 主动买入成交额
    B: string;  // 忽略该字段
  };
}

export interface TradeLists {
  ETHUSDT: TradeData[];
  BTCUSDT: TradeData[];
  SOLUSDT: TradeData[];
}

// K线数据接口
export interface KlineLists {
  ETHUSDT: KlineData[];
  BTCUSDT: KlineData[];
  SOLUSDT: KlineData[];
}

// BookTicker数据接口（行情数据）
export interface BookTickerData {
  e: string;  
  u: number; 
  s: string;  
  b: string; 
  B: string;  
  a: string;
  A: string;  

}

// BookTicker列表接口
export interface BookTickerLists {
  ETHUSDT: BookTickerData | null;
  BTCUSDT: BookTickerData | null;
  SOLUSDT: BookTickerData | null;
}

// WebSocket消息接口
export interface WebSocketMessage {
  stream: string;
  data: TradeData;
}

// WebSocket回调接口
export interface WebSocketCallbacks {
  onmessage: (message: WebSocketMessage) => void;
  onerror: (error: Event) => void;
  onclose: () => void;
  onopen: () => void;
}
const streams = [
  'ethusdt@trade',
  'btcusdt@trade',
  'solusdt@trade',
  'ethusdt@kline_1s',
  'btcusdt@kline_1s',
  'solusdt@kline_1s',
  'ethusdt@bookTicker',
  'btcusdt@bookTicker',
  'solusdt@bookTicker',
  'eth@outboundAccountPosition',
  'btc@outboundAccountPosition',
  'sol@outboundAccountPosition',
]
export type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';
const TESTNET = 'wss://stream.testnet.binance.vision/ws'
const MAINNET = 'wss://stream.binance.com:9443/ws'
// 连接WebSocket的函数
export function connect(callbacks: WebSocketCallbacks): WebSocket {
  const ws = new WebSocket(`${TESTNET}/${streams.join('/')}`);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      callbacks.onmessage(data);
    } catch (error) {
      console.error('解析消息失败:', error);
    }
  };
  
  ws.onerror = (error) => {
    callbacks.onerror(error);
  };
  
  ws.onclose = () => {
    callbacks.onclose();
  };
  
  ws.onopen = () => {
    callbacks.onopen();
  };
  
  return ws;
}

// 导出API功能
export * from './api';