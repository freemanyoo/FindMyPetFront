import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetchPosts from '../../hooks/useFetchPosts.js';
import PostCard from '../../components/board/PostCard.jsx';
import SearchFilterBox from '../../components/board/SearchFilterBox.jsx'; // 팀원이 만든 컴포넌트 사용
// import Pagination from '../../components/common/Pagination'; // 페이지네이션은 추후 구현
import { useAuth } from '../../context/AuthContext.jsx';
import './BoardListPage.css'; // 스타일을 위한 CSS 파일 import

const BoardListPage = () => {
    const { type } = useParams(); // 'missing' or 'shelter'
    const { isLoggedIn } = useAuth();

    // SearchFilterBox의 모든 필터 조건을 담을 state. type도 여기에 포함.
    const [filters, setFilters] = useState({ type: type });
    const [currentPage, setCurrentPage] = useState(0);

    // URL의 type이 변경되면 filters에도 반영
    useEffect(() => {
        setFilters(prevFilters => ({ ...prevFilters, type: type }));
    }, [type]);

    const { posts, pagination, loading, error } = useFetchPosts(filters, currentPage);

    // SearchFilterBox가 검색/필터 변경 시 호출할 함수
    const handleSearch = (newFilters) => {
        // 기존 type을 유지하면서 새로운 필터 조건들을 합칩니다.
        setFilters({ ...newFilters, type: type });
        setCurrentPage(1);
    };

    return (
        <section className="board-section-container">
            <div className="board-header">
                {/*
                  SearchFilterBox는 onSearch와 onFilterChange props를 받습니다.
                  onSearch는 '검색' 버튼 클릭 시, onFilterChange는 값이 바뀔 때마다 호출됩니다.
                  우리는 '검색' 버튼 클릭 시에만 API를 다시 호출하도록 onSearch에 handleSearch를 연결합니다.
                */}
                <SearchFilterBox onSearch={handleSearch} onFilterChange={setFilters} />
            </div>

            <div className="board-actions">
                <span className="post-count">
                    {pagination ? `총 ${pagination.totalElements} 건` : '게시글 수를 계산 중...'}
                </span>
                {isLoggedIn && (
                    <Link to="/board/write" className="btn btn-primary">
                        <i className="fas fa-plus"></i> 글쓰기
                    </Link>
                )}
            </div>

            {loading && <div className="loading-message">게시글을 불러오는 중...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && (
                <>
                    <div className="posts-grid-container">
                        {posts.length > 0 ? (
                            posts.map(post => <PostCard key={post.postId} post={post} />)
                        ) : (
                            <div className="no-posts-message">해당 조건의 게시글이 없습니다.</div>
                        )}
                    </div>
                    {/* TODO: 페이지네이션 컴포넌트 렌더링 */}
                </>
            )}
        </section>
    );
};

export default BoardListPage;