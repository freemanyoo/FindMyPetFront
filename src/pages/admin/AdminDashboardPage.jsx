
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {userRole} = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                // API spec: GET /api/stats/dashboard
                const response = await axiosInstance.get('/stats/dashboard');
                setStats(response.data.data); // Assuming response structure { success: true, data: { ...stats... } }
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('대시보드 통계를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (userRole === 'ADMIN') {
            fetchStats();
        } else {
            setError('관리자 권한이 필요합니다.');
            setLoading(false);
        }
    }, [userRole]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류: {error}</div>;
    }

    return (
        <div className="admin-container">
            <h1>관리자 대시보드</h1>
            {stats ? (
                <div className="admin-card">
                    <h2 className="admin-card-header">통계 요약</h2>
                    <div className="admin-card-body admin-stats-grid">
                        <div className="admin-stat-item"><h4>총 게시글 수</h4><p>{stats.totalPosts}</p></div>
                        <div className="admin-stat-item"><h4>실종 게시글 수</h4><p>{stats.missingPosts}</p></div>
                        <div className="admin-stat-item"><h4>보호 게시글 수</h4><p>{stats.shelterPosts}</p></div>
                        <div className="admin-stat-item"><h4>완료된 게시글 수</h4><p>{stats.completedPosts}</p></div>
                        <div className="admin-stat-item"><h4>오늘 등록된 게시글 수</h4><p>{stats.todayPosts}</p></div>
                    </div>
                </div>
            ) : (
                <p>통계 정보를 불러올 수 없습니다.</p>
            )}

            {stats && (
                <div className="admin-card">
                    <h3 className="admin-card-header">최근 완료된 게시글</h3>
                    <div className="admin-card-body">
                        {stats.recentCompletions && stats.recentCompletions.length > 0 ? (
                            <ul className="admin-list">
                                {stats.recentCompletions.map((completion) => (
                                    <li key={completion.postId}>
                                        {completion.title} (완료일: {new Date(completion.completedAt).toLocaleDateString()})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>최근 완료된 게시글이 없습니다.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
