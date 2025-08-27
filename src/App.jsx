import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from "./layouts/MainLayout";
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';
import SearchFilterPage from './pages/search_filter/SearchFilterPage';


// Admin components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import PostManagementPage from './pages/admin/PostManagementPage';


import './App.css';

// AuthContext와 연동된 AdminRoute
const AdminRoute = () => {
    const { userRole } = useAuth(); // AuthContext에서 사용자 정보 가져오기

    // 사용자 정보가 없거나 role이 'ADMIN'이 아니면 로그인 페이지로 리디렉션
    if (!userRole || userRole !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />; // 자식 라우트를 렌더링
};


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
                    <Route path="/find-pets" element={<SearchFilterPage />} />
                </Route>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="posts" element={<PostManagementPage />} />
                </Route>
            </Route>
        </Routes>

    );
}

export default App;