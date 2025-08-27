import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import '../auth/AuthForm.css'; // 공통 CSS import

function ProfilePage() {
    const { user, login } = useAuth();
    const [localUserInfo, setLocalUserInfo] = useState(user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [editFormData, setEditFormData] = useState({ name: '', phoneNumber: '', address: '' });
    const [passwordChangeData, setPasswordChangeData] = useState({ currentPassword: '', newPassword: '' });
    const [passwordChangeError, setPasswordChangeError] = useState('');
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axiosInstance.get('/api/users/me');
                const fetchedUser = response.data.data;
                setLocalUserInfo(fetchedUser);
                setEditFormData({
                    name: fetchedUser.name,
                    phoneNumber: fetchedUser.phoneNumber,
                    address: fetchedUser.address,
                });
            } catch (err) {
                // ✅ console.error에 err를 추가하여 경고를 해결하고 디버깅 정보를 남깁니다.
                console.error("Fetch user info error:", err);
                setError('사용자 정보를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

    const handleEditChange = (e) => {
        const { id, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.put('/api/users/me', editFormData);
            alert('회원 정보가 성공적으로 수정되었습니다.');
            setIsEditing(false);
            const updatedUser = { ...user, ...editFormData };
            login(updatedUser, localStorage.getItem('accessToken'), localStorage.getItem('refreshToken'));
            setLocalUserInfo(updatedUser);
        } catch (err) {
            // ✅ console.error에 err를 추가합니다.
            console.error("Update user info error:", err);
            setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };

    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setPasswordChangeData((prev) => ({ ...prev, [id]: value }));
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
            await axiosInstance.put('/api/users/me', { passwordChange: passwordChangeData });
            setPasswordChangeSuccess('비밀번호가 성공적으로 변경되었습니다.');
            setPasswordChangeData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            // ✅ console.error에 err를 추가합니다.
            console.error("Password change error:", err);
            setPasswordChangeError(err.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (!localUserInfo) return <div>사용자 정보를 찾을 수 없습니다. 로그인 해주세요.</div>;

    return (
        <div className="auth-page-container">
            <h2 className="auth-title">{!isEditing ? '내 정보' : '정보 수정'}</h2>
            <div className="auth-card">
                {!isEditing ? (
                    <div className="profile-info">
                        <p><strong>아이디</strong> {localUserInfo.loginId}</p>
                        <p><strong>이름</strong> {localUserInfo.name}</p>
                        <p><strong>전화번호</strong> {localUserInfo.phoneNumber}</p>
                        <p><strong>이메일</strong> {localUserInfo.email}</p>
                        <p><strong>주소</strong> {localUserInfo.address}</p>
                        <button onClick={() => setIsEditing(true)} className="auth-btn">정보 수정</button>
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
                            <label htmlFor="address">주소:</label>
                            <input type="text" id="address" value={editFormData.address} onChange={handleEditChange} required />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <div className="button-group">
                            <button type="submit" className="auth-btn">저장</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="auth-btn btn-secondary">취소</button>
                        </div>
                    </form>
                )}
            </div>

            <div className="auth-card" style={{ marginTop: '30px' }}>
                <h3 className="auth-title" style={{fontSize: '1.5rem'}}>비밀번호 변경</h3>
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
                    <button type="submit" className="auth-btn">비밀번호 변경</button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;
