import React, { useState, useEffect } from 'react';
import SearchFilterBox from '../../components/board/SearchFilterBox.jsx';
import './SearchFilterPage.css';

const SearchFilterPage = () => {
    const [searchResults, setSearchResults] = useState({
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentCriteria, setCurrentCriteria] = useState({});

    useEffect(() => {
        handleSearch({});
    }, []);

    // UI criteria -> 백엔드 쿼리 파라미터로 변환
    const toBackendParams = (criteria, page = 0) => {
        const params = new URLSearchParams();

        // 기본 페이징/정렬
        params.append('page', String(page));
        params.append('size', criteria.size || '20');
        params.append('sortBy', criteria.sortBy || 'createdAt');
        params.append('sortDir', criteria.sortDir || 'DESC');

        // 제목
        if (criteria.title) params.append('title', criteria.title);

        // 동물 이름 (author 필드를 animalName으로 매핑)
        if (criteria.author) {
            params.append('animalName', criteria.author);
        }

        // 날짜 범위
        if (criteria.lostDateFrom) params.append('lostTimeFrom', criteria.lostDateFrom);
        if (criteria.lostDateTo) params.append('lostTimeTo', criteria.lostDateTo);

        // 👇 [수정] cityProvince와 district를 합치는 로직 대신, location 키워드를 직접 사용
        if (criteria.location) {
            params.append('location', criteria.location);
        }

        // 축종/품종
        if (criteria.animalType) params.append('animalCategory', criteria.animalType);
        if (criteria.breed) params.append('animalBreed', criteria.breed);

        // 상태 토글: isFound(true/false/null) -> status(COMPLETED/ACTIVE)
        if (criteria.isFound === true) params.append('status', 'COMPLETED');
        else if (criteria.isFound === false) params.append('status', 'ACTIVE');

        return params;
    };

    const handleSearch = async (criteria, page = 0) => {
        setLoading(true);
        setError(null);
        try {
            const searchParams = toBackendParams(criteria, page);
            const response = await fetch(`/api/posts?${searchParams}`);
            if (!response.ok) throw new Error('검색 요청이 실패했습니다.');

            const data = await response.json();
            setSearchResults(data);
            setCurrentCriteria(criteria);
        } catch (err) {
            setError(err.message);
            console.error('검색 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        handleSearch(currentCriteria, newPage);
    };

    const handleFilterChange = (criteria) => {
        setCurrentCriteria(criteria);
    };

    const toggleFoundStatus = async (postId) => {
        try {
            const response = await fetch(`/api/posts/${postId}/complete`, { method: 'PATCH' });
            if (!response.ok) throw new Error('상태 변경에 실패했습니다.');

            handleSearch(currentCriteria, searchResults.page);
        } catch (err) {
            console.error('상태 토글 오류:', err);
            alert('상태 변경에 실패했습니다.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const pick = (post, ...keys) => {
        for (const k of keys) {
            const v = post[k];
            if (v !== undefined && v !== null && v !== '') return v;
        }
        return undefined;
    };

    const getLocation = (post) => {
        // [수정] 표시 로직도 단순하게 post.location을 우선적으로 사용하도록 변경
        return pick(post, 'location') || '-';
    };

    const getAuthor = (post) => {
        return post.author?.name || '익명';
    };

    const isFound = (post) => {
        return post.status && String(post.status).toUpperCase() === 'COMPLETED';
    };

    return (
        <div className="search-filter-page">
            <div className="page-header">
                <h1>분실 반려동물 찾기</h1>
                <p>소중한 가족을 찾아주세요</p>
            </div>

            <SearchFilterBox onSearch={handleSearch} onFilterChange={handleFilterChange} />

            <div className="search-results-section">
                <div className="results-header">
                    <div className="results-count">
                        총 <span className="count-number">{searchResults.totalElements}</span>건의 검색 결과
                    </div>
                </div>

                {error && <div className="error-message">⚠️ {error}</div>}

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>검색 중입니다...</p>
                    </div>
                ) : (
                    <>
                        <div className="results-grid">
                            {searchResults.content.map((post) => {
                                const found = isFound(post);
                                return (
                                    <div key={post.id} className={`result-card ${found ? 'found' : ''}`}>
                                        <div className="card-header">
                                            <h3 className="card-title">{post.title}</h3>
                                            <div className={`status-badge ${found ? 'found' : 'searching'}`}>
                                                {found ? '찾기완료' : '찾는중'}
                                            </div>
                                        </div>
                                        <div className="card-content">
                                            <div className="info-row">
                                                <span className="info-label">분실지역</span>
                                                <span className="info-value">{getLocation(post)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">작성자</span>
                                                <span className="info-value">{getAuthor(post)}</span>
                                            </div>
                                            {/* 👇 [추가] 이 부분을 추가하여 formatDate 함수를 사용합니다. */}
                                            <div className="info-row">
                                                <span className="info-label">등록일</span>
                                                <span className="info-value">{formatDate(post.createdAt || post.regDate)}</span>
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button className="btn btn-detail">상세보기</button>
                                            {!found && (
                                                <button className="btn btn-toggle" onClick={() => toggleFoundStatus(post.id)}>
                                                    완료로 변경
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {searchResults.content.length === 0 && !loading && (
                            <div className="no-results">
                                <h3>검색 결과가 없습니다</h3>
                                <p>다른 검색 조건을 시도해보세요</p>
                            </div>
                        )}

                        {searchResults.totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => handlePageChange(0)} disabled={searchResults.first}>처음</button>
                                <button onClick={() => handlePageChange(searchResults.page - 1)} disabled={searchResults.first}>이전</button>
                                <span>{searchResults.page + 1} / {searchResults.totalPages}</span>
                                <button onClick={() => handlePageChange(searchResults.page + 1)} disabled={searchResults.last}>다음</button>
                                <button onClick={() => handlePageChange(searchResults.totalPages - 1)} disabled={searchResults.last}>마지막</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchFilterPage;
