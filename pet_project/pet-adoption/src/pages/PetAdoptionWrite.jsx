import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Upload, X } from 'lucide-react';

export default function PetAdoptionWrite({ currentUser }) {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        species: '개',
        breed: '',
        age: '',
        gender: '미상',
        size: '소형',
        region: '',
        description: '',
        image: '',
    });
    
    // 🌟 [추가] 파일 업로드 관련 상태
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const speciesOptions = ['개', '고양이', '기타'];
    const genderOptions = ['미상', '수컷', '암컷'];
    const sizeOptions = ['소형', '중형', '대형'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 🌟 [추가] 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            
            // 파일 크기 검증 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            
            setImageFile(file);
            
            // 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 🌟 [추가] 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!currentUser) {
            alert('공고를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (!formData.name.trim() || !formData.breed.trim() || !formData.age.trim() || !formData.region.trim() || !formData.description.trim()) {
            setError('필수 항목(*)을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl = formData.image; // URL 방식일 경우 기본값

            // 🌟 [추가] 파일 업로드 방식일 경우
            if (uploadMethod === 'file' && imageFile) {
                const formDataForUpload = new FormData();
                formDataForUpload.append('image', imageFile);

                // 💡 이미지 업로드 API 호출
                const uploadResponse = await fetch('http://localhost:3001/api/upload/image', {
                    method: 'POST',
                    body: formDataForUpload,
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    imageUrl = uploadResult.imageUrl; // 서버에서 반환된 이미지 URL
                } else {
                    throw new Error('이미지 업로드에 실패했습니다.');
                }
            }

            // API로 전송할 데이터 조립
            const payload = {
                ...formData,
                image: imageUrl, // 업로드된 이미지 URL 또는 직접 입력한 URL
                age: parseInt(formData.age) || 0,
                userId: currentUser.id,
                author: currentUser.username,
                authorNickname: currentUser.nickname
            };

            const response = await fetch('http://localhost:3001/api/adoption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('입양 공고가 성공적으로 등록되었습니다!');
                navigate('/adoption');
            } else {
                const errData = await response.json();
                setError(errData.message || '공고 등록에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('공고 작성 오류:', apiError);
            setError(apiError.message || '서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="write-container">
            <style>{`
                .write-container {
                    min-height: 100vh;
                    background-color: #F2EDE4;
                    font-family: 'Inter', sans-serif;
                }
                .header {
                    background-color: white;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border-bottom: 1px solid #F2E2CE;
                }
                .header-content {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #735048;
                }
                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #594C3C;
                    text-decoration: none;
                    transition: color 0.15s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 8px 12px;
                    border-radius: 8px;
                }
                .back-button:hover {
                    color: #735048;
                    background-color: #F2E2CE;
                }

                .main-content {
                    max-width: 900px;
                    margin: 32px auto;
                    padding: 0 16px;
                }
                .post-form {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    border: 1px solid #F2E2CE;
                }
                .error-box {
                    background-color: #fcebeb; 
                    border: 1px solid #f09b9b; 
                    color: #c23939; 
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 12px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 24px;
                }
                @media (min-width: 768px) {
                    .form-grid.cols-2 {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .form-grid.cols-3 {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .label-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: #594C3C;
                }
                .input-field, .textarea-field, .select-field {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #F2CBBD;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                    color: #594C3C;
                }
                .input-field:focus, .textarea-field:focus, .select-field:focus {
                    outline: none;
                    border-color: #735048;
                    box-shadow: 0 0 0 2px #F2E2CE;
                }
                .textarea-field {
                    resize: vertical;
                    min-height: 150px;
                }

                /* 🌟 업로드 방식 선택 탭 */
                .upload-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .tab-button {
                    flex: 1;
                    padding: 10px 16px;
                    border: 1px solid #F2CBBD;
                    background-color: white;
                    color: #594C3C;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.15s;
                }
                .tab-button.active {
                    background-color: #735048;
                    color: white;
                    border-color: #735048;
                }
                .tab-button:hover:not(.active) {
                    background-color: #F2E2CE;
                }

                /* 🌟 파일 업로드 영역 */
                .file-upload-area {
                    border: 2px dashed #F2CBBD;
                    border-radius: 8px;
                    padding: 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.15s;
                    background-color: #F2EDE4;
                }
                .file-upload-area:hover {
                    border-color: #735048;
                    background-color: #F2E2CE;
                }
                .file-upload-area.has-file {
                    border-color: #735048;
                    background-color: white;
                }
                .upload-icon {
                    margin: 0 auto 12px;
                    color: #735048;
                }
                .upload-text {
                    color: #594C3C;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                .upload-hint {
                    color: #735048;
                    font-size: 12px;
                }
                .file-input {
                    display: none;
                }

                /* 🌟 이미지 미리보기 */
                .image-preview-container {
                    position: relative;
                    max-width: 400px;
                    margin: 12px auto 0;
                }
                .image-preview {
                    width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .remove-image-button {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background-color: rgba(255, 255, 255, 0.9);
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                .remove-image-button:hover {
                    background-color: #f09b9b;
                    color: white;
                }

                .button-group {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding-top: 16px;
                    border-top: 1px solid #F2E2CE;
                }
                .cancel-button {
                    padding: 10px 20px;
                    border: 1px solid #735048;
                    color: #735048;
                    background-color: white;
                    border-radius: 8px;
                    transition: background-color 0.15s;
                    cursor: pointer;
                    font-weight: 600;
                }
                .cancel-button:hover:not(:disabled) {
                    background-color: #F2E2CE;
                }
                .submit-button {
                    padding: 10px 20px;
                    background-color: #735048;
                    color: white;
                    border-radius: 8px;
                    transition: background-color 0.15s;
                    cursor: pointer;
                    border: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .submit-button:hover:not(:disabled) {
                    background-color: #594C3C;
                }
                .submit-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .spinner-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .spinner {
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top: 3px solid #fff;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <header className="header">
                <div className="header-content">
                    <h1 className="title">새 입양 공고 작성</h1>
                    <button onClick={() => navigate('/adoption')} className="back-button">
                        <ArrowLeft className="w-5 h-5" />
                        목록으로
                    </button>
                </div>
            </header>

            <main className="main-content">
                <form onSubmit={handleSubmit} className="post-form">
                    
                    {error && (
                        <div className="error-box" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label-text">공고 작성자</label>
                        <div className="input-field" style={{padding: '12px', backgroundColor: '#F2EDE4'}}>
                            {currentUser ? (
                                <span>{currentUser.nickname || currentUser.username}</span>
                            ) : (
                                <span style={{color: '#c23939'}}>로그인 정보 없음</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label-text">
                            동물 이름 <span style={{color: 'red'}}>*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="예: 복돌이"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="form-grid cols-2">
                        <div className="form-group">
                            <label className="label-text">종류 <span style={{color: 'red'}}>*</span></label>
                            <select name="species" value={formData.species} onChange={handleChange} className="select-field">
                                {speciesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label-text">품종 <span style={{color: 'red'}}>*</span></label>
                            <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="예: 믹스, 코숏, 푸들" className="input-field" required />
                        </div>
                    </div>

                    <div className="form-grid cols-3">
                        <div className="form-group">
                            <label className="label-text">나이 (살) <span style={{color: 'red'}}>*</span></label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만 입력 (예: 3)" className="input-field" min="0" required />
                        </div>
                        <div className="form-group">
                            <label className="label-text">성별 <span style={{color: 'red'}}>*</span></label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="select-field">
                                {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label-text">크기 <span style={{color: 'red'}}>*</span></label>
                            <select name="size" value={formData.size} onChange={handleChange} className="select-field">
                                {sizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label-text">
                            발견/보호 지역 <span style={{color: 'red'}}>*</span>
                        </label>
                        <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="예: 서울시 강남구" className="input-field" required />
                    </div>

                    {/* 🌟 이미지 업로드 영역 */}
                    <div className="form-group">
                        <label className="label-text">사진 등록 (선택)</label>
                        
                        {/* 업로드 방식 선택 탭 */}
                        <div className="upload-tabs">
                            <button
                                type="button"
                                className={`tab-button ${uploadMethod === 'file' ? 'active' : ''}`}
                                onClick={() => setUploadMethod('file')}
                            >
                                📁 파일 업로드
                            </button>
                            <button
                                type="button"
                                className={`tab-button ${uploadMethod === 'url' ? 'active' : ''}`}
                                onClick={() => {
                                    setUploadMethod('url');
                                    handleRemoveImage();
                                }}
                            >
                                🔗 URL 입력
                            </button>
                        </div>

                        {/* 파일 업로드 방식 */}
                        {uploadMethod === 'file' && (
                            <>
                                <label className={`file-upload-area ${imagePreview ? 'has-file' : ''}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="file-input"
                                    />
                                    {!imagePreview ? (
                                        <>
                                            <Upload className="upload-icon" size={48} />
                                            <p className="upload-text">클릭하여 이미지 선택</p>
                                            <p className="upload-hint">JPG, PNG, GIF (최대 5MB)</p>
                                        </>
                                    ) : (
                                        <div className="image-preview-container">
                                            <img src={imagePreview} alt="미리보기" className="image-preview" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRemoveImage();
                                                }}
                                                className="remove-image-button"
                                                title="이미지 제거"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    )}
                                </label>
                            </>
                        )}

                        {/* URL 입력 방식 */}
                        {uploadMethod === 'url' && (
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.png"
                                className="input-field"
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label className="label-text">
                            상세 설명 <span style={{color: 'red'}}>*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="동물의 성격, 건강 상태, 발견 당시 상황 등을 자세히 적어주세요."
                            rows={10}
                            className="textarea-field"
                            required
                        />
                    </div>

                    <div className="button-group">
                        <button
                            type="button"
                            onClick={() => navigate('/adoption')}
                            className="cancel-button"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser}
                            className="submit-button"
                        >
                            {isSubmitting ? (
                                <span className="spinner-center">
                                    <span className="spinner"></span>
                                    등록 중...
                                </span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    공고 등록
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}