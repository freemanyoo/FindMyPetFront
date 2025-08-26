import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../util/axiosInstance';

function LoginPage({ onLoginSuccess }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axiosInstance.post('/auth/login', { loginId, password });
      if (response.data.success) {
        console.log('Login successful:', response.data);
        // Call the onLoginSuccess prop to update App.jsx state and localStorage
        onLoginSuccess(response.data.data.accessToken, response.data.data.refreshToken, response.data.data.user);
        navigate('/'); // Redirect to home page or dashboard
      } else {
        setError(response.data.error.message || '로그인 실패');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error?.message || '서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-page">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginId">아이디:</label>
          <input
            type="text"
            id="loginId"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary">로그인</button>
      </form>
      <p>계정이 없으신가요? <a href="/register">회원가입</a></p>
    </div>
  );
}

export default LoginPage;
