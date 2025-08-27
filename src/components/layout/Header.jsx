import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // 버튼 등에 사용할 간단한 인라인 스타일
    const buttonStyle = {
        padding: '8px 16px',
        borderRadius: '20px',
        textDecoration: 'none',
        border: '1px solid #667eea',
        cursor: 'pointer',
        backgroundColor: '#667eea',
        color: 'white',
        whiteSpace: 'nowrap' // 버튼 텍스트 줄바꿈 방지
    };

    const outlineButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        color: '#667eea'
    };

    return (
        <header style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: '#0d6efd',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    flexShrink: 0 // 로고가 찌그러지지 않도록 설정
                }}>
                    🐾 찾아줘요
                </Link>
                <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {isAuthenticated ? (
                        <>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                lineHeight: '1.4',
                                marginRight: '15px'
                            }}>
                                <span>환영합니다,</span>
                                <span style={{ fontWeight: 'bold' }}>{user?.name || user?.loginId}님!</span>
                            </div>

                            <Link to="/profile">
                                <button style={outlineButtonStyle}>마이페이지</button>
                            </Link>
                            <button onClick={handleLogout} style={buttonStyle}>로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button style={outlineButtonStyle}>로그인</button>
                            </Link>
                            <Link to="/register">
                                <button style={buttonStyle}>회원가입</button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
