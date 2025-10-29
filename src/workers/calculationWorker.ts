// Web Worker 用于处理计算密集的逻辑
// 价格聚合、PnL 计算等

export interface PriceData {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: number;
}

export interface BalanceData {
  asset: string;
  free: string;
  locked: string;
}

export interface PnLCalculationData {
  balances: BalanceData[];
  currentPrices: Record<string, number>;
  previousPrices?: Record<string, number>;
}

export interface WorkerMessage {
  type: 'CALCULATE_PNL' | 'AGGREGATE_PRICES' | 'CALCULATE_INVESTMENT';
  data: any;
  id: string;
}

export interface WorkerResponse {
  type: 'PNL_RESULT' | 'PRICE_RESULT' | 'INVESTMENT_RESULT' | 'ERROR';
  data: any;
  id: string;
}

// 计算价格聚合
function aggregatePrices(priceData: PriceData[]): Record<string, { mid: number; spread: number; timestamp: number }> {
  const result: Record<string, { mid: number; spread: number; timestamp: number }> = {};
  
  priceData.forEach(data => {
    const mid = (data.bid + data.ask) / 2;
    const spread = data.ask - data.bid;
    
    result[data.symbol] = {
      mid,
      spread,
      timestamp: data.timestamp
    };
  });
  
  return result;
}

// 计算 PnL
function calculatePnL(data: PnLCalculationData): {
  totalAsset: number;
  totalPnL: number;
  pnLRate: number;
  assetPnL: Array<{
    asset: string;
    balance: number;
    currentValue: number;
    pnl: number;
    pnlRate: number;
  }>;
} {
  const { balances, currentPrices, previousPrices } = data;
  
  let totalAsset = 0;
  let totalPnL = 0;
  const assetPnL: Array<{
    asset: string;
    balance: number;
    currentValue: number;
    pnl: number;
    pnlRate: number;
  }> = [];
  
  balances.forEach(balance => {
    const free = parseFloat(balance.free);
    const locked = parseFloat(balance.locked);
    const totalBalance = free + locked;
    
    if (totalBalance > 0) {
      const currentPrice = currentPrices[balance.asset] || 0;
      const currentValue = totalBalance * currentPrice;
      
      let pnl = 0;
      let pnlRate = 0;
      
      if (previousPrices && previousPrices[balance.asset]) {
        const previousPrice = previousPrices[balance.asset];
        const previousValue = totalBalance * previousPrice;
        pnl = currentValue - previousValue;
        pnlRate = previousValue > 0 ? (pnl / previousValue) * 100 : 0;
      }
      
      totalAsset += currentValue;
      totalPnL += pnl;
      
      assetPnL.push({
        asset: balance.asset,
        balance: totalBalance,
        currentValue,
        pnl,
        pnlRate
      });
    }
  });
  
  const pnLRate = totalAsset > 0 ? (totalPnL / totalAsset) * 100 : 0;
  
  return {
    totalAsset,
    totalPnL,
    pnLRate,
    assetPnL
  };
}

// 计算投资金额
function calculateInvestment(params: {
  quantity: number;
  price: number;
  side: 'BUY' | 'SELL';
  balance: number;
  coinBalance: number;
}): {
  investment: number;
  canAfford: boolean;
  maxQuantity: number;
} {
  const { quantity, price, side, balance, coinBalance } = params;
  
  const investment = quantity * price;
  let canAfford = false;
  let maxQuantity = 0;
  
  if (side === 'BUY') {
    canAfford = investment <= balance;
    maxQuantity = balance / price;
  } else {
    canAfford = quantity <= coinBalance;
    maxQuantity = coinBalance;
  }
  
  return {
    investment,
    canAfford,
    maxQuantity
  };
}

// 监听主线程消息
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data, id } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'AGGREGATE_PRICES':
        result = aggregatePrices(data);
        self.postMessage({
          type: 'PRICE_RESULT',
          data: result,
          id
        } as WorkerResponse);
        break;
        
      case 'CALCULATE_PNL':
        result = calculatePnL(data);
        self.postMessage({
          type: 'PNL_RESULT',
          data: result,
          id
        } as WorkerResponse);
        break;
        
      case 'CALCULATE_INVESTMENT':
        result = calculateInvestment(data);
        self.postMessage({
          type: 'INVESTMENT_RESULT',
          data: result,
          id
        } as WorkerResponse);
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      id
    } as WorkerResponse);
  }
});

// 导出类型供主线程使用
export type { WorkerMessage, WorkerResponse, PriceData, BalanceData, PnLCalculationData };

