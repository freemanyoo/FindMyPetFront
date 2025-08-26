import { useEffect, useState } from "react";
// import axios from "axios"; // ◀️ 기존 axios import 삭제
import axiosInstance from "../../api/axiosInstance"; // ✅ 새로 만든 인스-턴스를 import

const CommentComponent = ({ postId, isPostCompleted }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    useEffect(() => {
        const fetchComments = async () => {
            try {
                // ✅ axios -> axiosInstance 로 변경
                const response = await axiosInstance.get(`/api/posts/${postId}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error("댓글을 불러오는 중 오류가 발생했습니다.", error);
            }
        };
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
            // ✅ axios -> axiosInstance 로 변경
            const response = await axiosInstance.post(`/api/posts/${postId}/comments`, formData, {
                // ✅ 헤더 설정이 더 이상 필요 없습니다. axiosInstance가 자동으로 처리합니다.
            });
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
                // ✅ axios -> axiosInstance 로 변경
                await axiosInstance.delete(`/api/comments/${commentId}`);
                setComments(comments.filter((comment) => comment.commentId !== commentId));
            } catch (error) {
                console.error("댓글 삭제 중 오류가 발생했습니다.", error);
                alert("댓글 삭제에 실패했습니다.");
            }
        }
    };

    const handleUpdateSubmit = async (e, commentId) => {
        e.preventDefault();
        const formData = new FormData();
        const commentDTO = { content: editingContent };
        formData.append("commentDTO", new Blob([JSON.stringify(commentDTO)], { type: "application/json" }));

        try {
            // ✅ axios -> axiosInstance 로 변경
            const response = await axiosInstance.put(`/api/comments/${commentId}`, formData, {
                // ✅ 헤더 설정이 더 이상 필요 없습니다.
            });
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
                                    <strong>사용자 ID: {comment.userId}</strong>
                                </div>
                                <p className="comment-content">{comment.content}</p>
                                {comment.imageUrl && (
                                    <img
                                        src={`/images/${comment.imageUrl}`}
                                        alt="댓글 이미지"
                                        className="comment-image"
                                        style={{ maxWidth: "200px" }}
                                    />
                                )}
                                <div className="comment-date">
                                    {new Date(comment.createdAt).toLocaleString()}
                                </div>
                                <div className="comment-actions">
                                    <button onClick={() => {
                                        setEditingCommentId(comment.commentId);
                                        setEditingContent(comment.content);
                                    }}>수정</button>
                                    <button onClick={() => handleDelete(comment.commentId)}>삭제</button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentComponent;