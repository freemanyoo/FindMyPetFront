import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const CommentComponent = ({ postId, isPostCompleted }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const { user, userRole } = useAuth(); // Get userRole here

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch comments (can be called again after delete/update)
    const fetchComments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/api/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error("댓글을 불러오는 중 오류가 발생했습니다.", error);
            setError("댓글을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const commentDTO = { content: newComment, postId: postId };
        formData.append("commentDTO", new Blob([JSON.stringify(commentDTO)], { type: "application/json" }));
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }
        try {
            const response = await axiosInstance.post(`/api/posts/${postId}/comments`, formData);
            setComments([...comments, response.data]);
            setNewComment("");
            setImageFile(null);
            e.target.imageFile.value = "";
        } catch (error) {
            console.error("댓글 작성 중 오류가 발생했습니다.", error);
            alert("댓글 작성에 실패했습니다.");
        }
    };

    const handleDelete = async (commentId) => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                // Determine which delete endpoint to use
                const deleteEndpoint = userRole === 'ADMIN' ? `/api/admin/comments/${commentId}` : `/api/comments/${commentId}`;
                
                const response = await axiosInstance.delete(deleteEndpoint);
                // Assuming the backend returns success:true or similar for successful deletion
                // The CommonResponse from backend has success:true/false
                if (response.data.success) { // Check for success property in response.data
                    alert("댓글이 성공적으로 삭제되었습니다.");
                    // Refresh comments after deletion
                    fetchComments();
                } else {
                    alert(`댓글 삭제 실패: ${response.data.message || '알 수 없는 오류'}`);
                }
            } catch (error) {
                console.error("댓글 삭제 중 오류가 발생했습니다.", error);
                alert(`댓글 삭제 중 오류 발생: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleUpdateSubmit = async (e, commentId) => {
        e.preventDefault();
        const formData = new FormData();
        const commentDTO = { content: editingContent };
        formData.append("commentDTO", new Blob([JSON.stringify(commentDTO)], { type: "application/json" }));

        try {
            const response = await axiosInstance.put(`/api/comments/${commentId}`, formData);
            setComments(
                comments.map((comment) =>
                    comment.commentId === commentId ? response.data : comment
                )
            );
            setEditingCommentId(null);
            setEditingContent("");
        } catch (error) {
            console.error("댓글 수정 중 오류가 발생했습니다.", error);
            alert("댓글 수정에 실패했습니다.");
        }
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

            {loading && <div>댓글을 불러오는 중...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {!loading && !error && (
                <ul className="comment-list">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
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
                                            <strong>사용자 ID: {comment.userId}</strong>
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
                                        {/* Show edit/delete buttons if user is author OR if user is ADMIN */}
                                        {(user && user.userId === comment.userId) || userRole === 'ADMIN' ? (
                                            <div className="comment-actions">
                                                {user && user.userId === comment.userId && ( // Only author can edit
                                                    <button onClick={() => {
                                                        setEditingCommentId(comment.commentId);
                                                        setEditingContent(comment.content);
                                                    }}>수정</button>
                                                )}
                                                <button onClick={() => handleDelete(comment.commentId)}>삭제</button>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </li>
                        ))
                    ) : (
                        <p>아직 댓글이 없습니다.</p>
                    )}
                </ul>
            )}
        </div>
    );
};

export default CommentComponent;