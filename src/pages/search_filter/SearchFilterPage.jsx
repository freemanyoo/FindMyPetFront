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

    // 페이지 로드시 초기 데이터 로드
    useEffect(() => {
        handleSearch({});
    }, []);

    const handleSearch = async (criteria, page = 0) => {
        setLoading(true);
        setError(null);

        try {
            // 검색 파라미터 구성
            const searchParams = new URLSearchParams();

            // 기본 페이징 설정
            searchParams.append('page', page.toString());
            searchParams.append('size', criteria.size || '20');
            searchParams.append('sortBy', criteria.sortBy || 'createdAt');
            searchParams.append('sortDir', criteria.sortDir || 'DESC');

            // 검색 조건 추가
            Object.entries(criteria).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    searchParams.append(key, value);
                }
            });

            const response = await fetch(`/api/find-pets/search?${searchParams}`);

            if (!response.ok) {
                throw new Error('검색 요청이 실패했습니다.');
            }

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
            const response = await fetch(`/api/find-pets/${postId}/toggle-found`, {
                method: 'PATCH'
            });

            if (!response.ok) {
                throw new Error('상태 변경에 실패했습니다.');
            }

            const result = await response.json();

            // 검색 결과 업데이트
            setSearchResults(prev => ({
                ...prev,
                content: prev.content.map(post =>
                    post.id === postId
                        ? { ...post, isFound: result.isFound }
                        : post
                )
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

    const getAnimalTypeLabel = (animalType) => {
        const types = {
            'DOG': '개',
            'CAT': '고양이',
            'OTHER': '기타'
        };
        return types[animalType] || animalType;
    };

    const getGenderLabel = (gender) => {
        const genders = {
            'MALE': '수컷',
            'FEMALE': '암컷',
            'UNKNOWN': '모름'
        };
        return genders[gender] || gender;
    };

    return (
        <div className="search-filter-page">
            <div className="page-header">
                <h1>분실 반려동물 찾기</h1>
                <p>소중한 가족을 찾아주세요</p>
            </div>

            <SearchFilterBox
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />

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
                            {searchResults.content.map(post => (
                                <div key={post.id} className={`result-card ${post.isFound ? 'found' : ''}`}>
                                    <div className="card-header">
                                        <h3 className="card-title">{post.title}</h3>
                                        <div className={`status-badge ${post.isFound ? 'found' : 'searching'}`}>
                                            {post.isFound ? '검색완료' : '검색중'}
                                        </div>
                                    </div>

                                    <div className="card-content">
                                        <div className="pet-info">
                                            <div className="info-row">
                                                <span className="info-label">종류</span>
                                                <span className="info-value">
                          {getAnimalTypeLabel(post.animalType)}
                                                    {post.breed && ` (${post.breed})`}
                        </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">성별</span>
                                                <span className="info-value">{getGenderLabel(post.gender)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">분실일</span>
                                                <span className="info-value">{formatDate(post.lostDate)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">분실지역</span>
                                                <span className="info-value">
                          {post.cityProvince} {post.district}
                        </span>
                                            </div>
                                        </div>

                                        {post.content && (
                                            <div className="content-preview">
                                                {post.content.length > 100
                                                    ? `${post.content.substring(0, 100)}...`
                                                    : post.content
                                                }
                                            </div>
                                        )}

                                        <div className="card-meta">
                                            <span className="author">작성자: {post.author}</span>
                                            <span className="created-date">{formatDate(post.createdAt)}</span>
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
                                            {post.isFound ? '검색중으로 변경' : '검색완료로 변경'}
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                                        const pageNum = Math.max(0, Math.min(
                                            searchResults.page - 2 + i,
                                            searchResults.totalPages - 1
                                        ));
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