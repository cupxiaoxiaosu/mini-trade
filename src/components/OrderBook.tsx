import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {  TradeData } from '../adaptor/biance/index';
type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';
// 交易列表接口

interface OrderBookProps {
  data: TradeData[];
  token: token;
}

export const OrderBook: React.FC<OrderBookProps> = ({ data, token }) => {
  // 将trade对象转换为扁平数组，包含交易对信息
  
  
  // 定义表格列
  const columns: ColumnsType<TradeData> = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      fixed: 'left',
      render: () => token.toUpperCase(),
    },
    {
      title: '价格',
      dataIndex: 'p',
      key: 'price',
      render: (text: string) => parseFloat(text).toFixed(2),
      sorter: (a, b) => parseFloat(a.p) - parseFloat(b.p),
    },
    {
      title: '数量',
      dataIndex: 'q',
      key: 'quantity',
      render: (text: string) => parseFloat(text).toFixed(4),
    },
    {
      title: '成交额',
      key: 'amount',
      render: (record) => {
        const price = parseFloat(record.p);
        const quantity = parseFloat(record.q);
        return (price * quantity).toFixed(2);
      },
      sorter: (a, b) => {
        const amountA = parseFloat(a.p) * parseFloat(a.q);
        const amountB = parseFloat(b.p) * parseFloat(b.q);
        return amountA - amountB;
      },
    },
    {
      title: '方向',
      key: 'side',
      dataIndex: 'm',
      render: (isSell: boolean) => (
        <span style={{ color: isSell ? '#f5222d' : '#52c41a' }}>
          {isSell ? '卖出' : '买入'}
        </span>
      ),
    },
    {
      title: '时间',
      dataIndex: 'T',
      key: 'time',
      render: (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
      },
      sorter: (a, b) => a.T - b.T,
    },
    {
      title: '交易ID',
      dataIndex: 't',
      key: 'tradeId',
      width: 100,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) => `${record.t}`}
      pagination={false}
      scroll={{ x: 1200 }}
      size="small"
      bordered
    />
  );
};

export default OrderBook;