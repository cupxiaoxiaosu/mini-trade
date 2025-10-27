import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Empty, Button, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getHistoricalOrders, type Order } from '../adaptor/biance/api';

const HistoricalOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(20);

  // 获取历史订单数据
  const fetchHistoricalOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 支持的交易对列表
      const tokens: ('ETHUSDT' | 'BTCUSDT' | 'SOLUSDT')[] = ['ETHUSDT', 'BTCUSDT', 'SOLUSDT'];
      
      // 并行获取所有交易对的历史订单
      const promises = tokens.map(token => getHistoricalOrders(token, { limit }));
      const results = await Promise.all(promises);
      
      // 合并所有订单并按时间排序
      const allOrders = results.flat();
      allOrders.sort((a, b) => b.time - a.time); // 按时间降序排序
      
      setOrders(allOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取历史订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据，当组件重新渲染或limit变化时都重新获取
  useEffect(() => {
    fetchHistoricalOrders();
  }, [limit]);

  // 表格列配置
  const columns: ColumnsType<Order> = [
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
      render: (side) => {
        const color = side === 'BUY' ? 'green' : 'red';
        return <span style={{ color }}>{side === 'BUY' ? '买入' : '卖出'}</span>;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 'MARKET' ? '市价单' : '限价单',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    },
    {
      title: '数量',
      dataIndex: 'origQty',
      key: 'origQty',
      sorter: (a, b) => parseFloat(a.origQty) - parseFloat(b.origQty),
    },
    {
      title: '已执行',
      dataIndex: 'executedQty',
      key: 'executedQty',
      sorter: (a, b) => parseFloat(a.executedQty) - parseFloat(b.executedQty),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap: Record<string, string> = {
          'NEW': '新建',
          'FILLED': '完全成交',
          'PARTIALLY_FILLED': '部分成交',
          'CANCELED': '已取消',
          'PENDING_CANCEL': '取消中',
          'REJECTED': '已拒绝',
          'EXPIRED': '已过期',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '时间',
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
        <div>
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
        </div>
        <Button type="primary" onClick={fetchHistoricalOrders} loading={loading}>
          刷新
        </Button>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载中..." />
        </div>
      )}
      
      {error && (
        <Alert
          message="获取订单失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button type="primary" size="small" onClick={fetchHistoricalOrders}>
              重试
            </Button>
          }
        />
      )}
      
      {!loading && !error && orders.length === 0 && (
        <Empty description="暂无历史订单" style={{ padding: '40px 0' }} />
      )}
      
      {!loading && !error && orders.length > 0 && (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      )}
    </div>
  );
};

export default HistoricalOrders;