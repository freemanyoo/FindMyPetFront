// src/components/LocationPostCard.jsx

import React from 'react';

const LocationPostCard = ({ post }) => {
    // 날짜 형식을 'YYYY. MM. DD'로 변환하는 함수
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    };

    return (
        <div className="post-card">
            <div className="post-image">
                <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="post-content">
                <h3 className="post-title">{post.locationName}</h3>
                <p className="post-meta">위도: {post.latitude.toFixed(4)}, 경도: {post.longitude.toFixed(4)}</p>
                <div className="post-date">
                    <i className="fas fa-calendar"></i>
                    {/* [수정] 현재 날짜 대신, 백엔드에서 받은 등록 날짜(regDate)를 표시 */}
                    {formatDate(post.regDate || post.createdDate)}
                </div>
            </div>
        </div>
    );
};

export default LocationPostCard;