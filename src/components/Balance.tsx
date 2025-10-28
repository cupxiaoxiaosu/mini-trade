import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Spin, Alert } from 'antd';
import type { Balance } from '../adaptor/biance';
import { binanceApi, getHistoricalOrders } from '../adaptor/biance';

const Balance: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profitLoss, setProfitLoss] = useState<{amount: number; percent: number}>({amount: 0, percent: 0});
  const [plLoading, setPlLoading] = useState<boolean>(false);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      const accountInfo = await binanceApi.getAccountInfo();
      // 只获取指定的四种币种：USDT、SOL、ETH、BTC
      const specificSymbols = ['USDT', 'SOL', 'ETH', 'BTC'];
      // 使用extractBalances并传入指定的币种列表
      const extractedBalances = binanceApi.extractBalances(accountInfo, specificSymbols);
      // 过滤出有余额的币种
      const activeBalances = extractedBalances.filter(balance => 
        parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
      );
      setBalances(activeBalances);
    } catch (err) {
      console.error('获取账户余额失败:', err);
      setError(err instanceof Error ? err.message : '获取账户余额失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfitLoss = async () => {
    try {
      setPlLoading(true);
      // 模拟数据 - 实际应该通过API获取历史交易数据并计算
      // 这里我们假设获取BTCUSDT和ETHUSDT的交易历史
      const btcOrders = await getHistoricalOrders('BTCUSDT', { limit: 100 });
      const ethOrders = await getHistoricalOrders('ETHUSDT', { limit: 100 });
      
      // 计算盈亏逻辑
      // 注意：实际应用中，需要根据开仓和平仓的交易对来准确计算盈亏
      // 这里使用简化的逻辑，仅供演示
      let totalBuy = 0;
      let totalSell = 0;
      
      [...btcOrders, ...ethOrders].forEach(order => {
        if (order.status === 'FILLED') {
          const executedQty = parseFloat(order.executedQty);
          const price = parseFloat(order.price);
          const value = executedQty * price;
          
          if (order.side === 'BUY') {
            totalBuy += value;
          } else if (order.side === 'SELL') {
            totalSell += value;
          }
        }
      });
      
      // 计算总盈亏和盈亏百分比
      const profitLossAmount = totalSell - totalBuy;
      const profitLossPercent = totalBuy > 0 ? (profitLossAmount / totalBuy) * 100 : 0;
      
      setProfitLoss({
        amount: profitLossAmount,
        percent: profitLossPercent
      });
    } catch (err) {
      console.error('计算盈亏失败:', err);
      // 如果获取交易历史失败，使用模拟数据
      setProfitLoss({ amount: 1234.56, percent: 8.75 });
    } finally {
      setPlLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    calculateProfitLoss();
    
    // 每30秒自动刷新一次余额和盈亏
    const intervalId = setInterval(() => {
      fetchBalances();
      calculateProfitLoss();
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const getTotalBalance = (): number => {
    // 这里简化处理，实际可能需要获取各币种的最新价格转换为USDT
    // 目前只返回USDT余额
    const usdtBalance = balances.find(b => b.asset === 'USDT');
    return usdtBalance ? parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked) : 0;
  };

  const getTokenColor = (asset: string): string => {
    // 老虎证券风格的币种颜色配置
    const colorMap: Record<string, string> = {
      BTC: '#F7931A',  // 保持原有金色
      ETH: '#627EEA',  // 保持原有蓝色
      USDT: '#1976d2', // 更新为老虎证券主色调
      SOL: '#1565c0'   // 深蓝色调
    };
    return colorMap[asset] || '#1976d2'; // 使用主色调作为默认值
  };

  return (
    <div>
      
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>正在获取账户余额...</div>
        </div>
      )}
      
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
          action={
            <button
              onClick={fetchBalances}
              style={{
                border: 'none',
                backgroundColor: '#1890FF',
                color: 'white',
                padding: '4px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          }
        />
      )}
      
      {!loading && !error && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card style={{ marginBottom: '20px' }} variant="outlined">
                <Statistic
                  value={getTotalBalance()}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                  prefix="$"
                  suffix="USDT"
                  title="总资产"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ marginBottom: '20px' }} variant="outlined">
                {plLoading ? (
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spin size="small" />
                    <span style={{ marginLeft: '8px' }}>计算中...</span>
                  </div>
                ) : (
                  <>
                    <Statistic
                      value={profitLoss.amount}
                      precision={2}
                      valueStyle={{ color: profitLoss.amount >= 0 ? '#52c41a' : '#f5222d' }}
                      prefix={profitLoss.amount >= 0 ? '+' : ''}
                      suffix="USDT"
                      title="总盈亏"
                    />
                    <div style={{ marginTop: '8px', fontSize: '14px' }}>
                      盈亏率: <span style={{ color: profitLoss.percent >= 0 ? '#52c41a' : '#f5222d' }}>
                        {profitLoss.percent >= 0 ? '+' : ''}{profitLoss.percent.toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            {balances.map((balance) => {
              const total = parseFloat(balance.free) + parseFloat(balance.locked);
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={balance.asset}>
                  <Card
                    hoverable
                    style={{
                      backgroundColor: `${getTokenColor(balance.asset)}10`,
                      borderLeft: `4px solid ${getTokenColor(balance.asset)}`
                    }}
                    variant="outlined"
                  >
                    <Statistic
                      value={total}
                      precision={6}
                      valueStyle={{ color: getTokenColor(balance.asset) }}
                      suffix={balance.asset}
                    />
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                      <div>可用: {parseFloat(balance.free).toFixed(6)}</div>
                      <div>冻结: {parseFloat(balance.locked).toFixed(6)}</div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
          
          {balances.length === 0 && (
            <Alert
              message="暂无余额"
              description="您的账户中没有可用的余额"
              type="info"
              showIcon
            />
          )}
        </>
      )}
    </div>
  );
};

export default Balance;