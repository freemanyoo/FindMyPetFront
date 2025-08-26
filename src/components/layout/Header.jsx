import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, userInfo, handleLogout }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <i className="fas fa-paw"></i>
          찾아줘요
        </Link>
        <nav className="nav-buttons">
          {isLoggedIn ? (
            <>
              <span className="user-name">환영합니다, {userInfo?.name}님!</span>
              <Link to="/profile" className="btn btn-outline">
                <i className="fas fa-user"></i>
                마이페이지
              </Link>
              <button onClick={onLogout} className="btn btn-primary">
                <i className="fas fa-sign-out-alt"></i>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                <i className="fas fa-sign-in-alt"></i>
                로그인
              </Link>
              <Link to="/register" className="btn btn-primary">
                <i className="fas fa-user-plus"></i>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
