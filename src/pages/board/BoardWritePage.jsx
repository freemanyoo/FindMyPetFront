import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './BoardWritePage.css'; // 나중에 CSS를 추가하세요.

const BoardWritePage = () => {
    const { postId } = useParams(); // URL에서 postId를 가져옴 (수정 시에만 존재)
    const isEditing = Boolean(postId); // postId가 있으면 수정 모드
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        postType: 'MISSING', // 기본값
        title: '',
        content: '',
        animalName: '',
        animalAge: '',
        animalCategory: '',
        animalBreed: '',
        lostTime: '',
        latitude: 37.5665, // 기본 위도 (서울시청)
        longitude: 126.9780, // 기본 경도 (서울시청)
    });
    const [images, setImages] = useState([]); // 업로드할 이미지 파일 목록
    const [imagePreviews, setImagePreviews] = useState([]); // 이미지 미리보기 URL 목록
    const [error, setError] = useState('');

    // 수정 모드일 경우, 기존 게시글 데이터를 불러옵니다.
    useEffect(() => {
        if (isEditing) {
            const fetchPostData = async () => {
                try {
                    const response = await axiosInstance.get(`/posts/${postId}`);
                    const post = response.data.data;
                    // API 응답 구조에 맞게 필드를 채워줍니다.
                    setFormData({
                        postType: post.postType,
                        title: post.title,
                        content: post.content,
                        animalName: post.animalName,
                        animalAge: post.animalAge,
                        animalCategory: post.animalCategory,
                        animalBreed: post.animalBreed,
                        lostTime: post.lostTime.substring(0, 16), // datetime-local 형식에 맞게 자름
                        latitude: post.latitude,
                        longitude: post.longitude,
                    });
                    setImagePreviews(post.images.map(img => img.imageUrl));
                } catch (err) {
                    console.error("게시글 데이터 로딩 실패:", err);
                    setError("게시글 정보를 불러오는데 실패했습니다.");
                }
            };
            fetchPostData();
        }
    }, [isEditing, postId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        // 이미지 미리보기 생성
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const submissionData = new FormData();

        // 1. JSON 데이터를 Blob으로 만들어 FormData에 추가
        submissionData.append('postDto', new Blob([JSON.stringify(formData)], { type: "application/json" }));

        // 2. 이미지 파일들을 FormData에 추가
        images.forEach(file => {
            submissionData.append('images', file);
        });

        try {
            if (isEditing) {
                // 수정 API 호출 (PUT)
                await axiosInstance.put(`/posts/${postId}`, submissionData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('게시글이 성공적으로 수정되었습니다.');
                navigate(`/post/${postId}`);
            } else {
                // 생성 API 호출 (POST)
                await axiosInstance.post('/posts', submissionData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('게시글이 성공적으로 등록되었습니다.');
                navigate(`/board/${formData.postType.toLowerCase()}`);
            }
        } catch (err) {
            console.error("게시글 저장 실패:", err);
            setError(err.response?.data?.error?.message || "게시글 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <section className="form-section">
            <div className="form-container">
                <h2 className="form-title">{isEditing ? '게시글 수정' : '게시글 작성'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* 게시판 선택 */}
                    <div className="form-group">
                        <label>게시판 선택</label>
                        <select name="postType" value={formData.postType} onChange={handleInputChange}>
                            <option value="MISSING">가족을 찾아요 (실종)</option>
                            <option value="SHELTER">주인을 기다려요 (보호)</option>
                        </select>
                    </div>

                    {/* 제목 */}
                    <div className="form-group">
                        <label>제목</label>
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>

                    {/* 사진 업로드 및 미리보기 */}
                    <div className="form-group">
                        <label>사진 업로드</label>
                        <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                        <div className="image-previews">
                            {imagePreviews.map((preview, index) => (
                                <img key={index} src={preview} alt="미리보기" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            ))}
                        </div>
                    </div>

                    {/* 동물 정보 입력 필드들... */}
                    <div className="form-group">
                        <label>실종/발견 일시</label>
                        <input type="datetime-local" name="lostTime" value={formData.lostTime} onChange={handleInputChange} required />
                    </div>

                    {/* 내용 */}
                    <div className="form-group">
                        <label>상세 내용</label>
                        <textarea name="content" value={formData.content} onChange={handleInputChange} required></textarea>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-primary">{isEditing ? '수정하기' : '등록하기'}</button>
                </form>
            </div>
        </section>
    );
};

export default BoardWritePage;