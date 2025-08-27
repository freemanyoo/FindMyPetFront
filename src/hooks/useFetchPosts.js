// import { useState, useEffect, useCallback } from 'react';
// import axiosInstance from '../util/axiosInstance'; // axiosInstance 경로 수정
//
// //게시판의 종류(type), 검색 필터, 페이지 번호가 바뀔 때마다 API를 호출하는 로직
// const useFetchPosts = (type, filters, page) => {
//     const [posts, setPosts] = useState([]);
//     const [pagination, setPagination] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//
//     const fetchPosts = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//
//         try {
//             // API 요청을 위한 파라미터 객체 생성
//             // filters 객체의 빈 값(예: keyword: '')은 제외하여 깔끔한 URL을 만듭니다.
//             const cleanFilters = Object.fromEntries(
//                 Object.entries(filters).filter(([_, v]) => v !== '')
//             );
//
//             const params = {
//                 type,
//                 page: page - 1, // 백엔드 API는 페이지가 0부터 시작하므로 1을 빼줍니다.
//                 size: 9, // 기획서에 명시된 기본 사이즈
//                 ...cleanFilters,
//             };
//
//             // 백엔드 API 명세서에 맞게 /posts 로 요청
//             const response = await axiosInstance.get('/posts', { params });
//             const responseData = response.data.data; // 백엔드 응답 구조에 따름
//
//             setPosts(responseData.posts);
//             setPagination(responseData.pagination);
//
//         } catch (err) {
//             console.error("게시글 목록을 불러오는 중 오류 발생:", err);
//             setError("게시글 목록을 불러오는데 실패했습니다.");
//         } finally {
//             setLoading(false);
//         }
//     }, [type, filters, page]);
//
//     useEffect(() => {
//         // type이 유효할 때만 API 호출 (예: URL이 /board/ 일 때 호출 방지)
//         if (type) {
//             fetchPosts();
//         }
//     }, [fetchPosts, type]);
//
//     // 외부에서 데이터를 새로고침할 수 있도록 refetch 함수도 반환
//     return { posts, pagination, loading, error, refetch: fetchPosts };
// };
//
// export default useFetchPosts;


// src/hooks/useFetchPosts.js  <- 이 코드로 교체하거나 새로 만드세요.


import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

// SearchFilterBox의 상세 필터 조건들을 모두 받을 수 있도록 파라미터 변경
const useFetchPosts = (filters, page) => {
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // SearchFilterBox에서 넘어온 상세 필터 조건들을 params로 사용
            // 빈 값은 URL에서 제외하여 깔끔하게 만듭니다.
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
            );

            const params = {
                page: page - 1,
                size: 9,
                ...cleanFilters,
            };

            // [중요] 백엔드 API 엔드포인트가 변경될 수 있습니다.
            // 백엔드 팀과 '/posts'가 맞는지, 아니면 '/find-pets' 같은 새로운 엔드포인트가 필요한지 확인해야 합니다.
            // 우선은 기존 '/posts'를 사용한다고 가정합니다.
            const response = await axiosInstance.get('/posts', { params });
            const responseData = response.data.data;

            setPosts(responseData.posts);
            setPagination(responseData.pagination);

        } catch (err) {
            console.error("게시글 목록을 불러오는 중 오류 발생:", err);
            setError("게시글 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return { posts, pagination, loading, error, refetch: fetchPosts };
};

export default useFetchPosts;