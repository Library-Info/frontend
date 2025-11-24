import { Reset } from 'styled-reset'
import {useEffect} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Main from "./component/main/js/Main.js";
import BookRecommend from "./component/subpage/js/BookRecommend.js";
import { REST_API_KEY } from "./config/Host-config.js";


function App() {
    return (
      <BrowserRouter>
        <Reset/>
        <Routes>
            <Route path="/" element={<Main/>}/>
            <Route path="/recommend" element={<BookRecommend/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
