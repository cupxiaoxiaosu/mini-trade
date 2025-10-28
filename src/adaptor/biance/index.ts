export * from './types';

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
