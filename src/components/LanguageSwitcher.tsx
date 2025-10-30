import React, { memo } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import './styles/common.css';

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
      className="language-switcher"
      value={i18n.language}
      onChange={handleLanguageChange}
      options={[
        { value: 'zh-CN', label: '中文' },
        { value: 'en-US', label: 'English' }
      ]}
    />
  );
};

export default memo(LanguageSwitcher);

