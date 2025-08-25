import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        {/* Placeholder routes for now */}
        <Route path="/board/missing" element={<div>Missing Board Page</div>} />
        <Route path="/board/shelter" element={<div>Shelter Board Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
      </Route>
    </Routes>
  );
}

export default App;
