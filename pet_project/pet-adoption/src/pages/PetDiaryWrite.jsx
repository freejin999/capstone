import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetDiaryWrite({ currentUser }) {
    const navigate = useNavigate();
    
    // 2. 폼 상태 관리
    const [formData, setFormData] = useState({
        title: '',
        mood: '일상', // 기본값
        content: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const moods = ['행복', '설렘', '일상', '슬픔', '화남']; // 💡 기분 옵션

    // 3. 폼 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. 폼 제출 (일기 등록) 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (!formData.title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }
        
        // 5. 'currentUser'가 없으면(비정상 접근) 함수를 중단시킵니다.
        if (!currentUser || !currentUser.id) {
            alert('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);

        // 6. 서버로 전송할 데이터(payload) 조립
        const payload = {
            ...formData,
            // 🌟 로그인한 사용자의 고유 ID(숫자)를 'userId'로 설정
            userId: currentUser.id, 
            author: currentUser.nickname, // 작성자 닉네임 추가
        };

        try {
            // 💡 주의: 백엔드에 이 API (POST /api/diaries) 구현 필요!
            const response = await fetch('http://localhost:3001/api/diaries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), 
            });

            if (response.ok) {
                // const result = await response.json(); // 서버에서 ID를 받을 경우
                alert('일기가 성공적으로 등록되었습니다!');
                navigate('/diary'); // 목록 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '일기 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('일기 작성 오류:', error);
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
                    min-height: 250px;
                }
                
                .author-info-box {
                    padding: 12px;
                    border: 1px solid #F2E2CE;
                    border-radius: 8px;
                    background-color: #F2EDE4; /* Light Accent Background */
                    color: #594C3C;
                    font-weight: 600;
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
                    <h1 className="title">새 일기 작성</h1>
                    <button
                        onClick={() => navigate('/diary')}
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
                    
                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="error-box" role="alert">
                            {error}
                        </div>
                    )}

                    {/* 작성자 정보 (로그인 정보 사용) */}
                    <div className="form-group">
                        <label className="label-text">
                            작성자
                        </label>
                        <div className="author-info-box">
                            {currentUser ? (
                                <>
                                    <span className="author-name">{currentUser.nickname}</span>
                                    <span style={{fontSize: '14px', color: '#735048', marginLeft: '8px'}}>({currentUser.username})</span>
                                </>
                            ) : (
                                <span style={{color: '#c23939'}}>로그인 정보 없음 - 작성 불가</span>
                            )}
                        </div>
                    </div>
                    
                    {/* 제목 입력 */}
                    <div className="form-group">
                        <label htmlFor="title" className="label-text">
                            제목 <span style={{color: 'red'}}>*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="오늘의 가장 기억에 남는 순간은?"
                            className="input-field"
                            maxLength={100}
                        />
                        <p style={{fontSize: '12px', color: '#A0A0A0'}}>
                            {formData.title.length}/100
                        </p>
                    </div>

                    {/* 기분 선택 */}
                    <div className="form-group">
                        <label htmlFor="mood" className="label-text">
                            오늘의 기분 <span style={{color: 'red'}}>*</span>
                        </label>
                        <select
                            id="mood"
                            name="mood"
                            value={formData.mood}
                            onChange={handleChange}
                            className="select-field"
                        >
                            {moods.map(mood => (
                                <option key={mood} value={mood}>
                                    {mood}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 내용 입력 */}
                    <div className="form-group">
                        <label htmlFor="content" className="label-text">
                            내용 <span style={{color: 'red'}}>*</span>
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="우리 아이의 특별한 순간을 기록해주세요."
                            rows={15}
                            className="textarea-field"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="button-group">
                        <button
                            type="button"
                            onClick={() => navigate('/diary')}
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
                                    등록하기
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}