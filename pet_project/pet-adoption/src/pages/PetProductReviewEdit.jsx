import React, { useState, useEffect, useRef } from 'react'; // 🌟 useRef 추가
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Star, Upload, X, AlertCircle } from 'lucide-react'; // 🌟 Upload, X, AlertCircle 아이콘 추가
// 🌟 [제거] import './PetProductReviewWrite.css'; // CSS를 인라인으로 병합

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetProductReviewEdit({ currentUser }) {
    const { id } = useParams(); // URL에서 리뷰 ID
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        productName: '',
        category: '사료',
        rating: 0,
        content: '',
        image: '', // DB에서 불러온 기존 URL 저장
    });
    const [ratingHover, setRatingHover] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 🌟 [핵심 상태] 파일/이미지 관련 상태
    const [originalImageUrl, setOriginalImageUrl] = useState(''); // DB에서 불러온 원본 URL
    const [imageFile, setImageFile] = useState(null); // 새로 선택된 파일 객체
    const [filePreview, setFilePreview] = useState(null); // 새로 선택된 파일의 DataURL
    const [uploadMethod, setUploadMethod] = useState('url'); // 'file' or 'url'
    const fileInputRef = useRef(null); // 파일 인풋 참조


    const categories = ['사료', '간식', '장난감', '미용', '위생용품', '급식기', '외출용품', '기타'];

    useEffect(() => {
        if (!currentUser) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        const fetchReview = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3001/api/reviews/entry/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.userId !== currentUser.id) {
                        alert('이 리뷰를 수정할 권한이 없습니다.');
                        navigate('/reviews');
                        return;
                    }
                    
                    setFormData({
                        productName: data.productName,
                        category: data.category,
                        rating: data.rating,
                        content: data.content,
                        image: data.image || '', 
                    });

                    // 🌟 [핵심 수정] 원본 URL을 별도 상태에 저장
                    if (data.image) {
                        setOriginalImageUrl(data.image);
                        setUploadMethod('url'); 
                    } else {
                        setUploadMethod('file');
                    }

                } else {
                    throw new Error('리뷰를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                console.error('리뷰 로드 오류:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [id, currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rate) => {
        setFormData(prev => ({ ...prev, rating: rate }));
    };
    
    // 🌟 [추가] 파일 선택 핸들러 (File 객체와 Preview 분리)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            setImageFile(file); // 파일 객체 저장
            
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result); // DataURL 저장
            reader.readAsDataURL(file);
            
            // 파일 업로드 시 URL 폼 초기화 (서로 충돌 방지)
            setFormData(prev => ({ ...prev, image: '' }));
        }
    };
    
    // 🌟 [추가] 이미지 제거 핸들러 (모든 이미지 관련 상태 초기화)
    const handleRemoveImage = () => {
        setImageFile(null);
        setFilePreview(null);
        setOriginalImageUrl(''); // 원본 URL도 제거
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
             fileInputRef.current.value = '';
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.productName.trim()) {
            setError('제품명을 입력해주세요.');
            return;
        }
        
        if (!formData.content.trim()) {
            setError('리뷰 내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        let finalImageUrl = ''; // 최종 DB에 저장될 URL

        try {
            // 1. 파일 업로드 방식 + 새 파일 선택 시
            if (uploadMethod === 'file' && imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);

                const uploadResponse = await fetch('http://localhost:3001/api/upload/image', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    finalImageUrl = uploadResult.imageUrl; // 서버에서 받은 URL 사용
                } else {
                    const uploadError = await uploadResponse.json();
                    throw new Error(uploadError.message || '이미지 업로드 실패');
                }
            } 
            // 2. URL 입력 방식이거나 (formData.image에 URL 있음) 또는 파일 업로드 모드지만 파일이 없고 원본 이미지를 유지하는 경우
            else if (uploadMethod === 'url' || (!imageFile && originalImageUrl)) {
                 finalImageUrl = formData.image || originalImageUrl || ''; // 입력된 URL 혹은 기존 URL 사용
            }
            // 3. (그 외) 이미지 삭제 시에는 finalImageUrl이 빈 문자열('')이 되어야 함.

            const payload = {
                ...formData,
                image: finalImageUrl, // 🌟 최종 이미지 URL 포함
                userId: currentUser.id 
            };

            const response = await fetch(`http://localhost:3001/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('리뷰가 성공적으로 수정되었습니다!');
                navigate('/reviews'); 
            } else {
                const errData = await response.json();
                setError(errData.message || '리뷰 수정에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('리뷰 수정 오류:', apiError);
            setError(apiError.message || '서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🌟 12. 현재 표시할 이미지 URL 결정
    const currentImageToDisplay = imageFile ? filePreview : (formData.image || originalImageUrl);

    // 🌟 [수정] 모든 className을 새 CSS 파일 기준으로 변경
    if (loading) {
        return (
            <div className="review-form-page-wrapper loading">
                <style>{styles}</style>
                <div className="spinner"></div>
                <p>리뷰를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-form-page-wrapper loading">
                 <style>{styles}</style>
                 <div className="error-box">
                    <AlertCircle className="icon-large" />
                    <p>😭 {error}</p>
                    <button
                        onClick={() => navigate('/reviews')} 
                        className="button primary-button"
                    >
                        목록으로
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="review-form-page-wrapper">
             {/* 🌟 [추가] CSS 파일을 여기에 포함합니다. */}
            <style>{styles}</style>
            
            {/* Header */}
            <header className="form-header">
                <div className="form-header-container">
                    <h1 className="form-title">리뷰 수정</h1>
                    <button
                        onClick={() => navigate('/reviews')}
                        className="button-link"
                    >
                        <ArrowLeft className="icon-sm" />
                        목록으로
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="form-main-container">
                <form onSubmit={handleSubmit} className="form-card">
                    
                    {error && (
                        <div className="message-box error">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* 제품명 */}
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
                            className="form-input"
                        />
                    </div>

                    {/* 카테고리 선택 */}
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
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 별점 */}
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
                                        <Star
                                            className={`star ${
                                                rate <= (ratingHover || formData.rating)
                                                    ? 'filled'
                                                    : ''
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                            <span className="star-rating-text">{formData.rating} / 5</span>
                        </div>
                    </div>
                    
                    {/* 🌟 [추가] 이미지 수정 영역 */}
                    <div className="form-group">
                        <label className="form-label">제품 이미지 수정 (선택)</label>

                        {/* 업로드 방식 선택 탭 */}
                        <div className="upload-tabs">
                            <button
                                type="button"
                                className={`tab-button ${uploadMethod === 'file' ? 'active' : ''}`}
                                onClick={() => { 
                                    setUploadMethod('file'); 
                                    setFormData(prev => ({ ...prev, image: '' })); // URL 필드 초기화
                                }}
                            >
                                📁 파일 업로드
                            </button>
                            <button
                                type="button"
                                className={`tab-button ${uploadMethod === 'url' ? 'active' : ''}`}
                                onClick={() => {
                                    setUploadMethod('url');
                                    handleRemoveImage(); // 파일 입력 초기화
                                }}
                            >
                                🔗 URL 입력
                            </button>
                        </div>

                        {/* 🌟 파일 업로드 UI */}
                        {uploadMethod === 'file' && !imageFile && !currentImageToDisplay && (
                            <label className={`file-upload-area`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input"
                                    ref={fileInputRef}
                                />
                                <div className="upload-placeholder">
                                    <Upload size={40} style={{color: '#735048'}} />
                                    <p>클릭하여 새 이미지를 선택하세요</p>
                                    <span style={{fontSize: '12px', color: '#999'}}>JPG, PNG (최대 5MB)</span>
                                </div>
                            </label>
                        )}

                        {/* 🌟 URL 입력 UI */}
                        {uploadMethod === 'url' && (
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.png 주소를 붙여넣으세요"
                                className="form-input"
                            />
                        )}
                        
                        {/* 🌟 파일/URL 미리보기 및 제거 버튼 (가장 최근 이미지 표시) */}
                        {currentImageToDisplay && (
                            <div className="image-preview-container">
                                <img 
                                    src={currentImageToDisplay} 
                                    alt="미리보기" 
                                    className="image-preview" 
                                    style={{ marginTop: '1rem' }} 
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/F2E2CE/594C3C?text=Image+Load+Error"; }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="remove-image-button"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 내용 입력 */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="content">
                            리뷰 내용 <span className="required-star">*</span>
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={10}
                            className="form-input"
                        />
                    </div>

                    {/* 버튼 영역 */}
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
                            disabled={isSubmitting}
                            className="button primary-button"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner-sm"></div>
                                    수정 중...
                                </>
                            ) : (
                                <>
                                    <Save className="icon-sm" />
                                    수정 완료
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

// 🌟 [추가] CSS 스타일 블록 (PetProductReviewWrite.css의 몽글몽글 폼 스타일)
const styles = `
/* ===============================================
 * 🌟 몽글몽글 테마 (전역 설정)
 * =============================================== */
:root {
    --brand-primary: #735048;
    --brand-primary-dark: #594C3C;
    --brand-primary-light: #F2E2CE;
    --brand-primary-text: #735048;
    --bg-main: #F2EDE4;
    --bg-card: #ffffff;
    --border-color: #F2CBBD;
    --border-color-light: #F2E2CE;
    
    --star-color: #facc15;
    --star-color-empty: #e5e7eb;
    --danger-color: #991b1b;
    --brand-danger-bg: #fff1f2;
    --brand-danger-border: #fecdd3;
    --brand-danger-text: #9f1239;

    --text-primary: #374151;
    --text-light: #6b7280;
}

/* ===============================================
 * 1. 메인 레이아웃 (리뷰/일기/입양 폼 공용)
 * =============================================== */
.review-form-page-wrapper {
    background-color: var(--bg-main);
    min-height: 100vh;
    box-sizing: border-box; 
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

.review-form-page-wrapper *, 
.review-form-page-wrapper *:before, 
.review-form-page-wrapper *:after {
    box-sizing: inherit; 
}

/* 🌟 로딩/에러 화면 (폼 페이지용) */
.review-form-page-wrapper.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: var(--text-light);
}
.review-form-page-wrapper .spinner {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border-top: 4px solid var(--brand-primary);
    border-right: 4px solid transparent;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}
.review-form-page-wrapper .error-box {
    text-align: center;
    padding: 2rem;
    background-color: var(--bg-card);
    border-radius: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.review-form-page-wrapper .error-box .icon-large {
     width: 3rem;
    height: 3rem;
    color: var(--danger-color);
    margin: 0 auto 1rem;
}
.review-form-page-wrapper .error-box p {
    color: var(--danger-color);
    font-size: 1.125rem;
    margin-bottom: 1rem;
}
.review-form-page-wrapper .error-box .button.primary-button {
    background-color: var(--brand-primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
}


/* ===============================================
 * 2. 헤더
 * =============================================== */
.form-header {
    background-color: var(--bg-card);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid var(--border-color-light);
    padding: 1rem;
}
.form-header-container {
    max-width: 1000px; /* max-w-4xl + padding */
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.form-title {
    font-size: 1.5rem; /* text-2xl */
    font-weight: 700;
    color: var(--brand-primary-dark);
}
.button-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-light);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s ease;
}
.button-link:hover {
    color: var(--brand-primary-text);
}
.icon-sm {
    width: 1.25rem;
    height: 1.25rem;
}

/* ===============================================
 * 3. 메인 콘텐츠 (폼)
 * =============================================== */
.form-main-container {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.form-card {
    background-color: var(--bg-card);
    border-radius: 16px; /* rounded-lg (몽글몽글) */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem; /* space-y-6 */
}

/* 폼 요소 */
.form-group {
    display: flex;
    flex-direction: column;
}
.form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-light);
    margin-bottom: 0.5rem;
}
.required-star {
    color: var(--danger-color);
    margin-left: 0.25rem;
}
.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db; /* border-gray-300 */
    border-radius: 12px; /* rounded-lg (몽글몽글) */
    transition: all 0.2s ease;
    font-family: inherit;
    font-size: 1rem;
    background-color: white; /* 🌟 select 배경색 보장 */
}
.form-input:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 2px var(--brand-primary-light);
    outline: none;
}
textarea.form-input {
    min-height: 150px;
    resize: vertical;
}

/* 🌟 [추가] <select> 드롭다운 화살표 커스텀 */
select.form-input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23594C3C' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1.25rem center; 
    background-size: 1.25em; 
    padding-right: 2.5rem; 
}
select.form-input::-ms-expand {
    display: none;
}


/* 별점 */
.star-rating-input {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}
.star-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}
.star {
    width: 2rem; /* w-8 h-8 */
    height: 2rem;
    color: var(--star-color-empty);
    transition: color 0.1s ease-in-out;
}
.star.filled {
    fill: var(--star-color);
    color: var(--star-color);
}
.star-rating-text {
    margin-left: 0.75rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
}

/* 🌟 [NEW] 이미지 업로드 관련 스타일 */
.upload-tabs {
    display: flex;
    gap: 0.5rem;
}
.tab-button {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    background-color: white;
    color: var(--text-primary);
    border-radius: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}
.tab-button.active {
    background-color: var(--brand-primary);
    color: white;
    border-color: var(--brand-primary);
}
.tab-button:hover:not(.active) {
    background-color: var(--brand-primary-light);
}

.file-input {
    display: none;
}
.file-upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    background-color: var(--bg-main);
    transition: all 0.2s;
}
.file-upload-area:hover {
    border-color: var(--brand-primary);
    background-color: var(--brand-primary-light);
}
.upload-placeholder { color: var(--brand-primary); display: flex; flex-direction: column; align-items: center; gap: 8px; }

.image-preview-container { 
    position: relative; 
    display: block; 
    margin-top: 1rem; 
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}
.image-preview { 
    width: 100%; 
    max-height: 300px; 
    border-radius: 12px; 
    border: 1px solid var(--border-color-light); 
    display: block; 
    object-fit: contain;
}
.remove-image-button {
    position: absolute; 
    top: 10px; 
    right: 10px;
    width: 32px; 
    height: 32px; 
    border-radius: 50%;
    background-color: var(--danger-color); 
    color: white;
    border: 2px solid white; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    cursor: pointer; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.remove-image-button:hover {
    background-color: var(--danger-color-light);
}

/* 폼 푸터 (버튼) */
.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--bg-main);
}
.button {
    padding: 0.6rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}
.button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.button.primary-button {
    background-color: var(--brand-primary);
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
}
.button.primary-button:hover:not(:disabled) {
    background-color: var(--brand-primary-dark);
    box-shadow: 0 6px 10px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
}

.button.secondary-button {
    background-color: var(--bg-card);
    color: var(--text-light);
    border: 1px solid #d1d5db;
}
.button.secondary-button:hover:not(:disabled) {
    background-color: var(--bg-main);
}

/* 버튼 로딩 스피너 */
.spinner-sm {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border-top: 2px solid white;
    border-right: 2px solid transparent;
    animation: spin 1s linear infinite;
}

/* 메시지 박스 */
.message-box {
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid;
}
.message-box.error {
    background-color: var(--brand-danger-bg);
    color: var(--brand-danger-text);
    border-color: var(--brand-danger-border);
}

/* 🌟 로딩/에러 화면 (폼 페이지용) */
.review-form-page-wrapper.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: var(--text-light);
}
.review-form-page-wrapper .spinner {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border-top: 4px solid var(--brand-primary);
    border-right: 4px solid transparent;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}
.review-form-page-wrapper .error-box {
    text-align: center;
    padding: 2rem;
    background-color: var(--bg-card);
    border-radius: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.review-form-page-wrapper .error-box .icon-large {
     width: 3rem;
    height: 3rem;
    color: var(--danger-color);
    margin: 0 auto 1rem;
}
.review-form-page-wrapper .error-box p {
    color: var(--danger-color);
    font-size: 1.125rem;
    margin-bottom: 1rem;
}
`;