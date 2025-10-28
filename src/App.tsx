import Main from './components/Main';
import ThemeToggle from './components/ThemeToggle';
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
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        <Main />
      </div>
    </ConfigProvider>
  );
}

export default App;
