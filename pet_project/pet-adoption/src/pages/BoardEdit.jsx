import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function BoardEdit({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        category: '자유게시판',
        content: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalAuthor, setOriginalAuthor] = useState(null); // 💡 원본 글 작성자 저장

    const categories = ['공지사항', '자유게시판', '질문답변', 'FAQ'];

    // 기존 게시글 데이터 불러오기
    useEffect(() => {
        // 2. 'currentUser'가 없으면(비정상 접근) 즉시 차단
        if (!currentUser) {
            alert('이 페이지에 접근하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        fetchPost();
    }, [id, currentUser, navigate]); // 3. useEffect 의존성에 currentUser, navigate 추가

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/posts/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                
                // 4. [보안] 🌟 권한 검사 🌟
                if (data.author !== currentUser.username) {
                    alert('이 글을 수정할 권한이 없습니다.');
                    navigate(`/board/${id}`); // 상세 페이지로 돌려보내기
                    return;
                }

                // 원본 작성자 저장 (UI 표기용)
                setOriginalAuthor(data.author);

                // 5. 권한이 있으면 폼 데이터 설정
                setFormData({
                    title: data.title,
                    category: data.category,
                    content: data.content
                });
            } else {
                alert('게시글을 불러오는데 실패했습니다.');
                navigate('/board');
            }
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            alert('서버와의 연결에 실패했습니다.');
            navigate('/board');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!formData.title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            title: formData.title,
            category: formData.category,
            content: formData.content
        };

        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // 7. payload 전송
            });

            if (response.ok) {
                alert('게시글이 수정되었습니다!');
                navigate(`/board/${id}`); // 수정된 상세 페이지로 이동
            } else {
                alert('게시글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('수정 요청 오류:', error);
            alert('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-container loading-state">
                <div className="spinner-center"><div className="spinner-large"></div></div>
                <p className="loading-text">게시글을 불러오는 중...</p>
            </div>
        );
    }
    
    // 로딩은 끝났으나 원본 작성자가 없으면 렌더링을 막음 (권한 없음 상태)
    if (!originalAuthor) {
        return null;
    }


    return (
        <div className="edit-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
                
                .edit-container {
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
                    max-width: 1200px;
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
                }
                .author-name {
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
                .spinner-large {
                    width: 40px;
                    height: 40px;
                    border-width: 4px;
                    border-top-color: #735048;
                    margin: 0 auto;
                }
                .loading-state {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background-color: #F2EDE4;
                    color: #594C3C;
                    text-align: center;
                }
                .loading-text {
                    margin-top: 16px;
                    font-weight: 500;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1 className="title">게시글 수정</h1>
                    <button
                        onClick={() => navigate(`/board/${id}`)}
                        className="back-button"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        취소
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <form onSubmit={handleSubmit} className="post-form">
                    
                    {/* 카테고리 선택 */}
                    <div className="form-group">
                        <label className="label-text">
                            카테고리 <span style={{color: 'red'}}>*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="select-field"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* 작성자 정보 (로그인 정보 사용) */}
                    <div className="form-group">
                        <label className="label-text">
                            작성자
                        </label>
                        <div className="author-info-box">
                            <span className="author-name">{originalAuthor || '불러오는 중...'}</span>
                        </div>
                    </div>

                    {/* 제목 입력 */}
                    <div className="form-group">
                        <label className="label-text">
                            제목 <span style={{color: 'red'}}>*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="제목을 입력하세요"
                            className="input-field"
                            maxLength={100}
                        />
                        <p style={{fontSize: '12px', color: '#A0A0A0'}}>
                            {formData.title.length}/100
                        </p>
                    </div>

                    {/* 내용 입력 */}
                    <div className="form-group">
                        <label className="label-text">
                            내용 <span style={{color: 'red'}}>*</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="내용을 입력하세요"
                            rows={15}
                            className="textarea-field"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="button-group">
                        <button
                            type="button"
                            onClick={() => navigate(`/board/${id}`)}
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
                                    수정 중...
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
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