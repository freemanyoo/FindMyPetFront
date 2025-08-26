import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CommentComponent from '../components/comment/CommentComponent';
import axiosInstance from '../api/axiosInstance'; // API 호출을 위해 import

const PostDetailPage = () => {
    const { postId } = useParams();

    // 1. 게시글, 로딩, 에러 상태를 관리할 State 추가
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. postId가 변경될 때마다 게시글 데이터를 불러오는 useEffect 추가
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                // 템플릿 리터럴을 사용하여 postId를 동적으로 포함
                const response = await axiosInstance.get(`/api/posts/${postId}`);
                setPost(response.data);
            } catch (err) {
                console.error("게시글을 불러오는 중 오류 발생:", err);
                setError("게시글을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]); // postId가 바뀔 때마다 다시 API 호출

    // 3. 로딩 및 에러 상태에 따른 UI 처리
    if (loading) return <div>게시글을 불러오는 중...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!post) return <div>해당 게시글이 없습니다.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <div className="post-detail">
                <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    {/* 4. 실제 API로 받아온 데이터 표시 */}
                    {post.title}
                </h1>
                {/* 작성자 정보 등 추가적인 데이터 표시 가능 */}
                <p><strong>작성자:</strong> {post.author ? post.author.name : '알 수 없음'}</p>
                <p style={{ minHeight: '200px', lineHeight: '1.6' }}>
                    {post.content}
                </p>
            </div>

            <hr style={{ margin: '40px 0' }} />

            <div>
                {/* 5. 실제 post.completed 값을 CommentComponent에 전달 */}
                <CommentComponent postId={postId} isPostCompleted={post.completed} />
            </div>
        </div>
    );
};

export default PostDetailPage;