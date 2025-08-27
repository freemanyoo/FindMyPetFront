import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css'; // ✅ CSS 파일 import

function ProfilePage() {
    const { user, login } = useAuth();
    const [localUserInfo, setLocalUserInfo] = useState(user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [editFormData, setEditFormData] = useState({
        name: '',
        phoneNumber: '',
        address: '',
    });

    const [passwordChangeData, setPasswordChangeData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [passwordChangeError, setPasswordChangeError] = useState('');
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axiosInstance.get('/users/me');
                if (response.data.success) {
                    const fetchedUser = response.data.data;
                    setLocalUserInfo(fetchedUser);
                    setEditFormData({
                        name: fetchedUser.name,
                        phoneNumber: fetchedUser.phoneNumber,
                        address: fetchedUser.address,
                    });
                } else {
                    setError('사용자 정보를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                setError('서버 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleEditChange = (e) => {
        const { id, value } = e.target;
        setEditFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axiosInstance.put('/users/me', editFormData);
            if (response.data.success) {
                alert('회원 정보가 성공적으로 수정되었습니다.');
                setIsEditing(false);
                const updatedUser = { ...user, ...editFormData };
                login(updatedUser, localStorage.getItem('accessToken'), localStorage.getItem('refreshToken'));
                setLocalUserInfo(updatedUser);
            } else {
                setError('회원 정보 수정에 실패했습니다.');
            }
        } catch (err) {
            setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };

    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setPasswordChangeData((prevData) => ({ ...prevData, [id]: value }));
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
                setPasswordChangeError('비밀번호 변경에 실패했습니다.');
            }
        } catch (err) {
            setPasswordChangeError(err.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (!localUserInfo) return <div>사용자 정보를 찾을 수 없습니다. 로그인 해주세요.</div>;

    return (
        <div className="profile-page-container">
            <div className="profile-card">
                {!isEditing ? (
                    <div>
                        <h2>내 정보</h2>
                        <div className="profile-info">
                            <p><strong>아이디</strong> {localUserInfo.loginId}</p>
                            <p><strong>이름</strong> {localUserInfo.name}</p>
                            <p><strong>전화번호</strong> {localUserInfo.phoneNumber}</p>
                            <p><strong>이메일</strong> {localUserInfo.email}</p>
                            <p><strong>주소</strong> {localUserInfo.address}</p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary">정보 수정</button>
                    </div>
                ) : (
                    <div>
                        <h2>정보 수정</h2>
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
                                <button type="submit" className="btn btn-primary">저장</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">취소</button>
                            </div>
                        </form>
                    </div>
                )}

                <hr style={{margin: '40px 0'}} />

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
        </div>
    );
}

export default ProfilePage;
