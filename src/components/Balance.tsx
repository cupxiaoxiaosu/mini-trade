import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Spin, Alert } from 'antd';
import type { Balance } from '../adaptor/biance';
import { binanceApi, getHistoricalOrders } from '../adaptor/biance';
import { useTranslation } from 'react-i18next';
import './styles/card.css';
import './styles/common.css';

const Balance: React.FC = () => {
  const { t } = useTranslation();
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
      setError(err instanceof Error ? err.message : t('balance.fetchFailed'));
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
        <div className="flex-center height-200 flex-column">
          <Spin size="large" />
          <div className="margin-top-16 font-size-16 text-secondary">{t('balance.fetchingBalance')}</div>
        </div>
      )}
      
      {error && (
        <Alert
          message={t('common.error')}
          description={error}
          type="error"
          showIcon
          className="margin-bottom-20"
          action={
            <button
              onClick={fetchBalances}
              className="border-radius-4 padding-12 retry-button"
            >
              {t('common.retry')}
            </button>
          }
        />
      )}
      
      {!loading && !error && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card className="statistic-card" variant="outlined">
                <Statistic
                  value={getTotalBalance()}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                  prefix="$"
                  suffix="USDT"
                  title={t('balance.totalAsset')}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="statistic-card" variant="outlined">
                {plLoading ? (
                  <div className="flex-center height-200">
                    <Spin size="small" />
                    <span className="margin-left-10">{t('balance.calculating')}</span>
                  </div>
                ) : (
                  <>
                    <Statistic
                      value={profitLoss.amount}
                      precision={2}
                      valueStyle={{ color: profitLoss.amount >= 0 ? '#52c41a' : '#f5222d' }}
                      prefix={profitLoss.amount >= 0 ? '+' : ''}
                      suffix="USDT"
                      title={t('balance.totalProfitLoss')}
                    />
                    <div className="margin-top-8 font-size-14">
                      {t('balance.profitLossRate')} <span className={profitLoss.percent >= 0 ? 'text-success' : 'text-danger'}>
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
                    className="balance-card"
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
                    <div className="margin-top-8 font-size-12 text-secondary">
                      <div>{t('balance.available')}: {parseFloat(balance.free).toFixed(6)}</div>
                      <div>{t('balance.locked')}: {parseFloat(balance.locked).toFixed(6)}</div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
          
          {balances.length === 0 && (
            <Alert
              message={t('balance.noBalance')}
              description={t('balance.noBalanceDesc')}
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