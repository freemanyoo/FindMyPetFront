import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from "./layouts/MainLayout";
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';

import './App.css';

function App() {
    return (
        <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    {/* Keeping other placeholders for now */}
                    <Route path="board/missing" element={<div>Missing Board Page</div>} />
                    <Route path="board/shelter" element={<div>Shelter Board Page</div>} />
                </Route>
        </Routes>

    );
}

export default App;
