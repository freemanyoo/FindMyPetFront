import React, { useState, useEffect } from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './BoardWritePage.css'; // 스타일 import

const BoardWritePage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(postId);
    const { search } = useLocation(); // ✅ useLocation 훅 사용

    // ✅ URL 쿼리스트링에서 'type' 값을 읽어옴
    const queryParams = new URLSearchParams(search);
    const typeFromQuery = queryParams.get('type'); // 'missing' 또는 'shelter'

    // ✅ 읽어온 type에 따라 postType의 기본값을 설정
    // 'shelter'면 'SHELTER', 그 외에는 'MISSING'을 기본값으로 사용
    const initialPostType = typeFromQuery === 'shelter' ? 'SHELTER' : 'MISSING';

    const [postData, setPostData] = useState({
        postType: initialPostType,
        title: '',
        content: '',
        animalName: '',
        animalAge: '',
        animalCategory: '',
        animalBreed: '',
        lostTime: '',
        location: '',
        latitude: 37.5665,
        longitude: 126.9780,
    });
    const [imageFiles, setImageFiles] = useState([]); // 새로 업로드할 파일들
    const [existingImageUrls, setExistingImageUrls] = useState([]); // 수정 시 기존 이미지 URL
    const [deletedImageIds, setDeletedImageIds] = useState([]); // 수정 시 삭제할 이미지 ID

    useEffect(() => {
        if (isEditMode) {
            const fetchPostData = async () => {
                try {
                    const response = await axiosInstance.get(`/posts/${postId}`);
                    const data = response.data.data;
                    setPostData({
                        ...data,
                        lostTime: data.lostTime ? new Date(data.lostTime).toISOString().slice(0, 16) : '',
                    });
                    setExistingImageUrls(data.images || []);
                } catch (error) {
                    console.error("게시글 데이터 로딩 실패:", error);
                    alert("게시글 정보를 불러오는 데 실패했습니다.");
                }
            };
            fetchPostData();
        }
    }, [isEditMode, postId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImageFiles(Array.from(e.target.files));
    };

    const handleDeleteExistingImage = (imageId) => {
        setDeletedImageIds(prev => [...prev, imageId]);
        setExistingImageUrls(prev => prev.filter(img => img.imageId !== imageId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        const requestDto = { ...postData, deletedImageIds };
        formData.append('requestDto', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }));

        imageFiles.forEach(file => {
            formData.append(isEditMode ? 'newImages' : 'images', file);
        });

        try {
            if (isEditMode) {
                await axiosInstance.put(`/posts/${postId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('게시글이 성공적으로 수정되었습니다.');
                navigate(`/post/${postId}`);
            } else {
                const response = await axiosInstance.post('/posts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const newPostId = response.data.data.postId;
                alert('게시글이 성공적으로 등록되었습니다.');
                navigate(`/post/${newPostId}`);
            }
        } catch (error) {
            console.error("게시글 제출 실패:", error.response?.data || error);
            alert(`처리 중 오류가 발생했습니다: ${error.response?.data?.error?.message || error.message}`);
        }
    };

    return (
        <section className="write-form-container">
            <h2 className="form-title">{isEditMode ? '게시글 수정' : '게시글 작성'}</h2>
            <form onSubmit={handleSubmit} className="write-form">
                {/* 폼 필드들을 HTML 샘플 기반으로 구성 */}
                <div className="form-group">
                    <label>게시판 선택</label>
                    <select name="postType" value={postData.postType} onChange={handleChange}>
                        <option value="MISSING">가족을 찾아요 (실종)</option>
                        <option value="SHELTER">주인을 기다려요 (보호)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>제목</label>
                    <input type="text" name="title" value={postData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>상세 내용</label>
                    <textarea name="content" value={postData.content} onChange={handleChange} required />
                </div>

                {/* ... 동물 정보, 위치 등 나머지 폼 필드 추가 ... */}

                <div className="form-group">
                    <label>사진 업로드</label>
                    {isEditMode && existingImageUrls.length > 0 && (
                        <div className="existing-images">
                            <p>기존 이미지 (클릭하여 삭제)</p>
                            {existingImageUrls.map(image => (
                                <div key={image.imageId} className="img-wrapper" onClick={() => handleDeleteExistingImage(image.imageId)}>
                                    <img src={image.imageUrl} alt="기존 이미지" />
                                    <span className="delete-icon">X</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>취소</button>
                    <button type="submit" className="btn btn-primary">
                        {isEditMode ? '수정하기' : '등록하기'}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default BoardWritePage;