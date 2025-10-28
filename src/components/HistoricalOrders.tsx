import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Empty, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getHistoricalOrders, type Order } from '../adaptor/biance';
import { useTranslation } from 'react-i18next';

type HistoricalOrdersProps = {
  symbol?: 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';
};

const HistoricalOrders: React.FC<HistoricalOrdersProps> = ({ symbol }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState<number>(20);

  // 获取历史订单数据
  const fetchHistoricalOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let allOrders: Order[] = [];
      if (symbol) {
        // 仅获取当前交易对
        allOrders = await getHistoricalOrders(symbol, { limit });
      } else {
        // 支持的交易对列表
        const tokens: ('ETHUSDT' | 'BTCUSDT' | 'SOLUSDT')[] = ['ETHUSDT', 'BTCUSDT', 'SOLUSDT'];
        // 并行获取所有交易对的历史订单
        const results = await Promise.all(tokens.map(token => getHistoricalOrders(token, { limit })));
        allOrders = results.flat();
      }
      
      // 按时间降序排序
      allOrders.sort((a, b) => b.time - a.time); // 按时间降序排序
      
      setOrders(allOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('historicalOrders.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据，当组件重新渲染或limit变化时都重新获取
  useEffect(() => {
    fetchHistoricalOrders();
  }, [limit, symbol]);

  // 表格列配置
  const columns: ColumnsType<Order> = [
    {
      title: t('historicalOrders.orderId'),
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: t('historicalOrders.symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: t('historicalOrders.direction'),
      dataIndex: 'side',
      key: 'side',
      render: (side) => {
        const color = side === 'BUY' ? 'green' : 'red';
        return <span style={{ color }}>{side === 'BUY' ? t('orderBook.buy') : t('orderBook.sell')}</span>;
      },
    },
    {
      title: t('historicalOrders.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 'MARKET' ? t('historicalOrders.marketOrder') : t('historicalOrders.limitOrder'),
    },
    {
      title: t('historicalOrders.price'),
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    },
    {
      title: t('historicalOrders.quantity'),
      dataIndex: 'origQty',
      key: 'origQty',
      sorter: (a, b) => parseFloat(a.origQty) - parseFloat(b.origQty),
    },
    {
      title: t('historicalOrders.executed'),
      dataIndex: 'executedQty',
      key: 'executedQty',
      sorter: (a, b) => parseFloat(a.executedQty) - parseFloat(b.executedQty),
    },
    {
      title: t('historicalOrders.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap: Record<string, string> = {
          'NEW': t('historicalOrders.newOrder'),
          'FILLED': t('historicalOrders.filled'),
          'PARTIALLY_FILLED': t('historicalOrders.partiallyFilled'),
          'CANCELED': t('historicalOrders.canceled'),
          'PENDING_CANCEL': t('historicalOrders.canceling'),
          'REJECTED': t('historicalOrders.rejected'),
          'EXPIRED': t('historicalOrders.expired'),
        };
        return statusMap[status] || status;
      },
    },
    {
      title: t('historicalOrders.time'),
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => a.time - b.time,
      render: (time) => {
        return new Date(time).toLocaleString();
      },
    },
  ];

  return (
    <div className="historical-orders">
      <div className="order-controls" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        {/* <div style={{ fontWeight: 500 }}>{symbol ? `${symbol} 当前订单` : '全部订单'}</div> */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* <div>
            <label style={{ marginRight: '8px' }}>显示数量:</label>
            <Select
              value={limit}
              onChange={(value) => setLimit(value)}
              style={{ width: 100 }}
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
            />
          </div> */}
          <Button type="primary" onClick={fetchHistoricalOrders} loading={loading}>
            {t('common.refresh')}
          </Button>
        </div>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip={t('common.loading')} />
        </div>
      )}
      
      {error && (
        <Alert
          message={t('historicalOrders.fetchFailed')}
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button type="primary" size="small" onClick={fetchHistoricalOrders}>
              {t('common.retry')}
            </Button>
          }
        />
      )}
      
      {!loading && !error && orders.length === 0 && (
        <Empty description={t('historicalOrders.noOrders')} style={{ padding: '40px 0' }} />
      )}
      
      {!loading && !error && orders.length > 0 && (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('historicalOrders.totalRecords', { total }),
          }}
          scroll={{ x: 1200 }}
        />
      )}
    </div>
  );
};

export default HistoricalOrders;