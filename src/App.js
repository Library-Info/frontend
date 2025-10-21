import {useEffect} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Main from "./component/main/js/Main.js";
import { REST_API_KEY } from "./config/Host-config.js";

function Reset() {
    return null;
}

function App() {
    // useEffect(() => {
    //     // 카카오 초기화
    //     if (!window.Kakao.isInitialized()) {
    //         window.Kakao.init(`${REST_API_KEY}`); // REST API 키 입력
    //         console.log('Kakao SDK initialized');
    //     }
    // }, []);
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
