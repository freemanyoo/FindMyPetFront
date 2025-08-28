import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPosts } from '../../api/postApi';
import PostCard from '../../components/post/PostCard';
import Pagination from '../../components/common/Pagination'; // ✅ Pagination 컴포넌트 import
import { useAuth } from '../../context/AuthContext';

const BoardPage = () => {
    const { type } = useParams();
    const { isLoggedIn } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 페이지네이션 상태 추가
    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    const boardTitle = type === 'missing' ? '실종 동물 게시판' : '보호 동물 게시판';
    const boardIcon = type === 'missing' ? 'fas fa-search' : 'fas fa-heart';
    const postTypeParam = type.toUpperCase();

    // ✅ type 또는 currentPage가 변경될 때마다 게시글 목록을 다시 불러옴
    useEffect(() => {
        const fetchPosts = async (page) => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    type: postTypeParam,
                    page: page, // API는 0-based index일 수 있으므로 page-1
                    size: 9
                };
                const response = await getPosts(params);
                setPosts(response.data.dtoList);
                // ✅ 페이지 정보 업데이트 (API 응답 구조에 맞게)
                setPageInfo({
                    currentPage: response.data.page, // 백엔드 page는 1부터 시작한다고 가정
                    totalPages: Math.ceil(response.data.total / response.data.size)
                });
            } catch (err) {
                setError('게시글을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts(pageInfo.currentPage);
    }, [type, pageInfo.currentPage]); // ✅ 의존성 배열에 pageInfo.currentPage 추가

    // ✅ 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        setPageInfo(prev => ({ ...prev, currentPage: newPage }));
    };

    return (
        <section className="board-section">
            <div className="board-header">
                <h2 className="board-title">
                    <i className={boardIcon}></i> {boardTitle}
                </h2>
                <div className="board-controls">
                    {isLoggedIn && (
                        <Link to={`/posts/new?type=${type}`} className="btn btn-primary">
                            <i className="fas fa-plus"></i> 글쓰기
                        </Link>
                    )}
                </div>
            </div>

            {loading && <div>로딩 중...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {!loading && !error && (
                <>
                    <div className="posts-grid">
                        {posts.length > 0 ? (
                            posts.map(post => <PostCard key={post.postId} post={post} />)
                        ) : (
                            <p>등록된 게시글이 없습니다.</p>
                        )}
                    </div>
                    {/* ===== 🔽 여기에 페이지네이션 컴포넌트 추가 🔽 ===== */}
                    <Pagination
                        currentPage={pageInfo.currentPage}
                        totalPages={pageInfo.totalPages}
                        onPageChange={handlePageChange}
                    />
                    {/* ============================================== */}
                </>
            )}
        </section>
    );
};

export default BoardPage;