# Components 目录结构优化总结

## 优化内容

### 1. 目录结构重组
```
src/components/
├── styles/                    # 新增：统一样式目录
│   ├── common.css            # 通用样式类
│   ├── trade.css             # 交易相关样式
│   ├── table.css             # 表格相关样式
│   ├── card.css              # 卡片相关样式
│   ├── layout.css            # 布局相关样式
│   └── app.css               # App 组件样式
├── ExchangeHeader.tsx        # 交易所头部组件
├── BookTicker.tsx            # 行情数据组件
├── TradeForm.tsx             # 交易表单组件
├── HistoricalOrders.tsx      # 历史订单组件
├── OrderBook.tsx             # 订单簿组件
├── Balance.tsx               # 余额组件
├── Main.tsx                  # 主布局组件
├── LanguageSwitcher.tsx      # 语言切换组件
├── ThemeToggle.tsx           # 主题切换组件
└── Kline.tsx                 # K线图组件
```

### 2. 样式文件分类

#### common.css - 通用样式类
- 布局相关：`.flex-center`, `.flex-between`, `.flex-column` 等
- 间距相关：`.margin-bottom-16`, `.padding-12` 等
- 文本相关：`.text-center`, `.text-secondary`, `.text-bold` 等
- 颜色相关：`.color-white`, `.color-green`, `.color-red` 等
- 尺寸相关：`.height-44`, `.width-100` 等
- 主题适配：`[data-theme='light']` 和 `[data-theme='dark']` 选择器

#### trade.css - 交易相关样式
- 交易方向切换：`.trade-tabs`, `.trade-tab-buy`, `.trade-tab-sell`
- 快捷按钮：`.quick-buttons`, `.quick-button`
- 订单摘要：`.order-summary`, `.order-summary-row`
- 提交按钮：`.submit-button`, `.submit-button-buy`, `.submit-button-sell`

#### table.css - 表格相关样式
- 表格容器：`.table-container`, `.table-controls`
- 状态样式：`.table-loading`, `.table-empty`, `.table-error`
- 交易方向：`.trade-direction-buy`, `.trade-direction-sell`
- 状态标签：`.status-new`, `.status-filled` 等

#### card.css - 卡片相关样式
- 卡片容器：`.card-container`, `.card-title`, `.card-content`
- 网格布局：`.grid-container`, `.grid-row-1-left` 等
- 统计卡片：`.statistic-card`, `.statistic-value`
- 余额卡片：`.balance-card`

#### layout.css - 布局相关样式
- 交易所布局：`.exchange-layout`, `.exchange-content`
- 主页网格：`.home-grid`
- 错误消息：`.error-message`
- 最新价格：`.latest-price-container`, `.latest-price-value`
- 余额显示：`.balance-display`, `.balance-symbol`

#### app.css - App 组件样式
- 顶部控制栏：`.app-controls`

### 3. 内联样式迁移

#### 迁移前的问题
- 大量内联 `style` 属性
- 样式分散在各个组件中
- 难以维护和统一管理
- 不支持主题切换

#### 迁移后的优势
- 统一的 CSS 类管理
- 支持深色/浅色主题切换
- 更好的代码可维护性
- 样式复用性更强
- 响应式设计支持

### 4. 主题适配

所有样式文件都包含主题适配：
```css
/* 浅色主题 */
[data-theme='light'] .text-secondary {
  color: #8c8c8c;
}

/* 深色主题 */
[data-theme='dark'] .text-secondary {
  color: #a0a0a0;
}
```

### 5. 响应式设计

包含移动端适配：
```css
@media (max-width: 768px) {
  .mobile-hidden {
    display: none;
  }
  
  .mobile-full-width {
    width: 100%;
  }
}
```

## 使用方式

### 组件中引用样式
```tsx
import './styles/common.css';
import './styles/trade.css';
```

### 使用 CSS 类
```tsx
// 替换前
<div style={{ display: 'flex', justifyContent: 'space-between' }}>

// 替换后
<div className="flex-between">
```

## 优化效果

1. **代码可维护性**：样式集中管理，易于修改和维护
2. **主题支持**：完整的深色/浅色主题切换支持
3. **性能优化**：减少内联样式，提高渲染性能
4. **开发效率**：通用样式类提高开发效率
5. **一致性**：统一的样式规范，保证 UI 一致性
