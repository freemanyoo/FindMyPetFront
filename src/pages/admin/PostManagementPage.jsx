
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext'; // To ensure only ADMIN can access, though AdminRoute already handles this

const PostManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useAuth(); // To ensure only ADMIN can access

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                // API spec: GET /api/posts?page=0&size=9 (default values)
                // For admin, we might want to fetch all types, so no 'type' query param initially
                const response = await axiosInstance.get('/posts', {
                    params: {
                        page: 1,
                        size: 10, // Adjust size as needed
                        type: 'MISSING' // Required parameter for GET /api/posts
                    }
                });
                // Assuming response structure: { data: { posts: [...], pagination: {...} } }
                // Based on PostController.java, it returns PageResponseDto<PostListResponseDto>
                // So, response.data.data.content should be the list of posts
                setPosts(response.data.dtoList);
            } catch (err) {
                console.error('Failed to fetch posts:', err);
                setError('게시글 목록을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (userRole === 'ADMIN') {
            fetchPosts();
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
                                <td>{post.author?.name || '알 수 없음'}</td> {/* Assuming author has a name */}
                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PostManagementPage;
