// src/components/LocationPostForm.jsx

import React, { useState, useRef } from 'react';
import axios from 'axios';
import KakaoMap from './KakaoMap';

const API_BASE_URL = 'http://localhost:8080/api/locations';

const LocationPostForm = ({ onCancel, onSubmitSuccess }) => {
    const [formData, setFormData] = useState({
        locationName: '',
        latitude: 37.566826,  // 기본 위도 (서울시청)
        longitude: 126.9786567, // 기본 경도 (서울시청)
    });
    const mapRef = useRef(null);

    // KakaoMap 컴포넌트에서 위치가 선택/검색될 때 호출될 함수
    const handleLocationSelect = (selectedLocation) => {
        setFormData(prev => ({
            ...prev,
            locationName: selectedLocation.locationName,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
        }));
    };

    // 검색 버튼 클릭 핸들러
    const handleSearchClick = () => {
        const searchInput = document.querySelector('input[name="search"]');
        if (searchInput && mapRef.current) {
            mapRef.current.searchPlace(searchInput.value);
        }
    };

    // 위치명 입력 필드 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 폼 제출 핸들러
    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            // [수정] 비어있던 데이터를 formData로 채워서 전송
            await axios.post(API_BASE_URL, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('위치 등록 성공!');
            onSubmitSuccess(); // 부모에게 성공 사실을 알림
        } catch (error) {
            console.error('위치 등록에 실패했습니다:', error);
            alert('위치 등록에 실패했습니다.');
        }
    };

    return (
        <section id="postForm" className="form-section">
            <div className="form-container">
                <h2 className="form-title">위치 등록</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">위치명</label>
                        <input type="text" name="locationName" className="form-input" placeholder="지도에서 선택하거나 직접 입력하세요" value={formData.locationName} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">위치 검색 및 선택</label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                            <input type="text" name="search" className="form-input" placeholder="검색할 장소명을 입력하세요" />
                            <button type="button" className="btn btn-primary" style={{ flexShrink: 0 }} onClick={handleSearchClick}>검색</button>
                        </div>
                        <KakaoMap ref={mapRef} isSelectable={true} initialLocation={formData} onLocationSelect={handleLocationSelect}/>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-outline" onClick={onCancel}>취소</button>
                        <button type="submit" className="btn btn-primary">등록하기</button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default LocationPostForm;