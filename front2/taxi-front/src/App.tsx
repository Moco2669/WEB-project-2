import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import './App.css';
import './index.css';
import Register from './components/Register';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path='/register' element={<Register/>}></Route>
      </Routes>
    </Router>
  );
}

export const API_ADDRESS: string = process.env.REACT_APP_API_ADDRESS as string;
console.log(API_ADDRESS);

export default App;
