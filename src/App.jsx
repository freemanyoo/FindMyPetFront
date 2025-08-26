
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from "./layouts/MainLayout";
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    {/* Keeping other placeholders for now */}
                    <Route path="board/missing" element={<div>Missing Board Page</div>} />
                    <Route path="board/shelter" element={<div>Shelter Board Page</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;