import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../util/axiosInstance';

function RegisterPage() {
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axiosInstance.post('/auth/signup', formData);
      if (response.data.success) {
        console.log('Registration successful:', response.data);
        alert('회원가입이 완료되었습니다. 로그인 해주세요.');
        navigate('/login'); // Redirect to login page
      } else {
        setError(response.data.error.message || '회원가입 실패');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error?.message || '서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="register-page">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginId">아이디:</label>
          <input type="text" id="loginId" value={formData.loginId} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호:</label>
          <input type="password" id="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="name">이름:</label>
          <input type="text" id="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">전화번호:</label>
          <input type="text" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">이메일:</label>
          <input type="email" id="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="address">주소:</label>
          <input type="text" id="address" value={formData.address} onChange={handleChange} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary">회원가입</button>
      </form>
      <p>이미 계정이 있으신가요? <a href="/login">로그인</a></p>
    </div>
  );
}

export default RegisterPage;
