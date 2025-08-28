import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPosts } from '../../api/postApi';
import PostCard from '../../components/post/PostCard';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import SearchFilterBox from '../../components/board/SearchFilterBox'; // 1. 검색 필터 박스 import

const BoardPage = () => {
    const { type } = useParams();
    const { isLoggedIn } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    // 2. 검색 조건을 관리할 상태
    const [searchCriteria, setSearchCriteria] = useState({});

    const boardTitle = type === 'missing' ? '실종 동물 게시판' : '보호 동물 게시판';
    const boardIcon = type === 'missing' ? 'fas fa-search' : 'fas fa-heart';

    // 3. 검색 버튼을 눌렀을 때 실행될 함수
    const handleSearch = (criteria) => {
        setSearchCriteria(criteria);
        setPageInfo(prev => ({ ...prev, currentPage: 1 })); // 검색 시에는 항상 1페이지부터 조회
    };

    // 4. 페이지 번호를 클릭했을 때 실행될 함수
    const handlePageChange = (newPage) => {
        setPageInfo(prev => ({ ...prev, currentPage: newPage }));
    };

    // 5. API를 호출하는 핵심 로직
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // type 값이 URL 파라미터에서 확정되기 전에 API가 호출되는 것을 방지합니다.
        if (!type) {
            return;
        }

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // 백엔드 DTO(FindPetSearchCriteria) 필드명에 맞게 파라미터를 매핑합니다.
                const params = {
                    // 1. 이름(Key) 변환
                    title: searchCriteria.title,
                    animalName: searchCriteria.author,       // author -> animalName
                    location: searchCriteria.location,
                    animalCategory: searchCriteria.animalType, // animalType -> animalCategory
                    animalBreed: searchCriteria.breed,
                    lostTimeFrom: searchCriteria.lostDateFrom, // lostDateFrom -> lostTimeFrom
                    lostTimeTo: searchCriteria.lostDateTo,     // lostDateTo -> lostTimeTo

                    // 2. 값(Value) 변환
                    // isFound (true/false/null) -> status ("COMPLETED"/"ACTIVE"/null)
                    status: searchCriteria.isFound === true ? 'COMPLETED' :
                        searchCriteria.isFound === false ? 'ACTIVE' : null,

                    // 3. 기존 페이징 및 타입 파라미터
                    postType: (type || '').toUpperCase(),
                    page: pageInfo.currentPage - 1, // API는 0-based 페이지를 사용하므로 -1
                    size: 9
                };

                // 백엔드로 보내기 전, 내용이 없는 파라미터는 제거하여 URL을 깔끔하게 합니다.
                Object.keys(params).forEach(key => {
                    if (params[key] === null || params[key] === undefined || params[key] === '') {
                        delete params[key];
                    }
                });

                // API를 호출합니다.
                const response = await getPosts(params);

                // 응답 결과를 state에 저장합니다.
                setPosts(response.data.dtoList);
                setPageInfo({
                    currentPage: response.data.page,
                    totalPages: Math.ceil(response.data.total / response.data.size)
                });

            } catch (err) {
                setError('게시글을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [type, pageInfo.currentPage, searchCriteria]); // 이 값들이 변경될 때마다 API를 다시 호출합니다.

    return (
        <section className="board-section">
            <div className="board-header">
                <h2 className="board-title">
                    <i className={boardIcon}></i> {boardTitle}
                </h2>
                <div className="board-controls">
                    {/* 상세 검색 페이지 링크는 이제 필요 없으므로 주석 처리하거나 삭제 가능 */}
                    {/* <Link to="/find-pets" className="btn btn-secondary">
                        <i className="fas fa-search-plus"></i> 상세 검색하기
                    </Link> */}
                    {isLoggedIn && (
                        <Link to={`/posts/new?type=${type}`} className="btn btn-primary">
                            <i className="fas fa-plus"></i> 글쓰기
                        </Link>
                    )}
                </div>
            </div>

            {/* 6. 검색 필터 박스 컴포넌트 렌더링 */}
            <SearchFilterBox onSearch={handleSearch} />

            {loading && <div>로딩 중...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {!loading && !error && (
                <>
                    <div className="posts-grid">
                        {posts.length > 0 ? (
                            posts.map(post => <PostCard key={post.postId} post={post} />)
                        ) : (
                            <p>조건에 맞는 게시글이 없습니다.</p>
                        )}
                    </div>

                    <Pagination
                        currentPage={pageInfo.currentPage}
                        totalPages={pageInfo.totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </section>
    );
};

export default BoardPage;