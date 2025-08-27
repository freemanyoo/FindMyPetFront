import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useNavigate and useLocation

function ProfilePage() {
  const { user } = useAuth(); // Get user from AuthContext
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Initialize useLocation
  const [localUserInfo, setLocalUserInfo] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    address: user?.address || '',
  });
  const [editSuccess, setEditSuccess] = useState(''); // Add editSuccess state
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setEditSuccess(location.state.successMessage);
      // Clear the state after displaying to prevent it from showing again on refresh
      // This might require clearing location.state or navigating without state
      // For simplicity, we'll just setEditSuccess and let it clear on next interaction
      // To clear the state from history, you might use navigate(location.pathname, { replace: true, state: {} });
      // For now, we'll rely on the message being transient.
    }
  }, [location.state, setEditSuccess]); // Depend on location.state and setEditSuccess

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

    // Fetch user info on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/users/me');
        if (response.data.success) {
          setLocalUserInfo(response.data.data);
          setEditFormData({
            name: response.data.data.name,
            phoneNumber: response.data.data.phoneNumber,
            email: response.data.data.email,
            address: response.data.data.address,
          });
        } else {
          setError(response.data.error.message || '사용자 정보를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Fetch user info error:', err);
        setError(err.response?.data?.error?.message || '서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []); // Empty dependency array means it runs once on mount

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
        setIsEditingProfile(false); // Corrected
        // Re-fetch user info to update the displayed data (or update local state if App.jsx handles it)
        // For now, re-fetch to ensure consistency with backend
        const updatedResponse = await axiosInstance.get('/users/me');
        if (updatedResponse.data.success) {
          setLocalUserInfo(updatedResponse.data.data);
          setEditFormData({
            name: updatedResponse.data.data.name,
            phoneNumber: updatedResponse.data.data.phoneNumber,
            email: updatedResponse.data.data.email,
            address: updatedResponse.data.data.address,
          });
        }
      } else {
        setError(response.data.error.message || '회원 정보 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Update user info error:', err);
      setError(err.response?.data?.error?.message || '회원 정보 수정 중 서버 오류가 발생했습니다.');
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
    console.log('handlePasswordSubmit 함수 호출됨'); // Added
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (passwordChangeData.newPassword.length < 8) {
      setPasswordChangeError('새 비밀번호는 8자 이상이어야 합니다.');
      console.log('새 비밀번호 유효성 검사 실패'); // Added
      return;
    }

    if (passwordChangeData.newPassword !== confirmNewPassword) {
      setPasswordChangeError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      console.log('새 비밀번호 확인 불일치'); // Added
      return;
    }

    try {
      console.log('비밀번호 변경 요청 시작:', passwordChangeData); // Added
      const response = await axiosInstance.put('/users/me', {
        passwordChange: passwordChangeData,
      });
      console.log('비밀번호 변경 응답:', response.data); // Added
      if (response.data.success) {
        setIsChangingPassword(false); // Hide the password change form
        alert('비밀번호가 성공적으로 변경되었습니다.');
        setPasswordChangeData({ currentPassword: '', newPassword: '' });
        setConfirmNewPassword('');
      } else {
        // 백엔드가 success: false를 보낼 경우
        setPasswordChangeError(response.data.message || '비밀번호 변경에 실패했습니다.');
        console.log('비밀번호 변경 실패 (백엔드 응답):', response.data.message); // Added
      }
    } catch (err) {
      console.error("비밀번호 변경 오류:", err);
      console.log('비밀번호 변경 요청 중 오류 발생:', err.response?.data); // Added
      if (err.response && err.response.data) {
          // 백엔드에서 보낸 구체적인 오류 메시지 사용 (err.response.data.message)
          setPasswordChangeError(err.response.data.message || "알 수 없는 오류가 발생했습니다.");
      } else {
          // 네트워크 오류 또는 예상치 못한 오류
          setPasswordChangeError("비밀번호 변경 중 서버 오류가 발생했습니다.");
      }
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!localUserInfo) return <div>사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="profile-page">
      <h2>내 정보</h2>
      {editSuccess && <p className="success-message">{editSuccess}</p>}
      {(!isEditingProfile && !isChangingPassword) && (
        <div>
          <p><strong>아이디:</strong> {localUserInfo.loginId}</p>
          <p><strong>이름:</strong> {localUserInfo.name}</p>
          <p><strong>전화번호:</strong> {localUserInfo.phoneNumber}</p>
          <p><strong>이메일:</strong> {localUserInfo.email}</p>
          <p><strong>주소:</strong> {localUserInfo.address}</p>
          <button onClick={() => { setIsEditingProfile(true); setIsChangingPassword(false); }} className="btn btn-secondary">정보 수정</button>
          <button onClick={() => { setIsChangingPassword(true); setIsEditingProfile(false); }} className="btn btn-secondary">비밀번호 변경</button>
        </div>
      )}

      {isEditingProfile && (
        <form onSubmit={handleEditSubmit}>
          <h2>정보 수정</h2>
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
          <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary">취소</button>
        </form>
      )}

      {isChangingPassword && (
        <form onSubmit={handlePasswordSubmit}>
          <h2>비밀번호 변경</h2>
          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호:</label>
            <input type="password" id="currentPassword" value={passwordChangeData.currentPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호:</label>
            <input type="password" id="newPassword" value={passwordChangeData.newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">새 비밀번호 확인:</label>
            <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
          </div>
          {passwordChangeError && <p className="error-message">{passwordChangeError}</p>}
          {passwordChangeSuccess && <p className="success-message">{passwordChangeSuccess}</p>}
          <button type="submit" className="btn btn-primary">비밀번호 변경</button>
          <button type="button" onClick={() => setIsChangingPassword(false)} className="btn btn-secondary">취소</button>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;