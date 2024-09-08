import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import Register from './components/Register';
import './App.css';
import './index.css';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { AuthProvider } from './components/contexts/AuthContext';

export const API_ADDRESS: string = process.env.REACT_APP_API_ADDRESS as string;
export const OAUTH_ID: string = process.env.REACT_APP_OAUTH_ID as string;
console.log(API_ADDRESS);
console.log(OAUTH_ID);

function App() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={OAUTH_ID}>
        <Router>
          <Routes>
              <Route path="/" element={<LandingPage />}></Route>
              <Route path="/home" element={<HomePage/>}></Route>
              <Route path='/register' element={<Register/>}></Route>
            </Routes>
        </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
