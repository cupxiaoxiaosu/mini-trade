import React from 'react';
import { Select, Badge, Layout } from 'antd';
import { useTranslation } from 'react-i18next';

type Token = 'ETHUSDT' | 'BTCUSDT' | 'SOLUSDT';

interface ExchangeHeaderProps {
  selectedToken: Token;
  isConnected: boolean;
  onSymbolChange: (value: string) => void;
}

const { Header } = Layout;

const ExchangeHeader: React.FC<ExchangeHeaderProps> = ({
  selectedToken,
  isConnected,
  onSymbolChange
}) => {
  const { t } = useTranslation();

  return (
    <Header className="exchange-header">
      <div className="header-content">
        <div className="header-left">
          <div className="main-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '30px' }}>
            <div className="symbol-selector" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'white' }}>{t('main.tradingPair')}:</span>
              <Select
                value={selectedToken.toLowerCase()}
                onChange={onSymbolChange}
                style={{ width: 150, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                options={[
                  { value: 'ethusdt', label: 'ETH/USDT' },
                  { value: 'btcusdt', label: 'BTC/USDT' },
                  { value: 'solusdt', label: 'SOL/USDT' }
                ]}
                placeholder={t('main.selectPair')}
              />
            </div>
            
            <div className="connection-status" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Badge 
                status={isConnected ? 'success' : 'error'} 
                text={<span style={{ color: 'white' }}>{isConnected ? t('common.connected') : t('common.notConnected')}</span>} 
              />
            </div>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default ExchangeHeader;

