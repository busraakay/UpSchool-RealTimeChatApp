import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatListPage from './pages/ChatListPage'
import ChatPage from './pages/ChatPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/chat/:name" element={<ChatListPage />} />
    </Routes>
  </BrowserRouter>
  )
}

export default App
