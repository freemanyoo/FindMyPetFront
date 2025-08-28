
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const PostManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useAuth();
    const [selectedPostComments, setSelectedPostComments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchPosts = async (page) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/posts', {
                params: {
                    page: page,
                    size: 10,
                }
            });
            setPosts(response.data.data.content);
            setTotalPages(response.data.data.totalPages);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError('게시글 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole === 'ADMIN') {
            fetchPosts(page);
        } else {
            setError('관리자 권한이 필요합니다.');
            setLoading(false);
        }
    }, [userRole, page]);

    const handleDelete = async (postId) => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                // Use the admin delete endpoint
                await axiosInstance.delete(`/admin/posts/${postId}`);
                alert('게시글이 성공적으로 삭제되었습니다.');
                // Refresh the list after deletion
                fetchPosts(page);
            } catch (err) {
                console.error('Failed to delete post:', err);
                alert(`게시글 삭제 중 오류 발생: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleShowComments = async (postId) => {
        try {
            const response = await axiosInstance.get(`/posts/${postId}`);
            if (Array.isArray(response.data.comments)) {
                setSelectedPostComments(response.data.comments);
            } else {
                setSelectedPostComments([]); // Ensure it's an array even if comments are missing
                console.warn("Comments data is not an array:", response.data.comments);
            }
            setIsModalOpen(true);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            alert('댓글을 불러오는 데 실패했습니다.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            try {
                await axiosInstance.delete(`/admin/comments/${commentId}`);
                alert('댓글이 성공적으로 삭제되었습니다.');
                // Refresh comments after deletion
                const newComments = selectedPostComments.filter(c => c.commentId !== commentId);
                setSelectedPostComments(newComments);
            } catch (err) {
                console.error('Failed to delete comment:', err);
                alert(`댓글 삭제 중 오류 발생: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
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
                <div className="admin-card">
                    <h2 className="admin-card-header">게시글 관리</h2>
                    <div className="admin-card-body">
                        <table className="admin-table">
                    <thead><tr><th>ID</th><th>제목</th><th>동물 이름</th><th>유형</th><th>상태</th><th>작성자</th><th>작성일</th><th>액션</th></tr></thead>
                    <tbody>{posts.map((post) => (<tr key={post.id}><td>{post.postId}</td><td>{post.title}</td><td>{post.animalName}</td><td>{post.postType}</td><td>{post.status}</td><td>{post.author?.name || '알 수 없음'}</td><td>{new Date(post.createdAt).toLocaleDateString()}</td><td><button onClick={() => handleShowComments(post.id)}>댓글 보기</button><button onClick={() => handleDelete(post.id)}>삭제</button></td></tr>))}</tbody>
                </table>
                    </div>
                </div>
            )}
            <div className="admin-pagination">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
                    이전
                </button>
                <span>{page + 1} / {totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1}>
                    다음
                </button>
            </div>

            {isModalOpen && (
                <div className={`modal ${isModalOpen ? 'active' : ''}`}>
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>댓글 관리</h2>
                        {selectedPostComments.length === 0 ? (
                            <p>댓글이 없습니다.</p>
                        ) : (
                            <ul>
                                {selectedPostComments.map(comment => (
                                    <li key={comment.commentId}>
                                        <p>{comment.content}</p>
                                        <p>작성자: {comment.userName}</p>
                                        <button onClick={() => handleDeleteComment(comment.commentId)}>삭제</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManagementPage;
