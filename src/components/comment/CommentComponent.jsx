import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import './CommentComponent.css';

const CommentComponent = ({ postId, isPostCompleted }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 페이징 관련 상태
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchComments = useCallback(async (currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/posts/${postId}/comments?page=${currentPage}&size=10`);
            setComments(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("댓글을 불러오는 중 오류가 발생했습니다.", error);
            setError("댓글을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [postId]);

    // page 또는 postId가 변경될 때마다 댓글을 다시 불러옴
    useEffect(() => {
        // postId가 변경되면 page를 0으로 리셋
        setPage(0);
    }, [postId]);

    useEffect(() => {
        fetchComments(page);
    }, [page, fetchComments]);


    // 페이지 번호 클릭 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    // 댓글 작성 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const commentDTO = { content: newComment, postId: postId };
        formData.append("commentDTO", new Blob([JSON.stringify(commentDTO)], { type: "application/json" }));
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }
        try {
            await axiosInstance.post(`/posts/${postId}/comments`, formData);

            // ✅✅✅ 수정된 부분 ✅✅✅
            // 새 댓글 작성 후에는 0페이지(첫 페이지)를 다시 불러와서
            // 최신 상태를 반영하고 화면도 첫 페이지로 이동시킵니다.
            if (page === 0) {
                // 이미 첫 페이지를 보고 있었다면 바로 데이터를 다시 불러옴
                fetchComments(0);
            } else {
                // 다른 페이지를 보고 있었다면 페이지 상태를 0으로 변경
                // (useEffect에 의해 자동으로 0페이지 데이터가 로드됨)
                setPage(0);
            }

            setNewComment("");
            setImageFile(null);
            if (e.target.imageFile) e.target.imageFile.value = "";
        } catch (error) {
            console.error("댓글 작성 중 오류가 발생했습니다.", error);
            alert("댓글 작성에 실패했습니다.");
        }
    };

    // 댓글 삭제 핸들러
    const handleDelete = async (commentId) => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                await axiosInstance.delete(`/comments/${commentId}`);
                // 댓글 삭제 후 현재 페이지를 다시 불러옴
                fetchComments(page);
            } catch (error) {
                console.error("댓글 삭제 중 오류가 발생했습니다.", error);
                alert("댓글 삭제에 실패했습니다.");
            }
        }
    };

    // 댓글 수정 핸들러
    const handleUpdateSubmit = async (e, commentId) => {
        e.preventDefault();
        const formData = new FormData();
        const commentDTO = { content: editingContent };
        formData.append("commentDTO", new Blob([JSON.stringify(commentDTO)], { type: "application/json" }));
        try {
            await axiosInstance.put(`/comments/${commentId}`, formData);
            // 댓글 수정 후 현재 페이지를 다시 불러옴
            fetchComments(page);
            setEditingCommentId(null);
            setEditingContent("");
        } catch (error) {
            console.error("댓글 수정 중 오류가 발생했습니다.", error);
            alert("댓글 수정에 실패했습니다.");
        }
    };

    // 페이지 번호 목록을 렌더링하는 컴포넌트
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        for (let i = 0; i < totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <nav className="pagination-container">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="pagination-button"
                >
                    이전
                </button>
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`pagination-button ${page === number ? 'active' : ''}`}
                    >
                        {number + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="pagination-button"
                >
                    다음
                </button>
            </nav>
        );
    };

    return (
        <div className="comment-container">
            {isPostCompleted ? (
                <div className="comment-form-disabled" style={{ padding: '20px', backgroundColor: '#f1f1f1', textAlign: 'center', borderRadius: '8px' }}>
                    <p>찾기 완료된 게시글에는 댓글을 작성할 수 없습니다.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="comment-form">
                    <textarea
                        className="comment-textarea"
                        placeholder="댓글을 입력하세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                    ></textarea>
                    <div className="comment-form-actions">
                        <input
                            type="file"
                            name="imageFile"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            accept="image/*"
                        />
                        <button type="submit" className="comment-submit-btn">등록</button>
                    </div>
                </form>
            )}

            <h3 className="comment-title" style={{ marginTop: '40px' }}>댓글 목록</h3>

            {loading ? (
                <div>댓글을 불러오는 중...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : comments.length > 0 ? (
                <ul className="comment-list">
                    {comments.map((comment) => (
                        <li key={comment.commentId} className="comment-item">
                            {editingCommentId === comment.commentId ? (
                                <form onSubmit={(e) => handleUpdateSubmit(e, comment.commentId)}>
                                    <textarea
                                        className="comment-textarea"
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        required
                                    />
                                    <button type="submit">저장</button>
                                    <button type="button" onClick={() => setEditingCommentId(null)}>취소</button>
                                </form>
                            ) : (
                                <div>
                                    <div className="comment-author">
                                        <strong>{comment.userName} ({comment.loginId})</strong>
                                    </div>
                                    <p className="comment-content">{comment.content}</p>
                                    {comment.imageUrl && (
                                        <img
                                            src={`http://localhost:8080/upload/${comment.imageUrl}`}
                                            alt="댓글 이미지"
                                            className="comment-image"
                                            style={{ maxWidth: "200px" }}
                                        />
                                    )}
                                    <div className="comment-date">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </div>
                                    {user && user.userId === comment.userId && (
                                        <div className="comment-actions">
                                            <button onClick={() => {
                                                setEditingCommentId(comment.commentId);
                                                setEditingContent(comment.content);
                                            }}>수정</button>
                                            <button onClick={() => handleDelete(comment.commentId)}>삭제</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>아직 댓글이 없습니다.</p>
            )}

            <Pagination />
        </div>
    );
};

export default CommentComponent;
