import React, { useState, useEffect } from 'react';
import { Select, Button, Badge, Layout, Card, Divider } from 'antd';
import { CaretRightOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { binanceApi } from '@/adaptor/biance';
import OrderBook from './OrderBook';
import { Kline } from './Kline';
import BookTicker from './BookTicker';
import HistoricalOrders from './HistoricalOrders';
import TradeForm from './TradeForm';

type Token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

const { Header, Content } = Layout;

const Main: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, connect, disconnect, error, trade, bookTicker } = useBinanceWebSocket();
  const [selectedToken, setSelectedToken] = useState<Token>('ETHUSDT');
  const [usdtBalance, setUsdtBalance] = useState<number>(10000);
  const [selectedCoinBalance, setSelectedCoinBalance] = useState<number>(10);
  
  // 获取真实余额数据
  const fetchBalances = async () => {
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
  };
  
  // 当选中币种变化时，获取对应币种的余额
  useEffect(() => {
    fetchBalances();
  }, [selectedToken, isConnected]);

  const handleSymbolChange = (value: string) => {
    setSelectedToken(value.toUpperCase() as Token);
  };

  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleOrderCreated = () => {
    setRefreshKey(prev => prev + 1);
    fetchBalances();
  };

  const coinSymbol = selectedToken.split('USDT')[0];

  return (
    <Layout className="exchange-layout">
      <Header className="exchange-header">
        <div className="header-content">
          <div className="header-left">
            <div className="main-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '30px' }}>
              <div className="symbol-selector" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'white' }}>{t('main.tradingPair')}:</span>
                <Select
                  value={selectedToken.toLowerCase()}
                  onChange={handleSymbolChange}
                  style={{ width: 150, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                  options={[
                    { value: 'ethusdt', label: 'ETH/USDT' },
                    { value: 'btcusdt', label: 'BTC/USDT' },
                    { value: 'solusdt', label: 'SOL/USDT' }
                  ]}
                  placeholder={t('main.selectPair')}
                />
              </div>
              
              <div className="connection-status" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Badge 
                  status={isConnected ? 'success' : 'error'} 
                  text={<span style={{ color: 'white' }}>{isConnected ? t('common.connected') : t('common.notConnected')}</span>} 
                />
                <div className="connection-controls">
                  <Button 
                    type="primary" 
                    icon={<CaretRightOutlined />} 
                    onClick={() => connect()} 
                    disabled={isConnected}
                    style={{ marginRight: '8px' }}
                  >
                    {t('common.connect')}
                  </Button>
                  <Button 
                    danger 
                    icon={<CloseOutlined />} 
                    onClick={() => disconnect()} 
                    disabled={!isConnected}
                  >
                    {t('common.disconnect')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Header>

      <Content className="exchange-content">
        {error && (
          <div className="error-message" style={{ marginBottom: '16px' }}>
            {t('common.error')}: {error.message}
          </div>
        )}

        <div className="home-grid">
          <Card title={t('main.marketData')} className="exchange-card grid-row-1-left" variant="outlined">
            <BookTicker data={bookTicker[selectedToken]} token={selectedToken} />
          </Card>
          <Card 
            title={`${selectedToken} ${t('main.balance')}`} 
            className="exchange-card grid-row-1-right" 
            variant="outlined"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>{coinSymbol}</span>
              <span style={{ fontWeight: 600 }}>{selectedCoinBalance.toFixed(6)}</span>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>USDT</span>
              <span style={{ fontWeight: 600 }}>{usdtBalance.toFixed(2)}</span>
            </div>
          </Card>

          {/* 第二行左侧列：K线 + 订单簿 */}
          <div className="grid-row-2-left">
            <Card title={t('main.klineChart')} className="exchange-card" variant="outlined">
              <Kline token={selectedToken} />
            </Card>
            <Card title={t('main.orderBook')} className="exchange-card" variant="outlined">
              <OrderBook data={trade[selectedToken]} token={selectedToken} />
            </Card>
          </div>

          <div className="grid-row-2-right">
            <Card 
              title={t('main.trade')} 
              className="exchange-card" 
              variant="outlined"
              extra={
                <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary, #8c8c8c)' }}>{t('main.latestPrice')}</div>
                  <div style={{ fontWeight: 700 }}>
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
              <div style={{ paddingTop: 4 }}>
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
              extra={<div style={{ fontSize: 12, color: 'var(--text-secondary, #8c8c8c)' }}>{t('main.recentRecords')}</div>}
            >
              <HistoricalOrders key={`orders-${refreshKey}`} symbol={selectedToken} />
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Main;