import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

type Token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

interface KlineProps {
  token: Token;
}

export const Kline: React.FC<KlineProps> = ({ token }) => {
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