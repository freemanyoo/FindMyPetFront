import React, { useState } from 'react';

const ImageUpload = ({ onFilesChange }) => {
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length === 0) return;

        const newFiles = [...files, ...selectedFiles].slice(0, 5); // 최대 5개
        setFiles(newFiles);
        onFilesChange(newFiles); // 부모 컴포넌트로 파일 목록 전달

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const removeImage = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange(newFiles);

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    return (
        <div>
            <div className="image-upload">
                <label htmlFor="image-input" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>사진을 클릭해서 업로드하세요</p>
                    <small>최대 5장까지 업로드 가능</small>
                </label>
                <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
            <div className="image-preview-container" style={{ display: 'flex', gap: '10px', marginTop: '1rem', flexWrap: 'wrap' }}>
                {previews.map((src, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                        <img src={src} alt={`preview ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }} />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '20px', height: '20px' }}
                        >X</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;