# 前端技术面试任务：**加密货币交易应用（Trading App）**

---

## 1. 范围与目标

设计一个 **生产级（production-grade）React + TypeScript 单页应用（SPA）**，允许用户监控并交易一小组加密货币交易对（例如 `BTC/USDT`、`ETH/USDT`、`SOL/USDT`）。

核心界面必须嵌入 TradingView 的 **Charting Library（非轻量版组件）**，并通过公有交易所的 WebSocket（可以使用 Binance 现货 API）实现实时数据流。

该任务的范围特意控制在 **约 12–16 小时内可完成一个高质量 MVP**，同时展示你的架构能力、代码质量和性能优化技巧。

---

## 2. 功能需求

### 1️⃣ 交易对选择器
- 下拉菜单，至少包含三个现货交易对。
- 切换交易对时，必须即时更新所有相关组件（图表、订单簿、行情、PnL），且 **不能整页刷新**。

### 2️⃣ TradingView 蜡烛图
- 通过 npm 或本地构建方式集成 TradingView 的 **Charting Library**。
- 支持显示 1m、5m、1h、4h、1d 的K线。
- 切换时间周期时，应通过 REST API 获取历史 K 线数据，并重新连接 WebSocket 继续实时更新。
- 至少实现一个自定义叠加指标（如 VWAP 或 9 周期 EMA）。

### 3️⃣ 实时订单簿
- 显示前 20 档买单与卖单，并按最小价格单位聚合。
- 界面更新频率 ≥ 5Hz，使用节流或 `requestAnimationFrame` 保证 UI > 60 FPS。
- 使用滚动虚拟化或行级 memo 化，避免 React 列表性能瓶颈。

### 4️⃣ 交易面板（限价单）
- 包含价格、数量、买卖方向、“post-only” 开关。
- 客户端校验输入，并实时显示最优买/卖价。
- 模拟本地下单（无需私钥签名），并在 <250ms 内显示状态提示（“已接受”/“已拒绝”）。

### 5️⃣ 持仓与盈亏（Positions & PnL）
- 展示当前未平仓订单及浮动盈亏（按市价计算）。
- 持久化到 `localStorage`，刷新后仍能恢复。

### 6️⃣ 连接稳定性（Connectivity Resilience）
- 自动重连机制（指数退避 exponential back-off）。
- 当图表断线重连时，排队并快速回放增量数据。

---

## 3. 技术要求

### 🧰 工具链
- React 18、TypeScript ≥ 5.3、Vite 4（或 Next.js 14 app-router）。
- 状态管理可选：Redux Toolkit、Recoil 或 Zustand。  
  👉 必须在 *架构决策记录（ADR）* 中说明选择理由。
- 使用 ESLint + Prettier + `typescript-eslint` + Husky 进行提交前检查。

### 🔗 数据层
- 抽象出 `ExchangeAdapter` 接口封装交易所逻辑。
- 至少实现 Binance 适配器。
- 若额外实现 `BybitAdapter`，可加分。
- 将计算密集的逻辑（价格聚合、PnL 计算）放入 Web Worker，避免主线程阻塞。

### ⚡ 性能
- 首次内容绘制（FCP） ≤ 1.5 秒（在 4× CPU 限速 + 3G 网络下执行 `npm run lighthouse`）。
- React 渲染周期 ≤ 16ms（Chrome DevTools Flamegraph 验证）。

### ♿ 无障碍与用户体验
- 所有控件支持键盘导航。
- 表格添加 ARIA 角色。
- 支持系统深/浅色模式（`prefers-color-scheme`）。
- 响应式布局，最小适配 390px 宽（手机横屏）。

### 🧪 测试
- 单元测试覆盖率 ≥ 80%（使用 Vitest 或 Jest + React Testing Library）。
- 至少一个 Playwright E2E 测试，验证下单后订单在持仓表中展示。

### 🔒 安全性
- 添加 CSP meta 标签。
- TradingView 以 `iframe sandbox` 方式嵌入。
- 禁止使用 `unsafe-eval`。
- 清理所有用户输入（即使是模拟下单）。

---

## 4. 交付要求

### 📂 GitHub 仓库结构

```bash
/src
  /adapters
  /components
  /hooks
  /pages
  /workers
  ...
/docs
  ADR-0001-state-layer.md
