import React, { useState, useEffect } from 'react';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';
type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';
import OrderBook from './OrderBook';
import { Kline } from './Kline';
import BookTicker from './BookTicker';
import Balance from './Balance';
import HistoricalOrders from './HistoricalOrders';
import TradeForm from './TradeForm';
import { Select, Button, Badge, Tabs, Row, Col, Layout, Card, Typography } from 'antd';
import { CaretRightOutlined, CloseOutlined, BarChartOutlined, WalletOutlined, FileTextOutlined } from '@ant-design/icons';
import { binanceApi } from '../adaptor/biance/api';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const Main: React.FC = () => {
  const { isConnected, connect, disconnect, error, trade, kline, bookTicker } = useBinanceWebSocket();
  const [selectedToken, setSelectedToken] = useState<token>('ETHUSDT');
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
    setSelectedToken(value.toUpperCase() as token);
  };

 

  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleOrderCreated = () => {
    // 触发刷新，通过改变key强制重新渲染组件
    setRefreshKey(prev => prev + 1);
    // 订单创建后刷新余额数据
    fetchBalances();
  };

  return (
    <Layout className="exchange-layout">
      {/* 顶部导航 */}
      <Header className="exchange-header">
        <div className="header-content">
          <div className="header-left">
            <div className="main-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '30px' }}>
              <div className="symbol-selector" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'white' }}>交易对:</span>
                <Select
                  value={selectedToken.toLowerCase()}
                  onChange={handleSymbolChange}
                  style={{ width: 150, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                  options={[
                    { value: 'ethusdt', label: 'ETH/USDT' },
                    { value: 'btcusdt', label: 'BTC/USDT' },
                    { value: 'solusdt', label: 'SOL/USDT' }
                  ]}
                  placeholder="请选择交易对"
                  styles={{
                    popup: {
                      root: {
                        backgroundColor: '#1e1e1e',
                        borderColor: '#333'
                      }
                    }
                  }}
                />
              </div>
              
              <div className="connection-status" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Badge 
                  status={isConnected ? 'success' : 'error'} 
                  text={<span style={{ color: 'white' }}>{isConnected ? '已连接' : '未连接'}</span>} 
                />
                <div className="connection-controls">
                  <Button 
                    type="primary" 
                    icon={<CaretRightOutlined />} 
                    onClick={() => connect()} 
                    disabled={isConnected}
                    style={{ marginRight: '8px' }}
                  >
                    连接
                  </Button>
                  <Button 
                    danger 
                    icon={<CloseOutlined />} 
                    onClick={() => disconnect()} 
                    disabled={!isConnected}
                  >
                    断开连接
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
            错误: {error.message}
          </div>
        )}
        
        <Tabs
          className="exchange-tabs"
          defaultActiveKey="trade"
          items={[
            {
              key: 'trade',
              label: <span><BarChartOutlined /> 交易</span>,
              children: (
                <div className="trade-page">
                  <Row gutter={[16, 16]}>
                    {/* 左侧订单簿 */}
                      <Col xs={24} lg={8}>
                        <OrderBook data={trade[selectedToken]} token={selectedToken} />

                      </Col>
                       
                      {/* 中间K线和行情 */}
                      <Col xs={24} lg={16}>
                        <Card title="行情数据" className="exchange-card"      variant="outlined">
                            <BookTicker data={bookTicker[selectedToken]} token={selectedToken} />
                          </Card>
                        <Card title="K线图" className="exchange-card" variant="outlined" style={{ marginTop: '16px' }}>
                          <Kline data={kline[selectedToken]} token={selectedToken} />
                        </Card>
                    
                      </Col>
                  </Row>
                  

                </div>
              ),
            },
            {
              key: 'orders',
              label: <span><FileTextOutlined /> 订单</span>,
              children: (
                  <div className="orders-page">
                    <Card className="exchange-card" variant="outlined">
                      <HistoricalOrders key={`orders-${refreshKey}`} />
                    </Card>
                </div>
              ),
            },
            {key: 'funds',
              label: <span><WalletOutlined /> 资金</span>,
              children: (
                <div className="funds-page">
                  <Card className="exchange-card" variant="outlined">
                    <Balance key={`balance-${refreshKey}`} />
                  </Card>
                  <Card className="exchange-card" variant="outlined" style={{ marginTop: '16px' }}>
                    <TradeForm 
                      selectedToken={selectedToken} 
                      onOrderCreated={handleOrderCreated}
                      balance={usdtBalance}
                      coinBalance={selectedCoinBalance}
                    />
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Content>
    </Layout>
  );
};

export default Main;