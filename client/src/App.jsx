import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter, Routes, Route } from 'react-router-dom';
// import Header from './components/Header';
import MainImport from './main-components/MainImport';

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<MainImport />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
