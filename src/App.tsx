import Main from './components/Main';
import './App.css';
function App() {

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mini Trade</h1>
      </header>
      <main className="app-main">
        <div className="content-section">
          <Main />
        </div>
      </main>
    </div>
  );
}

export default App;
