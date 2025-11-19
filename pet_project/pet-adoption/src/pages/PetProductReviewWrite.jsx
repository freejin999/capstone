import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Star, Upload, X } from 'lucide-react'; // 🌟 Upload, X 아이콘 추가
import './PetProductReviewWrite.css'; 

export default function PetProductReviewWrite({ currentUser }) {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        productName: '',
        category: '사료',
        rating: 0,
        content: '',
        image: '', 
    });
    const [ratingHover, setRatingHover] = useState(0);
    
    // 🌟 [추가] 파일 업로드 관련 상태
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const categories = ['사료', '간식', '장난감', '미용', '위생용품', '급식기', '외출용품', '기타'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rate) => {
        setFormData(prev => ({ ...prev, rating: rate }));
    };

    // 🌟 [추가] 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 유효성 검사
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
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
            alert('리뷰를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (!formData.productName.trim()) {
            setError('제품명을 입력해주세요.');
            return;
        }
        
        if (!formData.content.trim()) {
            setError('리뷰 내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = formData.image; // 기본값 (URL 입력 방식일 때)

            // 🌟 [핵심] 파일 업로드 방식이고 파일이 선택되었다면
            if (uploadMethod === 'file' && imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);

                // 이미지 먼저 업로드
                const uploadResponse = await fetch('http://localhost:3001/api/upload/image', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    finalImageUrl = uploadResult.imageUrl; // 서버에서 받은 URL로 교체
                } else {
                    throw new Error('이미지 업로드에 실패했습니다.');
                }
            }

            const payload = {
                ...formData,
                image: finalImageUrl, // 최종 URL 사용
                userId: currentUser.id,
                authorUsername: currentUser.username, 
                authorNickname: currentUser.nickname 
            };

            const response = await fetch('http://localhost:3001/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('리뷰가 성공적으로 등록되었습니다!');
                navigate('/reviews'); 
            } else {
                const errData = await response.json();
                setError(errData.message || '리뷰 등록에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('리뷰 작성 오류:', apiError);
            setError(apiError.message || '서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-form-page-wrapper">
            <header className="form-header">
                <div className="form-header-container">
                    <h1 className="form-title">새 리뷰 작성</h1>
                    <button onClick={() => navigate('/reviews')} className="button-link">
                        <ArrowLeft className="icon-sm" /> 목록으로
                    </button>
                </div>
            </header>

            <main className="form-main-container">
                <form onSubmit={handleSubmit} className="form-card">
                    {error && (
                        <div className="message-box error">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="productName">
                            제품명 <span className="required-star">*</span>
                        </label>
                        <input
                            id="productName"
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            placeholder="예: 슈퍼프리미엄 연어 사료"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="category">
                            카테고리 <span className="required-star">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-input"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            별점 <span className="required-star">*</span>
                        </label>
                        <div className="star-rating-input">
                            {[...Array(5)].map((_, index) => {
                                const rate = index + 1;
                                return (
                                    <button
                                        type="button"
                                        key={rate}
                                        onClick={() => handleRatingClick(rate)}
                                        onMouseEnter={() => setRatingHover(rate)}
                                        onMouseLeave={() => setRatingHover(0)}
                                        className="star-button"
                                    >
                                        <Star className={`star ${rate <= (ratingHover || formData.rating) ? 'filled' : ''}`} />
                                    </button>
                                );
                            })}
                            <span className="star-rating-text">{formData.rating} / 5</span>
                        </div>
                    </div>

                    {/* 🌟 [변경] 이미지 업로드 섹션 */}
                    <div className="form-group">
                        <label className="form-label">사진 등록 (선택)</label>
                        
                        {/* 탭 버튼 */}
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

                        {/* 파일 업로드 UI */}
                        {uploadMethod === 'file' && (
                            <label className={`file-upload-area ${imagePreview ? 'has-file' : ''}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden-file-input"
                                />
                                {!imagePreview ? (
                                    <div className="upload-placeholder">
                                        <Upload className="icon-upload" />
                                        <p>클릭하여 사진을 선택하세요</p>
                                        <span className="upload-hint">JPG, PNG (최대 5MB)</span>
                                    </div>
                                ) : (
                                    <div className="image-preview-container">
                                        <img src={imagePreview} alt="미리보기" className="image-preview" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemoveImage();
                                            }}
                                            className="remove-image-btn"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </label>
                        )}

                        {/* URL 입력 UI */}
                        {uploadMethod === 'url' && (
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.png"
                                className="form-input"
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="content">
                            리뷰 내용 <span className="required-star">*</span>
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="제품에 대한 솔직한 리뷰를 남겨주세요."
                            rows={10}
                            className="form-input"
                        />
                    </div>

                    <div className="form-footer">
                        <button
                            type="button"
                            onClick={() => navigate('/reviews')}
                            className="button secondary-button"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser}
                            className="button primary-button"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner-sm"></div>
                                    등록 중...
                                </>
                            ) : (
                                <>
                                    <Send className="icon-sm" />
                                    리뷰 등록
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}