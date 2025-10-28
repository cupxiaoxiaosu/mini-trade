import React from 'react';
import { Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleLanguageChange}
      style={{ 
        width: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)'
      }}
      options={[
        { value: 'zh-CN', label: '中文' },
        { value: 'en-US', label: 'English' }
      ]}
    />
  );
};

export default LanguageSwitcher;

