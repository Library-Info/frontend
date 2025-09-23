import {BrowserRouter, Route, Routes} from "react-router-dom";
import logo from './logo.svg';
import './App.css';

function Reset() {
    return null;
}

function App() {
  return (
      <BrowserRouter>
        <Reset/>
        <Routes>
          <Route path="/" element={<Main/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
