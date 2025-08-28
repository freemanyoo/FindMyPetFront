import React from 'react';
import { Link } from 'react-router-dom';

// 게시판 그리드에 표시될 개별 카드 섹션

const PostCard = ({ post }) => {
    // 썸네일 이미지가 없으면 기본 아이콘 표시
    const renderThumbnail = () => {
        if (post.thumbnailUrl) {
            // 실제 이미지 URL을 사용하도록 수정해야 할 수 있습니다. 예: `http://localhost:8080/images/${post.thumbnailUrl}`
            return <img src={post.thumbnailUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
        }
        return <i className="fas fa-image"></i>;
    };

    const getStatusText = () => {
        if (post.status === 'COMPLETED') {
            return post.postType === 'MISSING' ? '찾았어요!' : '가족 찾음!';
        }
        return post.postType === 'MISSING' ? '찾는 중' : '보호 중';
    };

    return (
        <Link to={`/post/${post.postId}`} className="post-card">
            <div className="post-image">
                {renderThumbnail()}
                <div className={`status-badge ${post.status === 'ACTIVE' ? 'status-active' : 'status-completed'}`}>
                    {getStatusText()}
                </div>
            </div>
            <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                    <div className="animal-info">
                        <strong>{post.animalName}</strong>
                        <span>{post.animalCategory} · {post.animalBreed}</span>
                    </div>
                </div>
                <div className="post-date">
                    <i className="fas fa-calendar"></i>
                    {new Date(post.createdAt).toLocaleDateString()} · {post.author.name}
                </div>
            </div>
        </Link>
    );
};

export default PostCard;