import React from 'react';
import { useParams } from 'react-router-dom';
import CommentComponent from '../components/comment/CommentComponent';

const PostDetailPage = () => {
    const { postId } = useParams();

    // ✅ 1. 게시글 상세 정보가 있다고 가정 (API 연동 전 임시 데이터)
    // 나중에 이 부분은 실제 API 호출로 대체됩니다.
    const post = {
        id: postId,
        title: `게시글 제목입니다 (ID: ${postId})`,
        content: "여기는 게시글의 상세 내용이 들어가는 부분입니다...",
        completed: true, // ◀️ "찾기 완료" 상태라고 가정! (false로 바꿔서도 테스트 해보세요)
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <div className="post-detail">
                <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    {post.title}
                </h1>
                <p style={{ minHeight: '200px', lineHeight: '1.6' }}>
                    {post.content}
                </p>
            </div>

            <hr style={{ margin: '40px 0' }} />

            <div>
                {/* ✅ 2. CommentComponent에 post의 completed 상태를 prop으로 전달 */}
                <CommentComponent postId={postId} isPostCompleted={post.completed} />
            </div>
        </div>
    );
};

export default PostDetailPage;