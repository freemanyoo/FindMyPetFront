import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from "./layouts/MainLayout";
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';

import SearchFilterPage from './pages/search_filter/SearchFilterPage';
import BoardPage from './pages/post/BoardPage'; // 게시판 목록 페이지
import PostDetailPage from './pages/post/PostDetailPage'; // 게시판 상세 페이지
import PostFormPage from './pages/post/PostFormPage'; // 게시판 작성/수정 페이지

// SearchFilterPage는 SearchFilterBox 컴포넌트로 대체되므로 삭제하거나 주석 처리합니다.
// import SearchFilterPage from './pages/search_filter/SearchFilterPage';

// 게시판 페이지 import 추가
// import BoardListPage from './pages/board/BoardListPage';
// import BoardDetailPage from './pages/board/BoardDetailPage';
// import BoardWritePage from './pages/board/BoardWritePage';



// Admin components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import PostManagementPage from './pages/admin/PostManagementPage';

import './App.css';

// PrivateRoute (로그인한 사용자만 접근 가능)
const PrivateRoute = () => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

// AdminRoute
const AdminRoute = () => {
    const { userRole } = useAuth();
    return userRole === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};


function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* --- 게시판 라우트 수정 및 추가 --- */}
                <Route path="board/:type" element={<BoardListPage />} />
                <Route path="post/:postId" element={<BoardDetailPage />} />

                {/* 로그인해야 접근 가능한 경로들 */}
                <Route element={<PrivateRoute />}>
                    <Route path="profile" element={<ProfilePage />} />

                    {/* Keeping other placeholders for now */}
                    {/* ===== 🔽 Post 관련 라우트 추가 🔽 ===== */}
                    {/*<Route path="board/:type" element={<BoardPage />} /> /!* 1. 목록 (missing, shelter) *!/*/}
                    <Route path="board/:type" element={<BoardPage />} /> {/* 1. 목록 (missing, shelter) */}
                    <Route path="posts/new" element={<PostFormPage />} /> {/* 2. 작성 */}
                    <Route path="posts/:postId" element={<PostDetailPage />} /> {/* 4. 상세 */}
                    <Route path="posts/:postId/edit" element={<PostFormPage />} /> {/* 5. 수정 */}
                    <Route path="/find-pets" element={<SearchFilterPage />} />
                </Route>

//                     <Route path="board/write" element={<BoardWritePage />} />
//                     <Route path="post/edit/:postId" element={<BoardWritePage />} />
//                 </Route>
            </Route>


            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="posts" element={<PostManagementPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;