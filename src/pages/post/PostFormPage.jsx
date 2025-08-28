import React, { useState, useEffect , useRef } from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import { createPost, getPostById, updatePost } from '../../api/postApi';
import ImageUpload from '../../components/post/ImageUpload';
import './PostFormPage.css'; // CSS 파일 import
import KakaoMap from '../../components/location/KakaoMap';



const PostFormPage = () => {
    const { postId } = useParams();
    const isEditMode = Boolean(postId);
    const navigate = useNavigate();

    const mapRef = useRef(null); // ✅ 지도 인스턴스를 참조하기 위한 ref
    const [mapSearchKeyword, setMapSearchKeyword] = useState(''); // ✅ 지도 검색어 상태

    const { search } = useLocation(); // ✅ 현재 URL 정보를 가져옵니다.

    // ✅ URL의 쿼리 스트링(?type=shelter 등)을 파싱합니다.
    const queryParams = new URLSearchParams(search);
    const typeFromQuery = queryParams.get('type'); // 'shelter' 또는 'missing' 값을 가져옵니다.

    // ✅ URL에서 가져온 type 값에 따라 초기 게시판 종류를 결정합니다.
    // type이 'shelter'면 'SHELTER'로, 그렇지 않으면(null이거나 'missing'이면) 'MISSING'으로 설정합니다.
    const initialPostType = typeFromQuery === 'shelter' ? 'SHELTER' : 'MISSING';


    const [formData, setFormData] = useState({
        title: '',
        content: '',
        animalName: '',
        animalAge: '',
        animalCategory: '',
        animalBreed: '',
        gender: 'UNKNOWN',
        lostTime: '',
        postType: initialPostType,
        location: '',
        latitude: 0,
        longitude: 0,
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchPostData = async () => {
                setLoading(true);
                try {
                    const response = await getPostById(postId);
                    const postData = response.data;
                    const formattedLostTime = postData.lostTime
                        ? new Date(new Date(postData.lostTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
                        : '';
                    setFormData({ ...postData, gender: postData.gender || 'UNKNOWN', lostTime: formattedLostTime });
                    if (postData.imageUrls) {
                        const imagesWithIds = postData.imageUrls.map((url, index) => ({ id: index + 1, url: url }));
                        setExistingImages(imagesWithIds);
                    }
                } catch (err) {
                    setError('게시글 정보를 불러오는 데 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            };
            fetchPostData();
        }
    }, [postId, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewFilesChange = (files) => {
        setNewImageFiles(files);
    };

    const handleDeleteExistingImage = (imageIdToDelete) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageIdToDelete));
        setDeletedImageIds(prev => [...prev, imageIdToDelete]);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const apiFormData = new FormData();
        const requestDto = {
            ...formData,
            animalAge: parseInt(formData.animalAge) || 0,
            deletedImageIds: isEditMode ? deletedImageIds : undefined,
        };
        apiFormData.append('requestDto', new Blob([JSON.stringify(requestDto)], { type: "application/json" }));
        const imagePartName = isEditMode ? 'newImages' : 'images';
        newImageFiles.forEach(file => apiFormData.append(imagePartName, file));

        try {
            if (isEditMode) {
                await updatePost(postId, apiFormData);
                alert('게시글이 성공적으로 수정되었습니다.');
                navigate(`/posts/${postId}`);
            } else {
                await createPost(apiFormData);
                alert('게시글이 성공적으로 등록되었습니다.');
                navigate(`/board/${formData.postType.toLowerCase()}`);
            }
        } catch (err) {
            setError('요청 처리 중 오류가 발생했습니다. 모든 필수 항목을 입력했는지 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div>게시글 정보를 불러오는 중...</div>;

    return (
        <section className="form-section">
            <div className="form-container">
                <h2 className="form-title">{isEditMode ? '게시글 수정' : '게시글 작성'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">게시판 선택</label>
                        <select name="postType" value={formData.postType} onChange={handleChange} className="form-select" disabled={isEditMode}>
                            <option value="MISSING">가족을 찾아요 (실종)</option>
                            <option value="SHELTER">주인을 기다려요 (보호)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">제목</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">사진 관리</label>
                        {isEditMode && existingImages.length > 0 && (
                            <>
                                <p className="form-label-subtitle">기존 사진 (X를 눌러 삭제)</p>
                                <div className="image-preview-container">
                                    {existingImages.map((image) => (
                                        <div key={image.id} className="image-preview-item">
                                            <img src={image.url} alt={`기존 이미지 ${image.id}`} className="image-preview-img" />
                                            <button type="button" onClick={() => handleDeleteExistingImage(image.id)} className="image-preview-delete-btn">X</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <label className="form-label-subtitle">새 사진 추가</label>
                        <ImageUpload onFilesChange={handleNewFilesChange} />
                    </div>

                    <div className="form-grid-2-col">
                        <div className="form-group">
                            <label className="form-label">동물 이름</label>
                            <input type="text" name="animalName" value={formData.animalName} onChange={handleChange} className="form-input" placeholder="예: 몽이" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">나이</label>
                            <input type="number" name="animalAge" value={formData.animalAge} onChange={handleChange} className="form-input" placeholder="숫자만 입력" />
                        </div>
                    </div>

                    <div className="form-grid-3-col">
                        <div className="form-group">
                            <label className="form-label">동물 종류</label>
                            <select name="animalCategory" value={formData.animalCategory} onChange={handleChange} className="form-select" required>
                                <option value="">선택하세요</option>
                                <option value="개">개</option>
                                <option value="고양이">고양이</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">품종</label>
                            <input type="text" name="animalBreed" value={formData.animalBreed} onChange={handleChange} className="form-input" placeholder="예: 말티즈" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">성별</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="form-select" required>
                                <option value="UNKNOWN">모름</option>
                                <option value="MALE">수컷</option>
                                <option value="FEMALE">암컷</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{formData.postType === 'MISSING' ? '실종' : '발견'} 일시</label>
                        <input type="datetime-local" name="lostTime" value={formData.lostTime} onChange={handleChange} className="form-input" required />
                    </div>


                    {/* ===== 🔽 카카오맵 KAKAO MAP 위치 선택(지도) 필드 추가 🔽 ===== */}
                    <div className="form-group">
                        <label className="form-label">위치 선택</label>
                        <div className="map-search-wrapper">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="장소, 주소 검색"
                                value={mapSearchKeyword}
                                onChange={(e) => setMapSearchKeyword(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMapSearch(); }}}
                            />
                            <button type="button" className="btn btn-outline" onClick={handleMapSearch}>검색</button>
                        </div>
                        <KakaoMap
                            ref={mapRef}
                            isSelectable={true}
                            initialLocation={{ latitude: formData.latitude, longitude: formData.longitude }}
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

                    <div className="form-group">
                        <label className="form-label">상세 내용</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} className="form-textarea" required></textarea>
                    </div>

                    {error && <div className="form-error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>취소</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '처리 중...' : (isEditMode ? '수정하기' : '등록하기')}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default PostFormPage;