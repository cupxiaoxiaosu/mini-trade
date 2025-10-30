import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Layout, Card, Divider, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { binanceApi } from '@/adaptor/biance';
import OrderBook from './OrderBook';
import { Kline } from './Kline';
import BookTicker from './BookTicker';
import HistoricalOrders, { type HistoricalOrdersRef } from './HistoricalOrders';
import TradeForm from './TradeForm';
import ExchangeHeader from './ExchangeHeader';
import './styles/layout.css';
import './styles/card.css';
import './styles/common.css';

type Token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

const { Content } = Layout;

const Main: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, error, trade, bookTicker } = useBinanceWebSocket();
  const [selectedToken, setSelectedToken] = useState<Token>('ETHUSDT');
  const [usdtBalance, setUsdtBalance] = useState<number>(10000);
  const [selectedCoinBalance, setSelectedCoinBalance] = useState<number>(10);
  const historicalOrdersRef = useRef<HistoricalOrdersRef>(null);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  
  // 获取真实余额数据
  const fetchBalances = useCallback(async () => {
    try {
      const accountInfo = await binanceApi.getAccountInfo();
      const specificSymbols = ['USDT', 'SOL', 'ETH', 'BTC'];
      const balances = binanceApi.extractBalances(accountInfo, specificSymbols);
      
      // 获取USDT余额
      const usdt = balances.find(b => b.asset === 'USDT');
      if (usdt) {
        setUsdtBalance(parseFloat(usdt.free));
      }
      
      // 获取选中币种的余额
      const coinSymbol = selectedToken.split('USDT')[0];
      const coin = balances.find(b => b.asset === coinSymbol);
      if (coin) {
        setSelectedCoinBalance(parseFloat(coin.free));
      }
    } catch (err) {
      console.error('获取余额失败:', err);
      // 保留默认值
    }
  }, [selectedToken, setUsdtBalance, setSelectedCoinBalance]);
  
  // 当选中币种变化时，获取对应币种的余额
  useEffect(() => {
    fetchBalances();
  }, [selectedToken, isConnected]);

  const handleSymbolChange = useCallback((value: string) => {
    setSelectedToken(value.toUpperCase() as Token);
  }, []);

  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleOrderCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchBalances();
  }, [fetchBalances]);

  const coinSymbol = selectedToken.split('USDT')[0];

  return (
    <Layout className="exchange-layout">
      <ExchangeHeader
        selectedToken={selectedToken}
        isConnected={isConnected}
        onSymbolChange={handleSymbolChange}
      />

      <Content className="exchange-content">
        {error && (
          <div className="error-message margin-bottom-16">
            {t('common.error')}: {error.message}
          </div>
        )}

        <div className="home-flex-container">
          {/* 左列：行情数据、K线、订单簿 */}
          <div className="home-flex-column home-flex-left">
            <Card title={t('main.marketData')} className="exchange-card" variant="outlined">
              <BookTicker data={bookTicker[selectedToken]} token={selectedToken} />
            </Card>
            <Card title={t('main.klineChart')} className="exchange-card" variant="outlined">
              <Kline token={selectedToken} />
            </Card>
            <Card title={t('main.orderBook')} className="exchange-card" variant="outlined">
              <OrderBook data={trade[selectedToken]} token={selectedToken} />
            </Card>
          </div>

          {/* 右列：余额、交易表单、历史订单 */}
          <div className="home-flex-column home-flex-right">
            <Card 
              title={`${selectedToken} ${t('main.balance')}`} 
              className="exchange-card" 
              variant="outlined"
            >
              <div className="balance-display">
                <span className="balance-symbol">{coinSymbol}</span>
                <span className="balance-value">{selectedCoinBalance.toFixed(6)}</span>
              </div>
              <Divider className="balance-divider" />
              <div className="balance-display">
                <span className="balance-symbol">USDT</span>
                <span className="balance-value">{usdtBalance.toFixed(2)}</span>
              </div>
            </Card>
            <Card 
              title={t('main.trade')} 
              className="exchange-card" 
              variant="outlined"
              extra={
                <div className="latest-price-container">
                  <div className="latest-price-label">{t('main.latestPrice')}</div>
                  <div className="latest-price-value">
                    {(() => {
                      const tickerData = bookTicker[selectedToken];
                      if (tickerData) {
                        const bid = parseFloat(tickerData.b || '0');
                        const ask = parseFloat(tickerData.a || '0');
                        const price = bid && ask ? (bid + ask) / 2 : (bid || ask || 0);
                        return price ? `${price.toFixed(2)} USDT` : '--';
                      }
                      return '--';
                    })()}
                  </div>
                </div>
              }
            >
              <div className="trade-form-container">
                <TradeForm 
                  selectedToken={selectedToken} 
                  onOrderCreated={handleOrderCreated}
                  balance={usdtBalance}
                  coinBalance={selectedCoinBalance}
                  currentPrice={(() => {
                    const tickerData = bookTicker[selectedToken];
                    if (tickerData) {
                      const bid = parseFloat(tickerData.b || '0');
                      const ask = parseFloat(tickerData.a || '0');
                      if (bid && ask) return (bid + ask) / 2;
                      if (bid) return bid;
                      if (ask) return ask;
                    }
                    return 0;
                  })()}
                />
              </div>
            </Card>
            <Card 
              title={t('main.currentOrders')} 
              className="exchange-card" 
              variant="outlined"
              bodyStyle={{ padding: 0 }}
              extra={
                <div className="card-extra" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>{t('main.recentRecords')}</span>
                  <Button 
                    type="primary" 
                    size="small"
                    loading={ordersLoading}
                    onClick={() => {
                      historicalOrdersRef.current?.refresh();
                    }}
                  >
                    {t('common.refresh')}
                  </Button>
                </div>
              }
            >
              <HistoricalOrders 
                ref={historicalOrdersRef} 
                key={`orders-${refreshKey}`} 
                symbol={selectedToken}
                onLoadingChange={setOrdersLoading}
              />
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default memo(Main);