import axios, { AxiosInstance } from 'axios';
import { API_KEY, API_SECRET } from './config';
import querystring from 'querystring';

// API基础配置
const TESTNET_BASE_URL = 'http://localhost:5174'; // 使用本地开发服务器地址
const API_VERSION = 'v3';

// 公共请求参数接口
interface RequestParams {
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

/**
 * Binance API客户端类
 * 封装公共请求逻辑和API方法
 */
class BinanceApiClient {
  private apiKey: string;
  private apiSecret: string;
  private baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor(apiKey: string, apiSecret: string, baseURL: string = TESTNET_BASE_URL) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseURL = baseURL;
    
    this.axiosInstance = axios.create({
      baseURL: `${baseURL}/api/${API_VERSION}`, // 通过本地代理访问币安API
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 生成HMAC-SHA256签名
   * 使用浏览器的Web Crypto API
   */
  private async generateSignature(queryString: string): Promise<string> {
    // 转换密钥和消息为ArrayBuffer
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.apiSecret);
    const messageData = encoder.encode(queryString);
    
    // 导入密钥
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
    
    // 生成HMAC签名
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      messageData
    );
    
    // 将ArrayBuffer转换为十六进制字符串
    return Array.from(new Uint8Array(signatureBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 将对象转换为查询字符串
   */
  private objectToQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * 发送认证请求（GET）
   */
  private async authGetRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // 添加时间戳
    const requestParams: RequestParams = {
      ...params,
      timestamp: Date.now()
    };

    // 生成查询字符串和签名
    const queryString = this.objectToQueryString(requestParams);
    const signature = await this.generateSignature(queryString);
    const url = `${endpoint}?${queryString}&signature=${signature}`;

    try {
      const response = await this.axiosInstance.get<T>(url);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API错误: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('网络错误: 无法连接到服务器');
      } else {
        throw new Error(`请求错误: ${error.message}`);
      }
    }
  }

  /**
   * 发送认证请求（POST）
   */
  private async authPostRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // 添加时间戳
    const requestParams: RequestParams = {
      ...params,
      timestamp: Date.now()
    };

    // 生成查询字符串和签名
    const queryString = this.objectToQueryString(requestParams);
    const signature = await this.generateSignature(queryString);
    
    // 将参数和签名直接放在URL查询字符串中
    const url = `${endpoint}?${queryString}&signature=${signature}`;

    try {
      const response = await this.axiosInstance.post<T>(url);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API错误: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('网络错误: 无法连接到服务器');
      } else {
        throw new Error(`请求错误: ${error.message}`);
      }
    }
  }

  /**
   * 发送认证请求（DELETE）
   */
  private async authDeleteRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // 添加时间戳
    const requestParams: RequestParams = {
      ...params,
      timestamp: Date.now()
    };

    // 生成查询字符串和签名
    const queryString = querystring.stringify(requestParams);
    const signature = this.generateSignature(queryString);
    const url = `${endpoint}?${queryString}&signature=${signature}`;

    try {
      const response = await this.axiosInstance.delete<T>(url);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API错误: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('网络错误: 无法连接到服务器');
      } else {
        throw new Error(`请求错误: ${error.message}`);
      }
    }
  }

  /**
   * 获取账户信息和余额
   */
  async getAccountInfo(): Promise<AccountInfo> {
    return this.authGetRequest<AccountInfo>('/account');
  }

  /**
   * 获取当前挂单
   */
  async getOpenOrders(symbol?: string): Promise<Order[]> {
    const params: Record<string, string> = {};
    if (symbol) {
      params.symbol = symbol;
    }
    return this.authGetRequest<Order[]>('/openOrders', params);
  }

  /**
   * 获取历史订单
   */
  async getHistoricalOrders(symbol: string, options?: {
    limit?: number;
    orderId?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<Order[]> {
    const params: Record<string, any> = { symbol };
    
    if (options) {
      if (options.limit) params.limit = options.limit;
      if (options.orderId) params.orderId = options.orderId;
      if (options.startTime) params.startTime = options.startTime;
      if (options.endTime) params.endTime = options.endTime;
    }
    
    return this.authGetRequest<Order[]>('/allOrders', params);
  }

  /**
   * 下单
   */
  async createOrder(params: NewOrderParams): Promise<Order> {
    return this.authPostRequest<Order>('/order', params);
  }

  /**
   * 取消订单
   */
  async cancelOrder(symbol: string, orderId?: number, origClientOrderId?: string): Promise<any> {
    const params: Record<string, any> = { symbol };
    if (orderId !== undefined) params.orderId = orderId;
    if (origClientOrderId) params.origClientOrderId = origClientOrderId;
    return this.authDeleteRequest<any>('/order', params);
  }

  /**
   * 取消全部订单
   */
  async cancelAllOrders(symbol: string): Promise<any[]> {
    return this.authDeleteRequest<any[]>('/openOrders', { symbol });
  }

  /**
   * 查询订单
   */
  async getOrder(symbol: string, orderId?: number, origClientOrderId?: string): Promise<Order> {
    const params: Record<string, any> = { symbol };
    if (orderId !== undefined) params.orderId = orderId;
    if (origClientOrderId) params.origClientOrderId = origClientOrderId;
    return this.authGetRequest<Order>('/order', params);
  }

  /**
   * 提取加密货币的余额
   * 如果提供symbols参数，则只返回指定币种的余额
   * 如果不提供symbols参数，则返回所有有余额的币种
   */
  extractBalances(accountData: AccountInfo, symbols?: string[]): Balance[] {
    // 如果提供了symbols参数，只返回指定币种的余额
    if (symbols) {
      return symbols.map(symbol => {
        const balance = accountData.balances.find(b => b.asset === symbol);
        if (balance) {
          return balance;
        } else {
          // 返回默认值
          return { asset: symbol, free: '0', locked: '0' };
        }
      });
    }
    
    // 如果没有提供symbols参数，返回所有余额
    return accountData.balances;
  }
}

// 创建并导出API客户端实例
export const binanceApi = new BinanceApiClient(API_KEY, API_SECRET);

// 导出便捷方法
export const getAccountBalance = binanceApi.getAccountInfo.bind(binanceApi);
export const getOpenOrders = binanceApi.getOpenOrders.bind(binanceApi);
export const getHistoricalOrders = binanceApi.getHistoricalOrders.bind(binanceApi);
export const extractBalances = async (symbols?: string[]): Promise<Balance[]> => {
  const accountData = await binanceApi.getAccountInfo();
  return binanceApi.extractBalances(accountData, symbols);
};
export const createOrder = binanceApi.createOrder.bind(binanceApi);
export const cancelOrder = binanceApi.cancelOrder.bind(binanceApi);
export const cancelAllOrders = binanceApi.cancelAllOrders.bind(binanceApi);
export const getOrder = binanceApi.getOrder.bind(binanceApi);