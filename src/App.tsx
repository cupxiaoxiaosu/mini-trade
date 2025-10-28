import Main from './components/Main';
import ThemeToggle from './components/ThemeToggle';
import LanguageSwitcher from './components/LanguageSwitcher';
import './App.css';
import './components/styles/common.css';
import './components/styles/app.css';
import { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { HashRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AppContent() {
  const { i18n } = useTranslation();
  
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

  // 处理语言切换和hash路由
  useEffect(() => {
    const hash = window.location.hash;
    
    // 根据hash设置语言
    if (hash.startsWith('#/en')) {
      i18n.changeLanguage('en-US');
    } else if (hash.startsWith('#/cn') || hash === '#/' || hash === '') {
      i18n.changeLanguage('zh-CN');
    }

    // 如果没有hash，设置默认hash
    if (!hash || hash === '#/') {
      window.location.hash = '#/cn';
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    const hash = lang === 'en-US' ? '/en' : '/cn';
    window.location.hash = `#${hash}`;
  };

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
        <div className="app-controls">
          <LanguageSwitcher onLanguageChange={handleLanguageChange} />
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
        <Main />
      </div>
    </ConfigProvider>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
