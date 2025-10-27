import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'

// 配置Ant Design主题 - 老虎证券风格（深蓝色主题）
const darkTheme = {
  token: {
    colorPrimary: '#1976d2', // 老虎证券深蓝色主色调
    colorPrimaryHover: '#2196f3',
    colorPrimaryActive: '#1565c0',
    colorError: '#f5222d',   // 下跌红色
    colorSuccess: '#52c41a', // 上涨绿色
    colorWarning: '#faad14', // 警告黄色
    colorBgBase: '#141414',
    colorBgLayout: '#0a0a0a',
    colorBgElevated: '#1e1e1e',
    colorBgContainer: '#252525',
    colorTextBase: '#eaeaea',
    colorTextSecondary: '#999',
    colorBorder: '#333',
    colorBorderSecondary: '#444',
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={darkTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
