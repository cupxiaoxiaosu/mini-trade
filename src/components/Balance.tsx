import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Spin, Alert } from 'antd';
import type { Balance } from '../adaptor/biance/api';
import { binanceApi } from '../adaptor/biance/api';

const Balance: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchBalances();
    // 每30秒自动刷新一次余额
    const intervalId = setInterval(fetchBalances, 30000);
    
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
    const colorMap: Record<string, string> = {
      BTC: '#F7931A',
      ETH: '#627EEA',
      USDT: '#26A17B',
      SOL: '#00FFA3'
    };
    return colorMap[asset] || '#1890FF';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>账户余额</h2>
      
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
          <Card style={{ marginBottom: '20px' }}>
            <Statistic
              title="总资产 (USDT)"
              value={getTotalBalance()}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix="$"
              suffix="USDT"
            />
          </Card>
          
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
                  >
                    <Statistic
                      title={balance.asset}
                      value={total}
                      precision={6}
                      valueStyle={{ color: getTokenColor(balance.asset) }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
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