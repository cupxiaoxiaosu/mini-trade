import React from 'react';
import type { BookTickerData } from '../adaptor/biance/index';
import { Card, Row, Col, Statistic } from 'antd';
type token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

interface BookTickerProps {
  data: BookTickerData | null;
  token: token;
}

const BookTicker: React.FC<BookTickerProps> = ({ data, token }) => {
  return (
    <div>  {data ? (
        <Row gutter={[16, 16]} justify="center">
          <Col xs={12} sm={6}>
            <Card size="small" title="买一价 (b)" variant="outlined">
              <Statistic 
                value={parseFloat(data.b || '0')} 
                precision={8}
                valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" title="买一量 (B)" variant="outlined">
              <Statistic 
                value={parseFloat(data.B || '0')} 
                precision={8}
                valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" title="卖一价 (a)" variant="outlined">
              <Statistic 
                value={parseFloat(data.a || '0')} 
                precision={8}
                valueStyle={{ color: '#f5222d', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" title="卖一量 (A)" variant="outlined">
              <Statistic 
                value={parseFloat(data.A || '0')} 
                precision={8}
                valueStyle={{ color: '#f5222d', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
          暂无买卖盘数据
        </div>
      )}
    </div>
  );
};

export default BookTicker;