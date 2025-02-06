import logo from './logo.svg';
import './App.css';

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <div style={{ textAlign: "center", padding: "50px" }}>
    <h1>Gen AI Studio _ HYU Capstone design</h1>
    <p>Firebase Hosting과 React를 온갖 오류 끝에 연결 성공 했습니다... - 승근</p>
    <button onClick={() => alert("배포 성공!")}>클릭하세요</button>
  </div>
  );
}

export default App;
