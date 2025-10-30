import React, { useState, useEffect, useImperativeHandle, forwardRef, memo } from 'react';
import { Table, Spin, Alert, Empty, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { getHistoricalOrders, type Order } from '@/adaptor/biance';
import './styles/table.css';
import './styles/common.css';

type HistoricalOrdersProps = {
  symbol?: 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';
  onLoadingChange?: (loading: boolean) => void;
};

export interface HistoricalOrdersRef {
  refresh: () => void;
  loading: boolean;
}

const HistoricalOrders = forwardRef<HistoricalOrdersRef, HistoricalOrdersProps>(({ symbol, onLoadingChange }, ref) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState<number>(20);

  console.log('his order render')
  // 获取历史订单数据
  const fetchHistoricalOrders = async () => {
    setLoading(true);
    onLoadingChange?.(true);
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
      onLoadingChange?.(false);
    }
  };

  // 使用 useImperativeHandle 暴露刷新方法和状态
  useImperativeHandle(ref, () => ({
    refresh: fetchHistoricalOrders,
    loading
  }), [loading]);

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
        return <span className={side === 'BUY' ? 'trade-direction-buy' : 'trade-direction-sell'}>
          {side === 'BUY' ? t('orderBook.buy') : t('orderBook.sell')}
        </span>;
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
      {loading && (
        <div className="table-loading">
          <Spin tip={t('common.loading')} />
        </div>
      )}
      
      {error && (
        <Alert
          message={t('historicalOrders.fetchFailed')}
          description={error}
          type="error"
          showIcon
          className="table-error"
          action={
            <Button type="primary" size="small" onClick={fetchHistoricalOrders}>
              {t('common.retry')}
            </Button>
          }
        />
      )}
      
      {!loading && !error && orders.length === 0 && (
        <Empty description={t('historicalOrders.noOrders')} className="table-empty" />
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
});

HistoricalOrders.displayName = 'HistoricalOrders';

// 自定义比较函数，优化组件重渲染
const arePropsEqual = (prevProps: HistoricalOrdersProps, nextProps: HistoricalOrdersProps): boolean => {
  // 只有当 symbol 或 onLoadingChange 函数引用发生变化时才重渲染
  return prevProps.symbol === nextProps.symbol && prevProps.onLoadingChange === nextProps.onLoadingChange;
};

export default React.memo(HistoricalOrders, arePropsEqual);