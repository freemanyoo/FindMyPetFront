import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
    const isCompleted = post.status === 'COMPLETED';
    const typeText = post.postType === 'MISSING' ? '실종' : '보호';

    const getStatusBadge = () => {
        if (isCompleted) {
            return <div className="status-badge status-completed">가족 찾음!</div>;
        }
        return <div className="status-badge status-active">{post.postType === 'MISSING' ? '찾는 중' : '보호 중'}</div>;
    };

    return (
        <Link to={`/posts/${post.postId}`} className="post-card">
            <div className="post-image" style={{ backgroundImage: `url(${post.thumbnailUrl})` }}>
                {!post.thumbnailUrl && <i className="fas fa-image"></i>}
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