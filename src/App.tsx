import OrderBook from './components/OrderBook';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Mini Trade</h1>
        <p>基于币安测试网的简易交易界面</p>
      </header>
      
      <main className="app-main">
        <OrderBook />
      </main>
    </div>
  );
}

export default App
