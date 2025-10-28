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

// 公共请求参数接口
export interface RequestParams {
  timestamp: number;
  [key: string]: any;
}

// 账户信息接口
export interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  balances: Balance[];
}

// 余额信息接口
export interface Balance {
  asset: string;
  free: string;
  locked: string;
}

// 订单信息接口
export interface Order {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: string;
}

// 订单方向枚举
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

// 订单类型枚举
export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
  LIMIT_MAKER = 'LIMIT_MAKER'
}

// 订单有效期枚举
export enum TimeInForce {
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK',
  GTX = 'GTX'
}

// 订单响应类型枚举
export enum NewOrderRespType {
  ACK = 'ACK',
  RESULT = 'RESULT',
  FULL = 'FULL'
}

// 下单参数接口
export interface NewOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  timeInForce?: TimeInForce;
  quantity?: string;
  quoteOrderQty?: string;
  price?: string;
  newClientOrderId?: string;
  stopPrice?: string;
  trailingDelta?: number;
  icebergQty?: string;
  newOrderRespType?: NewOrderRespType;
  recvWindow?: number;
}

export type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

