import React, { useState, useEffect } from 'react';
import SearchFilterBox from '../../components/search_filter/SearchFilterBox';
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

        // 동물 이름(작성자 대신 실제 검색이 필요한 필드로 전환)
        if (criteria.author) {
            // author는 백엔드에 없을 수 있으므로 넘기지 않음(필요시 여기서 userName 등으로 매핑)
            // params.append('author', criteria.author);
        }

        // 날짜 범위
        if (criteria.lostDateFrom) params.append('lostTimeFrom', criteria.lostDateFrom);
        if (criteria.lostDateTo) params.append('lostTimeTo', criteria.lostDateTo);

        // 위치: cityProvince + district 를 하나의 location 문자열로 합쳐 전송
        const pieces = [criteria.cityProvince, criteria.district].filter(Boolean);
        if (pieces.length > 0) params.append('location', pieces.join(' '));

        // 축종/품종
        if (criteria.animalType) params.append('animalCategory', criteria.animalType);
        if (criteria.breed) params.append('animalBreed', criteria.breed);

        // 성별은 백엔드 필드가 없을 수 있으니 전송 생략 (필요 시 매핑)
        // if (criteria.gender) params.append('gender', criteria.gender);

        // 상태 토글: isFound(true/false/null) -> status(COMPLETED/ACTIVE)
        if (criteria.isFound === true) params.append('status', 'COMPLETED');
        else if (criteria.isFound === false) params.append('status', 'ACTIVE');
        // null이면 전체 = 전송 생략

        return params;
    };

    const handleSearch = async (criteria, page = 0) => {
        setLoading(true);
        setError(null);

        try {
            const searchParams = toBackendParams(criteria, page);
            const response = await fetch(`/api/find-pets/search?${searchParams}`);
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

    // status <-> isFound 매핑을 고려한 토글(엔드포인트는 기존 그대로 사용)
    const toggleFoundStatus = async (postId) => {
        try {
            const response = await fetch(`/api/find-pets/${postId}/toggle-found`, { method: 'PATCH' });
            if (!response.ok) throw new Error('상태 변경에 실패했습니다.');

            const result = await response.json();

            // 백엔드가 isFound 또는 status 중 무엇을 돌려줘도 반영되도록 처리
            setSearchResults((prev) => ({
                ...prev,
                content: prev.content.map((post) => {
                    if (post.id !== postId) return post;
                    const nextIsFound = result.isFound ?? (result.status ? result.status.toUpperCase() === 'COMPLETED' : !post.isFound);
                    const nextStatus = nextIsFound ? 'COMPLETED' : 'ACTIVE';
                    return { ...post, isFound: nextIsFound, status: nextStatus };
                }),
            }));
        } catch (err) {
            console.error('상태 토글 오류:', err);
            alert('상태 변경에 실패했습니다.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // 표시에 사용할 값들 폴백 추출
    const pick = (post, ...keys) => {
        for (const k of keys) {
            const v = k.split('.').reduce((acc, cur) => (acc ? acc[cur] : undefined), post);
            if (v !== undefined && v !== null && v !== '') return v;
        }
        return undefined;
    };

    const getAnimalTypeLabel = (post) => {
        // 백엔드가 animalCategory 또는 animalType을 줄 수 있음
        const raw = pick(post, 'animalCategory', 'animalType');
        return raw || '-';
    };

    const getBreed = (post) => pick(post, 'animalBreed', 'breed');

    const getGenderLabel = (post) => {
        const raw = pick(post, 'gender');
        if (!raw) return null;
        const genders = { MALE: '수컷', FEMALE: '암컷', UNKNOWN: '모름' };
        return genders[String(raw).toUpperCase()] || raw;
    };

    const getLostDate = (post) => pick(post, 'lostTime', 'lostDate');

    const getLocation = (post) => {
        const loc = pick(post, 'location');
        if (loc) return loc;
        const city = pick(post, 'cityProvince');
        const dist = pick(post, 'district');
        return [city, dist].filter(Boolean).join(' ');
    };

    const getAuthor = (post) =>
        pick(post, 'author', 'userNickname', 'user.nickname', 'user.name') || '익명';

    const getCreatedAt = (post) => pick(post, 'createdAt', 'regDate');

    const isFound = (post) => {
        if (post.isFound !== undefined && post.isFound !== null) return !!post.isFound;
        if (post.status) return String(post.status).toUpperCase() === 'COMPLETED';
        return false;
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
                        총 <span className="count-number">{searchResults.totalElements}</span>건의
                        검색 결과가 있습니다.
                    </div>
                    {searchResults.totalPages > 1 && (
                        <div className="page-info">
                            {searchResults.page + 1} / {searchResults.totalPages} 페이지
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

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
                                const genderLabel = getGenderLabel(post); // 없으면 숨김
                                return (
                                    <div key={post.id} className={`result-card ${found ? 'found' : ''}`}>
                                        <div className="card-header">
                                            <h3 className="card-title">{post.title}</h3>
                                            <div className={`status-badge ${found ? 'found' : 'searching'}`}>
                                                {found ? '검색완료' : '검색중'}
                                            </div>
                                        </div>

                                        <div className="card-content">
                                            <div className="pet-info">
                                                <div className="info-row">
                                                    <span className="info-label">종류</span>
                                                    <span className="info-value">
                            {getAnimalTypeLabel(post)}
                                                        {getBreed(post) ? ` (${getBreed(post)})` : ''}
                          </span>
                                                </div>

                                                {genderLabel && (
                                                    <div className="info-row">
                                                        <span className="info-label">성별</span>
                                                        <span className="info-value">{genderLabel}</span>
                                                    </div>
                                                )}

                                                <div className="info-row">
                                                    <span className="info-label">분실일</span>
                                                    <span className="info-value">{formatDate(getLostDate(post))}</span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="info-label">분실지역</span>
                                                    <span className="info-value">{getLocation(post) || '-'}</span>
                                                </div>
                                            </div>

                                            {post.content && (
                                                <div className="content-preview">
                                                    {post.content.length > 100
                                                        ? `${post.content.substring(0, 100)}...`
                                                        : post.content}
                                                </div>
                                            )}

                                            <div className="card-meta">
                                                <span className="author">작성자: {getAuthor(post)}</span>
                                                <span className="created-date">{formatDate(getCreatedAt(post))}</span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="btn btn-detail"
                                                onClick={() => window.open(`/find-pets/${post.id}`, '_blank')}
                                            >
                                                상세보기
                                            </button>
                                            <button
                                                className="btn btn-toggle"
                                                onClick={() => toggleFoundStatus(post.id)}
                                            >
                                                {found ? '검색중으로 변경' : '검색완료로 변경'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {searchResults.content.length === 0 && !loading && (
                            <div className="no-results">
                                <div className="no-results-icon">🔍</div>
                                <h3>검색 결과가 없습니다</h3>
                                <p>다른 검색 조건을 시도해보세요</p>
                            </div>
                        )}

                        {searchResults.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-page"
                                    onClick={() => handlePageChange(0)}
                                    disabled={searchResults.first}
                                >
                                    처음
                                </button>
                                <button
                                    className="btn btn-page"
                                    onClick={() => handlePageChange(searchResults.page - 1)}
                                    disabled={searchResults.first}
                                >
                                    이전
                                </button>

                                <div className="page-numbers">
                                    {Array.from({ length: Math.min(5, searchResults.totalPages) }, (_, i) => {
                                        const pageNum = Math.max(
                                            0,
                                            Math.min(searchResults.page - 2 + i, searchResults.totalPages - 1)
                                        );
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`btn btn-page ${pageNum === searchResults.page ? 'active' : ''}`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    className="btn btn-page"
                                    onClick={() => handlePageChange(searchResults.page + 1)}
                                    disabled={searchResults.last}
                                >
                                    다음
                                </button>
                                <button
                                    className="btn btn-page"
                                    onClick={() => handlePageChange(searchResults.totalPages - 1)}
                                    disabled={searchResults.last}
                                >
                                    마지막
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchFilterPage;
