import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <i className="fas fa-paw"></i>
          찾아줘요
        </Link>
        <nav className="nav-buttons">
          <Link to="/login" className="btn btn-outline">
            <i className="fas fa-sign-in-alt"></i>
            로그인
          </Link>
          <Link to="/register" className="btn btn-primary">
            <i className="fas fa-user-plus"></i>
            회원가입
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
