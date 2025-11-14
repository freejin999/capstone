import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionWrite({ currentUser }) {
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
        image: '', // 이미지 URL
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const speciesOptions = ['개', '고양이', '기타'];
    const genderOptions = ['미상', '수컷', '암컷'];
    const sizeOptions = ['소형', '중형', '대형'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // [보안] currentUser 확인
        if (!currentUser) {
            alert('공고를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // 유효성 검사
        if (!formData.name.trim() || !formData.breed.trim() || !formData.age.trim() || !formData.region.trim() || !formData.description.trim()) {
            setError('필수 항목(*)을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        // API로 전송할 데이터 조립 (currentUser 정보 포함)
        const payload = {
            ...formData,
            age: parseInt(formData.age) || 0, // 나이는 숫자로 변환
            userId: currentUser.id,
            author: currentUser.username, // 공고 작성자 (고유 ID)
            authorNickname: currentUser.nickname // 작성자 닉네임
        };

        try {
            // 💡 주의: 백엔드에 이 API (POST /api/adoption) 구현 필요!
            const response = await fetch('http://localhost:3001/api/adoption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('입양 공고가 성공적으로 등록되었습니다!');
                navigate('/adoption'); // 공고 목록 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '공고 등록에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('공고 작성 오류:', apiError);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="write-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
                
                .write-container {
                    min-height: 100vh;
                    background-color: #F2EDE4; /* Light Background */
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
                    color: #735048; /* Primary Color */
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
                    .form-grid.cols-full {
                        grid-column: 1 / -1;
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
                    border: 1px solid #F2CBBD; /* Accent Border */
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
                /* 로딩 스피너 */
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

            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1 className="title">새 입양 공고 작성</h1>
                    <button
                        onClick={() => navigate('/adoption')}
                        className="back-button"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        목록으로
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <form onSubmit={handleSubmit} className="post-form">
                    
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="error-box" role="alert">
                            {error}
                        </div>
                    )}

                    {/* 작성자 정보 (로그인 정보 표시) */}
                    <div className="form-group">
                        <label className="label-text">
                            공고 작성자
                        </label>
                        <div className="author-info-box input-field" style={{padding: '12px'}}>
                            {currentUser ? (
                                <span className="author-name">{currentUser.nickname || currentUser.username}</span>
                            ) : (
                                <span style={{color: '#c23939'}}>로그인 정보 없음</span>
                            )}
                        </div>
                    </div>

                    {/* 동물 이름 */}
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

                    {/* 2x2 그리드: 종류, 품종 */}
                    <div className="form-grid cols-2">
                        {/* 종류 */}
                        <div className="form-group">
                            <label className="label-text">종류 <span style={{color: 'red'}}>*</span></label>
                            <select name="species" value={formData.species} onChange={handleChange} className="select-field">
                                {speciesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 품종 */}
                        <div className="form-group">
                            <label className="label-text">품종 <span style={{color: 'red'}}>*</span></label>
                            <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="예: 믹스, 코숏, 푸들" className="input-field" required />
                        </div>
                    </div>

                    {/* 3x3 그리드: 나이, 성별, 크기 */}
                    <div className="form-grid cols-3">
                        {/* 나이 */}
                        <div className="form-group">
                            <label className="label-text">나이 (살) <span style={{color: 'red'}}>*</span></label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만 입력 (예: 3)" className="input-field" min="0" required />
                        </div>
                        {/* 성별 */}
                        <div className="form-group">
                            <label className="label-text">성별 <span style={{color: 'red'}}>*</span></label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="select-field">
                                {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 크기 */}
                        <div className="form-group">
                            <label className="label-text">크기 <span style={{color: 'red'}}>*</span></label>
                            <select name="size" value={formData.size} onChange={handleChange} className="select-field">
                                {sizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 발견 지역 */}
                    <div className="form-group">
                        <label className="label-text">
                            발견/보호 지역 <span style={{color: 'red'}}>*</span>
                        </label>
                        <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="예: 서울시 강남구" className="input-field" required />
                    </div>

                    {/* 이미지 URL */}
                    <div className="form-group">
                        <label className="label-text">
                            사진 URL (선택)
                        </label>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.png" className="input-field" />
                    </div>

                    {/* 상세 설명 */}
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

                    {/* 버튼 영역 */}
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