네, 좋습니다. 1순위 작업이 마무리되었으니, 이제 사용자 경험을 한 단계 끌어올릴 지도 기능과 페이지네이션 구현을 시작하겠습니다.

각 작업을 단계별로 나누어, 필요한 코드와 함께 어느 파일에 어떻게 적용해야 하는지 상세히 안내해 드리겠습니다.

---

### **2순위: 지도(KakaoMap) 기능 연동**

#### **사전 준비: Kakao Maps API 스크립트 추가**

가장 먼저, Kakao 지도를 사용하기 위해 프로젝트에 API 스크립트를 추가해야 합니다. 이 작업은 **한 번만** 하면 됩니다.

**➡️ `public/index.html` 파일을 열고 `<head>` 태그 안에 아래 `<script>` 태그를 추가해주세요.**

```html
<!-- public/index.html -->

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <!-- ... other meta tags ... -->
    <title>Find My Fet</title>

    <!-- ===== 🔽 여기에 카카오 지도 API 스크립트 추가 🔽 ===== -->
    <script
      type="text/javascript"
      src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=services"
    ></script>
    <!-- =============================================== -->

  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**⚠️ 중요:** 위 코드에서 `YOUR_KAKAO_APP_KEY` 부분은 **반드시 본인의 카카오 개발자 사이트에서 발급받은 JavaScript 키로 교체**해야 합니다.

---

#### **1단계: `PostDetailPage.jsx`에 지도 표시하기 (위치 조회)**

게시글에 저장된 위치를 지도에 마커로 표시합니다.

**➡️ 아래 코드로 `src/pages/post/PostDetailPage.jsx` 파일 전체를 교체해주세요.**

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById, deletePost } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import CommentComponent from '../../components/comment/CommentComponent';
import KakaoMap from '../../components/location/KakaoMap'; // ✅ KakaoMap 컴포넌트 import
import './PostDetailPage.css';

const PostDetailPage = () => {
    // ... (기존 state 및 useEffect, handleDelete 함수는 그대로 유지)
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getPostById(postId);
                setPost(response.data);
            } catch (err) {
                setError("게시글을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleDelete = async () => { /* ... */ };

    if (loading) return <div>게시글을 불러오는 중...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!post) return <div>해당 게시글이 없습니다.</div>;

    const isAuthor = isLoggedIn && user?.userId === post.author.userId;

    return (
        <section className="board-section">
            <div className="post-detail">
                {/* ... (기존 Header UI) ... */}

                <div className="post-detail-content">
                    {/* ... (기존 이미지 갤러리, 동물 정보 UI) ... */}
                    <div className="animal-detail-info"> /* ... */ </div>

                    {/* ===== 🔽 여기에 지도 컴포넌트 추가 🔽 ===== */}
                    <div className="map-container">
                        <h3>{post.postType === 'MISSING' ? '실종 추정 위치' : '발견 위치'}</h3>
                        <KakaoMap 
                            initialLocation={{ latitude: post.latitude, longitude: post.longitude }} 
                            isSelectable={false} 
                        />
                    </div>
                    {/* ======================================= */}
                    
                    <div className="post-main-content">
                        <p>{post.content}</p>
                    </div>
                </div>

                <CommentComponent postId={postId} isPostCompleted={post.status === 'COMPLETED'} />
            </div>
        </section>
    );
};

export default PostDetailPage;
```

**➡️ `src/pages/post/PostDetailPage.css` 파일의 맨 아래에 아래 스타일을 추가해주세요.**

```css
/* src/pages/post/PostDetailPage.css 에 추가 */

.map-container {
    margin-top: 2rem;
}

.map-container h3 {
    margin-bottom: 1rem;
    font-size: 1.4rem;
    color: #333;
}
```

---

#### **2단계: `PostFormPage.jsx`에 지도 연동하기 (위치 선택)**

폼에서 지도를 클릭하거나 검색하여 위치를 선택하고, 해당 좌표와 주소를 폼 상태에 저장합니다.

**➡️ 아래 코드로 `src/pages/post/PostFormPage.jsx` 파일 전체를 교체해주세요.**

```jsx
import React, {useState, useEffect, useRef} from 'react'; // ✅ useRef import
import {useParams, useNavigate} from 'react-router-dom';
import {createPost, getPostById, updatePost} from '../../api/postApi';
import ImageUpload from '../../components/post/ImageUpload';
import KakaoMap from '../../components/location/KakaoMap'; // ✅ KakaoMap import
import './PostFormPage.css';

const PostFormPage = () => {
    // ... (기존 state 및 useEffect, 기타 핸들러 함수는 그대로 유지)
    const {postId} = useParams();
    const isEditMode = Boolean(postId);
    const navigate = useNavigate();
    const mapRef = useRef(null); // ✅ 지도 인스턴스를 참조하기 위한 ref
    const [mapSearchKeyword, setMapSearchKeyword] = useState(''); // ✅ 지도 검색어 상태

    const [formData, setFormData] = useState({ /* ... */});
    // ...

    // ✅ 지도에서 위치가 선택되었을 때 호출될 콜백 함수
    const handleLocationSelect = (selectedLocation) => {
        setFormData(prev => ({
            ...prev,
            location: selectedLocation.location,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
        }));
    };

    // ✅ 검색 버튼 클릭 시 지도 검색 실행
    const handleMapSearch = () => {
        if (mapRef.current) {
            mapRef.current.searchPlace(mapSearchKeyword);
        }
    };

    // ... (기존 handleSubmit 함수는 그대로 유지)

    return (
        <section className="form-section">
            <div className="form-container">
                <h2 className="form-title">{isEditMode ? '게시글 수정' : '게시글 작성'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* ... (기존 폼 필드: 게시판, 제목, 사진, 동물정보) ... */}

                    {/* ===== 🔽 여기에 위치 선택(지도) 필드 추가 🔽 ===== */}
                    <div className="form-group">
                        <label className="form-label">위치 선택</label>
                        <div className="map-search-wrapper">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="장소, 주소 검색"
                                value={mapSearchKeyword}
                                onChange={(e) => setMapSearchKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleMapSearch();
                                    }
                                }}
                            />
                            <button type="button" className="btn btn-outline" onClick={handleMapSearch}>검색</button>
                        </div>
                        <KakaoMap
                            ref={mapRef}
                            isSelectable={true}
                            initialLocation={{latitude: formData.latitude, longitude: formData.longitude}}
                            onLocationSelect={handleLocationSelect}
                        />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="지도에서 선택된 주소"
                            style={{marginTop: '1rem'}}
                            readOnly
                        />
                    </div>
                    {/* ============================================== */}

                    {/* ... (기존 폼 필드: 실종일시, 상세내용, 버튼) ... */}
                </form>
            </div>
        </section>
    );
};

export default PostFormPage;
```

**➡️ `src/pages/post/PostFormPage.css` 파일의 맨 아래에 아래 스타일을 추가해주세요.**

```css
/* src/pages/post/PostFormPage.css 에 추가 */

.map-search-wrapper {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;
}

.map-search-wrapper .form-input {
    flex-grow: 1;
}
```

---

### **3순위: 페이지네이션(Pagination) 기능 구현**

#### **1단계: 재사용 가능한 `Pagination` 컴포넌트 생성**

**➡️ `src/components/common` 폴더를 새로 만들고, 그 안에 아래 두 파일을 생성해주세요.**

**`src/components/common/Pagination.jsx`**

```jsx
import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    const maxPageButtons = 5; // 한 번에 보여줄 최대 페이지 버튼 수
    let startPage, endPage;

    if (totalPages <= maxPageButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const halfPages = Math.floor(maxPageButtons / 2);
        if (currentPage <= halfPages) {
            startPage = 1;
            endPage = maxPageButtons;
        } else if (currentPage + halfPages >= totalPages) {
            startPage = totalPages - maxPageButtons + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - halfPages;
            endPage = currentPage + halfPages;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (totalPages === 0) return null;

    return (
        <nav className="pagination-nav">
            <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>&laquo;</button>
                </li>
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button onClick={() => onPageChange(number)} className="page-link">
                            {number}
                        </button>
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>&raquo;</button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
```

**`src/components/common/Pagination.css`**

```css
/* src/components/common/Pagination.css */
.pagination-nav {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.pagination {
    list-style: none;
    display: flex;
    padding: 0;
    gap: 0.5rem;
}

.page-item .page-link {
    padding: 0.75rem 1.25rem;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    color: #555;
}

.page-item .page-link:hover {
    background: #f0f0f0;
    border-color: #ccc;
}

.page-item.active .page-link {
    background: #667eea;
    color: white;
    border-color: #667eea;
}

.page-item.disabled .page-link {
    color: #ccc;
    pointer-events: none;
    background-color: #f8f9fa;
}
```

---

#### **2단계: `BoardPage.jsx`에 페이지네이션 연동**

`BoardPage`에서 페이지 상태를 관리하고, API 호출 로직을 수정하며, `Pagination` 컴포넌트를 렌더링합니다.

**➡️ 아래 코드로 `src/pages/post/BoardPage.jsx` 파일 전체를 교체해주세요.**

```jsx
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
                        <Link to="/posts/new" className="btn btn-primary">
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

export default BoardPage;```

이제 2순위와 3순위 작업이 모두 완료되었습니다. 코드를 적용하고 테스트해보시면 지도와 페이지네이션 기능이 정상적으로 동작하는 것을 확인하실 수 있습니다.