import React, { useState, useEffect } from 'react';
import axiosInstance from '../../util/axiosInstance';
import { useAuth } from '../../context/AuthContext';

function ProfilePage() {
  const { user } = useAuth(); // Get user from AuthContext
  const [localUserInfo, setLocalUserInfo] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    address: user?.address || '',
  });
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // If user from context changes, update local state and form data
  useEffect(() => {
    if (user) {
      setLocalUserInfo(user);
      setEditFormData({
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        address: user.address,
      });
    }
  }, [user]);

  // Remove initial fetch, as userInfo is passed as prop
  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const response = await axiosInstance.get('/users/me');
  //       if (response.data.success) {
  //         setUserInfo(response.data.data);
  //         setEditFormData({
  //           name: response.data.data.name,
  //           phoneNumber: response.data.data.phoneNumber,
  //           email: response.data.data.email,
  //           address: response.data.data.address,
  //         });
  //       } else {
  //         setError(response.data.error.message || '사용자 정보를 불러오는데 실패했습니다.');
  //       }
  //     } catch (err) {
  //       console.error('Fetch user info error:', err);
  //       setError(err.response?.data?.error?.message || '서버 오류가 발생했습니다.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.put('/users/me', editFormData);
      if (response.data.success) {
        alert('회원 정보가 성공적으로 수정되었습니다.');
        setIsEditing(false);
        // Re-fetch user info to update the displayed data (or update local state if App.jsx handles it)
        // For now, re-fetch to ensure consistency with backend
        const updatedResponse = await axiosInstance.get('/users/me');
        if (updatedResponse.data.success) {
          setLocalUserInfo(updatedResponse.data.data);
        }
      } else {
        setError(response.data.error.message || '회원 정보 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Update user info error:', err);
      setError(err.response?.data?.error?.message || '서버 오류가 발생했습니다.');
    }
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordChangeData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (passwordChangeData.newPassword.length < 8) {
      setPasswordChangeError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      const response = await axiosInstance.put('/users/me', {
        passwordChange: passwordChangeData,
      });
      if (response.data.success) {
        setPasswordChangeSuccess('비밀번호가 성공적으로 변경되었습니다.');
        setPasswordChangeData({ currentPassword: '', newPassword: '' });
      } else {
        setPasswordChangeError(response.data.error.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data?.error?.message || '서버 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!localUserInfo) return <div>사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="profile-page">
      <h2>내 정보</h2>
      {!isEditing ? (
        <div>
          <p><strong>아이디:</strong> {localUserInfo.loginId}</p>
          <p><strong>이름:</strong> {localUserInfo.name}</p>
          <p><strong>전화번호:</strong> {localUserInfo.phoneNumber}</p>
          <p><strong>이메일:</strong> {localUserInfo.email}</p>
          <p><strong>주소:</strong> {localUserInfo.address}</p>
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary">정보 수정</button>
        </div>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름:</label>
            <input type="text" id="name" value={editFormData.name} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호:</label>
            <input type="text" id="phoneNumber" value={editFormData.phoneNumber} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일:</label>
            <input type="email" id="email" value={editFormData.email} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="address">주소:</label>
            <input type="text" id="address" value={editFormData.address} onChange={handleEditChange} required />
          </div>
          <button type="submit" className="btn btn-primary">저장</button>
          <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">취소</button>
        </form>
      )}

      <h3>비밀번호 변경</h3>
      <form onSubmit={handlePasswordSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">현재 비밀번호:</label>
          <input type="password" id="currentPassword" value={passwordChangeData.currentPassword} onChange={handlePasswordChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">새 비밀번호:</label>
          <input type="password" id="newPassword" value={passwordChangeData.newPassword} onChange={handlePasswordChange} required />
        </div>
        {passwordChangeError && <p className="error-message">{passwordChangeError}</p>}
        {passwordChangeSuccess && <p className="success-message">{passwordChangeSuccess}</p>}
        <button type="submit" className="btn btn-primary">비밀번호 변경</button>
      </form>
    </div>
  );
}

export default ProfilePage;