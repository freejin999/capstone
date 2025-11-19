import React, { useState, useEffect, useRef } from 'react'; // 🌟 useRef 추가
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Upload, X } from 'lucide-react'; // 🌟 Upload, X 아이콘 추가

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionEdit({ currentUser }) {
    const { id } = useParams(); // URL에서 공고 ID 가져오기
    const navigate = useNavigate();
    
    // 2. 폼 데이터 상태 (공고글에 필요한 필드)
    const [formData, setFormData] = useState({
        name: '', // 동물 이름
        species: '개', // 종 (개, 고양이, 기타)
        breed: '', // 품종
        age: '', // 나이 (숫자)
        gender: '미상', // 성별
        size: '소형', // 크기
        region: '', // 발견 지역
        description: '', // 상세 설명
        image: '', // 🌟 이미지 URL 필드 추가
        status: '입양가능' // 3. 💡 상태(status) 필드 추가
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 🌟 [추가] 파일 업로드 관련 상태
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('url'); // 수정은 URL로 시작
    const fileInputRef = useRef(null); // 파일 인풋 참조

    // 폼 옵션
    const speciesOptions = ['개', '고양이', '기타'];
    const genderOptions = ['미상', '수컷', '암컷'];
    const sizeOptions = ['소형', '중형', '대형'];
    const statusOptions = ['입양가능', '상담중', '입양완료']; // 4. 💡 상태 옵션

    // 5. 💡 기존 공고 데이터 불러오기
    useEffect(() => {
        if (!currentUser) {
            alert('이 페이지에 접근하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        fetchAdoptionPost(id);
    }, [id, currentUser, navigate]);

    const fetchAdoptionPost = async (postId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/adoption/${postId}`);
            if (response.ok) {
                const data = await response.json();
                
                // 6. 💡 [보안 수정] 
                if (data.userId !== currentUser.id) { 
                    alert('이 공고를 수정할 권한이 없습니다.');
                    navigate(`/adoption/${id}`); // 상세 페이지로 튕기기
                    return;
                }
                
                // 7. 💡 폼 데이터 설정
                setFormData({
                    name: data.name,
                    species: data.species,
                    breed: data.breed,
                    age: data.age,
                    gender: data.gender,
                    size: data.size,
                    region: data.region,
                    description: data.description,
                    image: data.image || '', // 🌟 기존 이미지 URL 설정
                    status: data.status || '입양가능'
                });

                // 🌟 [추가] 기존 이미지가 있으면 미리보기 설정
                if (data.image) {
                    setImagePreview(data.image);
                    // 기존 이미지가 있으면 URL 모드로 시작
                    setUploadMethod('url'); 
                } else {
                    // 이미지가 없으면 파일 업로드 모드로 시작
                    setUploadMethod('file'); 
                }

            } else {
                throw new Error('공고를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('공고 조회 오류:', err);
            setError(err.message || '서버와의 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 🌟 [추가] 파일 선택 핸들러
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
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setFormData(prev => ({ ...prev, image: '' })); // URL 입력값 초기화
        }
    };
    
    // 🌟 [추가] 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
             fileInputRef.current.value = ''; // 파일 인풋도 초기화
        }
    };


    // 8. 💡 수정 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (!formData.name.trim() || !formData.breed.trim() || !String(formData.age).trim() || !formData.region.trim() || !formData.description.trim()) {
            setError('필수 항목(*)을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        let finalImageUrl = formData.image; // URL 모드의 기본값

        try {
            // 🌟 [핵심] 파일 업로드 방식일 경우 이미지 먼저 서버로 전송
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
            } else if (uploadMethod === 'file' && imagePreview) {
                // 파일 모드인데 새 파일이 없고 imagePreview가 있다면 (기존 이미지 유지)
                finalImageUrl = imagePreview;
            } else if (uploadMethod === 'url' && !formData.image) {
                // URL 모드인데 비어있다면 최종 URL도 비움 (삭제 효과)
                finalImageUrl = '';
            }

            // API로 전송할 데이터 조립 (userId 포함)
            const payload = {
                ...formData,
                image: finalImageUrl, // 🌟 최종 이미지 URL 포함
                age: parseInt(formData.age) || 0, // 나이는 숫자로 변환
                userId: currentUser.id, // [보안] 본인 확인용
            };

            const response = await fetch(`http://localhost:3001/api/adoption/${id}`, {
                method: 'PUT', // 9. 💡 [수정] PUT 요청
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('공고가 성공적으로 수정되었습니다!');
                navigate(`/adoption/${id}`); // 수정된 상세 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '공고 수정에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('공고 수정 오류:', apiError);
            setError(apiError.message || '서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 11. 로딩 UI
    if (loading) {
        return (
            <div className="review-form-page-wrapper loading">
                <style>{styles}</style>
                <div className="spinner-center"><div className="spinner-large"></div></div>
                <p className="loading-text">공고 정보를 불러오는 중...</p>
            </div>
        );
    }
    
    // 에러 발생 시
    if (error) {
        return (
            <div className="review-form-page-wrapper loading">
                 <style>{styles}</style>
                 <div className="error-box">
                    <AlertCircle className="icon-large" />
                    <p>😭 {error}</p>
                    <button
                        onClick={() => navigate('/adoption')} 
                        className="button primary-button"
                    >
                        목록으로
                    </button>
                </div>
            </div>
        );
    }


    return (
        // 🌟 [수정] CSS 클래스명 변경
        <div className="review-form-page-wrapper">
            {/* 🌟 [추가] CSS 파일을 여기에 포함합니다. */}
            <style>{styles}</style>
            
            {/* Header */}
            <header className="form-header">
                <div className="form-header-container">
                    <h1 className="form-title">입양 공고 수정</h1>
                    <button
                        onClick={() => navigate(`/adoption/${id}`)}
                        className="button-link"
                    >
                        <ArrowLeft className="icon-sm" />
                        수정 취소
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="form-main-container">
                <form onSubmit={handleSubmit} className="form-card">
                    
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="message-box error" role="alert">
                            {error}
                        </div>
                    )}

                    {/* 작성자 정보 (로그인 정보 표시) */}
                    <div className="form-group">
                        <label className="form-label">
                            공고 작성자
                        </label>
                        <div className="form-input" style={{ backgroundColor: '#f9f9f9', color: '#555' }}>
                            {currentUser ? (
                                <span>{currentUser.nickname || currentUser.username}</span>
                            ) : (
                                <span style={{color: '#c23939'}}>로그인 정보 없음</span>
                            )}
                        </div>
                    </div>

                    {/* 입양 상태 변경 */}
                    <div className="form-group">
                        <label className="form-label">입양 상태 <span className="required-star">*</span></label>
                        <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* 동물 이름 */}
                    <div className="form-group">
                        <label className="form-label">
                            동물 이름 <span className="required-star">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="예: 복돌이"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* 2x2 그리드: 종류, 품종 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* 종류 */}
                        <div className="form-group">
                            <label className="form-label">종류 <span className="required-star">*</span></label>
                            <select name="species" value={formData.species} onChange={handleChange} className="form-input">
                                {speciesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 품종 */}
                        <div className="form-group">
                            <label className="form-label">품종 <span className="required-star">*</span></label>
                            <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="예: 믹스, 코숏, 푸들" className="form-input" required />
                        </div>
                    </div>

                    {/* 3x3 그리드: 나이, 성별, 크기 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {/* 나이 */}
                        <div className="form-group">
                            <label className="form-label">나이 (살) <span className="required-star">*</span></label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만 입력 (예: 3)" className="form-input" min="0" required />
                        </div>
                        {/* 성별 */}
                        <div className="form-group">
                            <label className="form-label">성별 <span className="required-star">*</span></label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                                {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 크기 */}
                        <div className="form-group">
                            <label className="form-label">크기 <span className="required-star">*</span></label>
                            <select name="size" value={formData.size} onChange={handleChange} className="form-input">
                                {sizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 발견 지역 */}
                    <div className="form-group">
                        <label className="form-label">
                            발견/보호 지역 <span className="required-star">*</span>
                        </label>
                        <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="예: 서울시 강남구" className="form-input" required />
                    </div>

                    {/* 🌟 이미지 수정 영역 */}
                    <div className="form-group">
                        <label className="form-label">사진 수정 (선택)</label>

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
                        {uploadMethod === 'file' && !imageFile && !imagePreview && (
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
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img 
                                    src={imagePreview} 
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


                    {/* 상세 설명 */}
                    <div className="form-group">
                        <label className="form-label">
                            상세 설명 <span className="required-star">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="동물의 성격, 건강 상태, 발견 당시 상황 등을 자세히 적어주세요."
                            rows={10}
                            className="form-input" 
                            required
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="form-footer">
                        <button
                            type="button"
                            onClick={() => navigate(`/adoption/${id}`)}
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