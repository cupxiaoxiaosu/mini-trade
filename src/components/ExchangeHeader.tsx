import React from 'react';
import { Select, Badge, Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import './styles/layout.css';
import './styles/common.css';

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
          <div className="main-controls">
            <div>Mini Trade</div>
            <div className="symbol-selector">
              <Select
                className="symbol-selector-dropdown"
                value={selectedToken.toLowerCase()}
                onChange={onSymbolChange}
                options={[
                  { value: 'ethusdt', label: 'ETH/USDT' },
                  { value: 'btcusdt', label: 'BTC/USDT' },
                  { value: 'solusdt', label: 'SOL/USDT' }
                ]}
                placeholder={t('main.selectPair')}
              />
            </div>
            
            <div className="connection-status">
              <Badge 
                status={isConnected ? 'success' : 'error'} 
                text={<span className="connection-status-badge">{isConnected ? t('common.connected') : t('common.notConnected')}</span>} 
              />
            </div>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default ExchangeHeader;

