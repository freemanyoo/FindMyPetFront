// src/components/LocationBoard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationPostCard from './LocationPostCard.jsx';

const API_BASE_URL = 'http://localhost:8080/api/locations';

const LocationBoard = ({ onShowPostForm }) => {
    const [posts, setPosts] = useState([]);

    const fetchLocations = async () => {
        try {
            // 1. 로컬 스토리지에서 토큰을 가져옵니다.
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error("로그인 토큰이 없어 위치 목록을 불러올 수 없습니다.");
                // 필요하다면 로그인 페이지로 보내는 로직 추가
                return;
            }

            // 2. GET 요청 시 headers에 Authorization을 추가합니다.
            const response = await axios.get(API_BASE_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setPosts(response.data);
        } catch (error) {
            console.error("위치 목록을 불러오는 데 실패했습니다:", error);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    return (
        <section id="board" className="board-section">
            <div className="board-header">
                <h2 className="board-title">
                    <i className="fas fa-map"></i> 위치 목록
                </h2>
                <div className="board-controls">
                    <button className="btn btn-primary" onClick={onShowPostForm}>
                        <i className="fas fa-plus"></i> 위치 등록
                    </button>
                </div>
            </div>
            <div className="posts-grid">
                {posts.length > 0 ? (
                    posts.map(post => (
                        // [수정] 백엔드 DTO의 고유 ID인 locationId를 key로 사용
                        <LocationPostCard key={post.locationId} post={post} />
                    ))
                ) : (
                    <p>등록된 위치가 없습니다. 첫 번째 위치를 등록해보세요!</p>
                )}
            </div>
        </section>
    );
};

export default LocationBoard;