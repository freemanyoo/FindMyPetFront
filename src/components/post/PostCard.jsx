import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css'; // ✅ 새로 만든 CSS 파일을 import 합니다.

const PostCard = ({ post }) => {
    const isCompleted = post.status === 'COMPLETED';
    const typeText = post.postType === 'MISSING' ? '실종' : '보호';

    // ✅ 썸네일 URL을 백엔드 서버 주소를 포함한 전체 경로로 만듭니다.
    const thumbnailUrl = post.thumbnailUrl
        ? `http://localhost:8080/upload/${post.thumbnailUrl}`
        : null;

    const getStatusBadge = () => {
        if (isCompleted) {
            return <div className="status-badge status-completed">가족 찾음!</div>;
        }
        return <div className="status-badge status-active">{post.postType === 'MISSING' ? '찾는 중' : '보호 중'}</div>;
    };

    return (
        // Link 컴포넌트는 그대로 유지합니다.
        <Link to={`/posts/${post.postId}`} className="post-card">
            {/* ✅ 수정된 thumbnailUrl을 backgroundImage로 사용합니다. */}
            <div className="post-image" style={{ backgroundImage: `url(${thumbnailUrl})`, backgroundColor: '#e0e0e0' }}>
                {!thumbnailUrl && <i className="fas fa-image"></i>}
                {getStatusBadge()}
            </div>
            <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                    <div className="animal-info">
                        <strong>{post.animalName || '이름 모름'}</strong>
                        <span>{typeText} · {post.author.name}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PostCard;