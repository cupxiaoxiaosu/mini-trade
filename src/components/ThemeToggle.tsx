import React, { memo } from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  const { t } = useTranslation();
  return (
    <Button
      type="default"
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      className="theme-toggle"
      onClick={onToggle}
      icon={
        isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 14.32l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 12H1v0h3v0zm19 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zm12.02-12.02l1.41-1.41-1.79-1.8-1.41 1.41 1.79 1.8zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21.75 15.5A9.75 9.75 0 0110.5 2.25c.18 0 .36 0 .53.02a1 1 0 01.54 1.79 7.75 7.75 0 0 0 9.37 12.33 1 1 0 01.81 1.81 9.72 9.72 0 0 1-0 0z"/>
          </svg>
        )
      }
    />
  );
};

export default memo(ThemeToggle);


