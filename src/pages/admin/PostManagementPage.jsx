
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const PostManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useAuth();

    // Function to fetch posts (can be called again after delete)
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/posts', {
                params: {
                    page: 1,
                    size: 10,
                    type: 'MISSING'
                }
            });
            setPosts(response.data.dtoList);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError('게시글 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole === 'ADMIN') {
            fetchPosts();
        } else {
            setError('관리자 권한이 필요합니다.');
            setLoading(false);
        }
    }, [userRole]);

    const handleDelete = async (postId) => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                // Use the admin delete endpoint
                const response = await axiosInstance.delete(`/admin/posts/${postId}`);
                if (response.data.success) {
                    alert('게시글이 성공적으로 삭제되었습니다.');
                    // Refresh the list after deletion
                    fetchPosts();
                } else {
                    alert(`게시글 삭제 실패: ${response.data.message || '알 수 없는 오류'}`);
                }
            } catch (err) {
                console.error('Failed to delete post:', err);
                alert(`게시글 삭제 중 오류 발생: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류: {error}</div>;
    }

    return (
        <div>
            <h1>게시글 관리</h1>
            {posts.length === 0 ? (
                <p>등록된 게시글이 없습니다.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>제목</th>
                            <th>동물 이름</th>
                            <th>유형</th>
                            <th>상태</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>액션</th> {/* New column for actions */}
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.postId}>
                                <td>{post.postId}</td>
                                <td>{post.title}</td>
                                <td>{post.animalName}</td>
                                <td>{post.postType}</td>
                                <td>{post.status}</td>
                                <td>{post.author?.name || '알 수 없음'}</td>
                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => handleDelete(post.postId)}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PostManagementPage;
