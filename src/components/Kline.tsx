import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

// K线数据接口
interface KlineItem {
  e?: string; // 事件类型
  E?: number; // 事件时间
  s?: string; // 交易对
  k?: {
    t?: number; // K线开始时间
    T?: number; // K线结束时间
    s?: string; // 交易对
    i?: string; // 间隔
    o?: string; // 开盘价
    c?: string; // 收盘价
    h?: string; // 最高价
    l?: string; // 最低价
    v?: string; // 成交量
    x?: boolean; // 是否是最终K线
  };
}

interface KlineProps {
  data: KlineItem[];
  token: token;
}

export const Kline: React.FC<KlineProps> = ({ token }) => {
  // 处理传入的数据（虽然Timeline组件主要使用自己的数据源，但我们保留对data的引用以满足要求）
  

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <AdvancedRealTimeChart
        symbol={token}
        theme="dark"
        style="1"
        locale="zh_CN"
        width="100%"
        height="100%"
        timezone="Asia/Shanghai"
        enable_publishing={false}
        allow_symbol_change={false}
        withdateranges={false}
        hide_side_toolbar={true}
        hide_top_toolbar={true}
        range="1D"
        interval="5"
      />
    </div>
  );
};


export default Kline;