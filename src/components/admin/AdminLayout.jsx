
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div style={{ display: 'flex' }}>
            <nav style={{ width: '200px', borderRight: '1px solid #ccc', padding: '20px' }}>
                <h2>관리자 메뉴</h2>
                <ul>
                    <li><Link to="/admin">대시보드</Link></li>
                    <li><Link to="/admin/users">사용자 관리</Link></li>
                    <li><Link to="/admin/posts">게시글 관리</Link></li>
                </ul>
            </nav>
            <main style={{ flex: 1, padding: '20px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
