import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import './App.css';
import './index.css';
import Register from './components/Register';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

export const API_ADDRESS: string = process.env.REACT_APP_API_ADDRESS as string;
export const OAUTH_ID: string = process.env.REACT_APP_OAUTH_ID as string;
console.log(API_ADDRESS);
console.log(OAUTH_ID);

function App() {
  return (
    <GoogleOAuthProvider clientId={OAUTH_ID}>
    <Router>
    <Header />
    <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path='/register' element={<Register/>}></Route>
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
