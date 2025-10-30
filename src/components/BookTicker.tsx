import React, { memo } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import type { BookTickerData } from '@/adaptor/biance';
import './styles/common.css';

type Token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

interface BookTickerProps {
  data: BookTickerData | null;
  token: Token;
}

const BookTicker: React.FC<BookTickerProps> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <div>
      {data ? (
        <Row gutter={[16, 16]} justify="center">
          <Col xs={12} sm={6}>
            <Card size="small" title={t('bookTicker.bidPrice')} variant="outlined">
              <Statistic 
                value={parseFloat(data.b || '0')} 
                precision={4}
                valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" title={t('bookTicker.bidQuantity')} variant="outlined">
              <Statistic 
                value={parseFloat(data.B || '0')} 
                precision={4}
                valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" title={t('bookTicker.askPrice')} variant="outlined">
              <Statistic 
                value={parseFloat(data.a || '0')} 
                precision={4}
                valueStyle={{ color: '#f5222d', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" title={t('bookTicker.askQuantity')} variant="outlined">
              <Statistic 
                value={parseFloat(data.A || '0')} 
                precision={4}
                valueStyle={{ color: '#f5222d', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="no-data-container">
          {t('bookTicker.noData')}
        </div>
      )}
    </div>
  );
};

// 自定义比较函数，只在data实际变化时重新渲染
const arePropsEqual = (prevProps: BookTickerProps, nextProps: BookTickerProps): boolean => {
  // 如果data都是null，不重新渲染
  if (prevProps.data === null && nextProps.data === null) {
    return true;
  }
  
  // 如果一个有data一个没有，需要重新渲染
  if (prevProps.data === null || nextProps.data === null) {
    return false;
  }
  
  // 比较关键数据字段是否变化（根据BookTickerData结构）
  // 只比较实际显示的字段
  const hasChanged = 
    prevProps.data.b !== nextProps.data.b || // bidPrice
    prevProps.data.B !== nextProps.data.B || // bidQuantity
    prevProps.data.a !== nextProps.data.a || // askPrice
    prevProps.data.A !== nextProps.data.A;   // askQuantity
  
  return !hasChanged;
};

export default memo(BookTicker, arePropsEqual);