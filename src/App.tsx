import Main from './components/Main';
import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

function App() {
  const getInitialTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDark = useMemo(() => theme === 'dark', [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: isDark
          ? {
              colorPrimary: '#1976d2',
            }
          : {
              colorPrimary: '#1976d2',
              colorBgBase: '#fafafa',
              colorBgLayout: '#ffffff',
              colorBgContainer: '#ffffff',
              colorBgElevated: '#ffffff',
            },
        components: isDark
          ? {}
          : {
              Table: {
                rowHoverBg: '#f5f7ff',
                rowSelectedBg: '#eaf2ff',
                headerBg: '#fafafa',
              },
              Select: {
                optionActiveBg: '#f5f7ff',
                optionSelectedBg: '#eaf2ff',
                controlItemBgActive: '#f5f7ff',
              },
            },
      }}
    >
      <div className="app">
        <button
          type="button"
          aria-label={isDark ? '切换为浅色模式' : '切换为深色模式'}
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 14.32l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 12H1v0h3v0zm19 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zm12.02-12.02l1.41-1.41-1.79-1.8-1.41 1.41 1.79 1.8zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21.75 15.5A9.75 9.75 0 0110.5 2.25c.18 0 .36 0 .53.02a1 1 0 01.54 1.79 7.75 7.75 0 0 0 9.37 12.33 1 1 0 01.81 1.81 9.72 9.72 0 0 1-0 0z"/>
            </svg>
          )}
        </button>
        <Main />
      </div>
    </ConfigProvider>
  );
}

export default App;
