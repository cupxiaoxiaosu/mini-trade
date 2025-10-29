import { useCallback, useEffect, useRef, useState } from 'react';
import type { 
  WorkerMessage, 
  WorkerResponse, 
  PriceData, 
  BalanceData, 
  PnLCalculationData 
} from './calculationWorker';

interface UseWorkerResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  postMessage: (message: Omit<WorkerMessage, 'id'>) => void;
}

export function useWorker<T = any>(): UseWorkerResult<T> {
  const workerRef = useRef<Worker | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messageIdRef = useRef(0);

  useEffect(() => {
    // 创建 Web Worker
    workerRef.current = new Worker(
      new URL('./calculationWorker.ts', import.meta.url),
      { type: 'module' }
    );

    // 监听 Worker 消息
    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, data: responseData, id } = event.data;
      
      setLoading(false);
      
      if (type === 'ERROR') {
        setError(responseData.message || 'Unknown error');
        setData(null);
      } else {
        setError(null);
        setData(responseData);
      }
    };

    workerRef.current.addEventListener('message', handleMessage);

    // 清理函数
    return () => {
      if (workerRef.current) {
        workerRef.current.removeEventListener('message', handleMessage);
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const postMessage = useCallback((message: Omit<WorkerMessage, 'id'>) => {
    if (workerRef.current) {
      const id = (++messageIdRef.current).toString();
      setLoading(true);
      setError(null);
      
      workerRef.current.postMessage({
        ...message,
        id
      });
    }
  }, []);

  return {
    data,
    error,
    loading,
    postMessage
  };
}

// 专门用于价格聚合的 Hook
export function usePriceAggregation() {
  const worker = useWorker<Record<string, { mid: number; spread: number; timestamp: number }>>();

  const aggregatePrices = useCallback((priceData: PriceData[]) => {
    worker.postMessage({
      type: 'AGGREGATE_PRICES',
      data: priceData
    });
  }, [worker.postMessage]);

  return {
    ...worker,
    aggregatePrices
  };
}

// 专门用于 PnL 计算的 Hook
export function usePnLCalculation() {
  const worker = useWorker<{
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
  }>();

  const calculatePnL = useCallback((data: PnLCalculationData) => {
    worker.postMessage({
      type: 'CALCULATE_PNL',
      data
    });
  }, [worker.postMessage]);

  return {
    ...worker,
    calculatePnL
  };
}

// 专门用于投资计算的 Hook
export function useInvestmentCalculation() {
  const worker = useWorker<{
    investment: number;
    canAfford: boolean;
    maxQuantity: number;
  }>();

  const calculateInvestment = useCallback((params: {
    quantity: number;
    price: number;
    side: 'BUY' | 'SELL';
    balance: number;
    coinBalance: number;
  }) => {
    worker.postMessage({
      type: 'CALCULATE_INVESTMENT',
      data: params
    });
  }, [worker.postMessage]);

  return {
    ...worker,
    calculateInvestment
  };
}

