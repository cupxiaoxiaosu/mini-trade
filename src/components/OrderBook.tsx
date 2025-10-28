import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {  TradeData } from '../adaptor/biance/index';
import { useTranslation } from 'react-i18next';
type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';
// 交易列表接口

interface OrderBookProps {
  data: TradeData[];
  token: token;
}

export const OrderBook: React.FC<OrderBookProps> = ({ data, token }) => {
  const { t } = useTranslation();
  
  // 将trade对象转换为扁平数组，包含交易对信息
  
  
  // 定义表格列
  const columns: ColumnsType<TradeData> = [
    {
      title: t('orderBook.symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      fixed: 'left',
      render: () => token.toUpperCase(),
    },
    {
      title: t('orderBook.price'),
      dataIndex: 'p',
      key: 'price',
      render: (text: string) => parseFloat(text).toFixed(2),
      sorter: (a, b) => parseFloat(a.p) - parseFloat(b.p),
    },
    {
      title: t('orderBook.quantity'),
      dataIndex: 'q',
      key: 'quantity',
      render: (text: string) => parseFloat(text).toFixed(4),
    },
    {
      title: t('orderBook.amount'),
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
      title: t('orderBook.direction'),
      key: 'side',
      dataIndex: 'm',
      render: (isSell: boolean) => (
        <span style={{ color: isSell ? '#f5222d' : '#52c41a' }}>
          {isSell ? t('orderBook.sell') : t('orderBook.buy')}
        </span>
      ),
    },
    {
      title: t('orderBook.time'),
      dataIndex: 'T',
      key: 'time',
      render: (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
      },
      sorter: (a, b) => a.T - b.T,
    },
    {
      title: t('orderBook.tradeId'),
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