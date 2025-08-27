
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance'; // Assuming axiosInstance is correctly configured with auth headers
import { useAuth } from '../../context/AuthContext'; // To get the token if needed, though axiosInstance should handle it

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useAuth(); // To ensure only ADMIN can access, though AdminRoute already handles this

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // The API spec says GET /api/admin/users, and axiosInstance should handle the token
                const response = await axiosInstance.get('/admin/users');
                setUsers(response.data.data); // Corrected: response.data.data is directly the list of users
            } catch (err) {
                console.error('Failed to fetch users:', err);
                setError('사용자 목록을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if user is admin (AdminRoute already handles this, but good for defensive coding)
        if (userRole === 'ADMIN') {
            fetchUsers();
        } else {
            setError('관리자 권한이 필요합니다.');
            setLoading(false);
        }
    }, [userRole]); // Re-fetch if userRole changes (though it shouldn't change often)

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류: {error}</div>;
    }

    return (
        <div>
            <h1>사용자 관리</h1>
            {users.length === 0 ? (
                <p>등록된 사용자가 없습니다.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>로그인 ID</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>역할</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.loginId}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserManagementPage;
