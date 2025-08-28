import axiosInstance from './axiosInstance';

/**
 * 게시글 목록 조회 API
 * @param {object} params - { page, size, type, ... }
 */
export const getPosts = (params) => {
    return axiosInstance.get('/posts', { params });
};

/**
 * 게시글 상세 조회 API
 * @param {number} postId - 게시글 ID
 */
export const getPostById = (postId) => {
    return axiosInstance.get(`/posts/${postId}`);
};

/**
 * 게시글 생성 API
 * @param {FormData} formData - requestDto와 이미지 파일들을 포함
 */
export const createPost = (formData) => {
    return axiosInstance.post('/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * 게시글 수정 API
 * @param {number} postId - 수정할 게시글 ID
 * @param {FormData} formData - requestDto와 새로운 이미지 파일들을 포함
 */
export const updatePost = (postId, formData) => {
    return axiosInstance.put(`/posts/${postId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * 게시글 삭제 API
 * @param {number} postId - 삭제할 게시글 ID
 */
export const deletePost = (postId) => {
    return axiosInstance.delete(`/posts/${postId}`);
};

/**
 * 게시글 찾기 완료 처리 API
 * @param {number} postId - 완료 처리할 게시글 ID
 */
export const completePost = (postId) => {
    return axiosInstance.put(`/posts/${postId}/complete`);
};