import React from 'react';
import { Link } from 'react-router-dom';

// Layout 컴포넌트는 children이라는 prop을 받습니다.
// 이 children이 <Routes>에 해당하며, 페이지 내용이 들어갈 자리가 됩니다.
const Layout = ({ children }) => {
    return (
        <div>
            <header style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <nav>
                    <Link to="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#0d6efd' }}>
                        홈
                    </Link>
                    {/* 여기에 다른 메뉴 링크들을 추가할 수 있습니다. */}
                    <Link to="/posts/1" style={{ marginRight: '20px', textDecoration: 'none', color: '#0d6efd' }}>
                        게시글 상세 (테스트)
                    </Link>
                </nav>
            </header>

            <main style={{ padding: '20px' }}>
                {/* 페이지의 실제 내용이 이 부분에 렌더링됩니다. */}
                {children}
            </main>

            <footer style={{ padding: '20px', backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6', marginTop: '40px', textAlign: 'center' }}>
                <p>&copy; 2025 FindMyFet. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;