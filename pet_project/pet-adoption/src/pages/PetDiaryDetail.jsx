import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// 🌟 [수정] Image, AlertCircle 아이콘 추가
import { ArrowLeft, Calendar, Edit, Trash2, Phone, Image, AlertCircle } from 'lucide-react'; 

export default function PetDiaryDetail({ currentUser }) {
    const { id } = useParams(); // URL에서 일기 ID 가져오기
    const navigate = useNavigate();
    
    // 2. 일기 데이터, 로딩, 에러 상태
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. DB에서 일기 1개 불러오는 useEffect
    useEffect(() => {
        fetchDiaryDetail(id);
    }, [id]);

    /**
     * 4. 💡 API 호출 함수
     * @param {string} diaryId - URL에서 가져온 일기 ID
     */
    const fetchDiaryDetail = async (diaryId) => {
        setLoading(true);
        setError(null);
        try {
            // 💡 API 호출 (GET /api/diaries/entry/:id)
            const response = await fetch(`http://localhost:3001/api/diaries/entry/${diaryId}`);
            if (response.ok) {
                const data = await response.json();
                setDiary(data);
            } else if (response.status === 404) {
                setError('해당 일기를 찾을 수 없습니다.');
            } else {
                throw new Error('일기를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('일기 상세 로드 오류:', err);
            setError('서버와의 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 5. 🌟 '삭제' 핸들러 로직 구현
    const handleDelete = async () => {
        // [보안] 본인 확인 로직
        // 🌟 [수정] data.author(username) -> data.userId(숫자ID)로 비교
        if (!currentUser || (diary.userId !== currentUser.id)) {
            alert('일기를 삭제할 권한이 없습니다.');
            return;
        }

        // 🚨 alert() 대신 window.confirm()을 사용해야 하지만,
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('정말로 이 일기를 삭제하시겠습니까?')) {
            return;
        }

        try {
            // [수정] API 호출 (DELETE)
            const response = await fetch(`http://localhost:3001/api/diaries/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                // [보안] 본인 인증을 위해 userId를 body에 담아 전송
                // 🌟 [수정] currentUser.username -> currentUser.id (숫자)
                body: JSON.stringify({ userId: currentUser.id }) 
            });

            if (response.ok) {
                alert('일기가 삭제되었습니다.');
                navigate('/diary'); // 목록으로 이동
            } else {
                const errData = await response.json();
                alert(errData.message || '삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error('삭제 API 오류:', err);
            alert('서버 오류로 삭제에 실패했습니다.');
        }
    };

    // 8. 기분(mood)에 따른 스타일 반환
    const getMoodStyle = (mood) => {
        switch (mood) {
            case '행복': return 'mood-happy';
            case '슬픔': return 'mood-sad';
            case '설렘': return 'mood-excited';
            case '화남': return 'mood-angry';
            case '일상':
            default: return 'mood-normal';
        }
    };

    // ----------------------------------------------------
    // 로딩 및 에러 렌더링
    // ----------------------------------------------------
    if (loading) {
        return (
            <div className="diary-container loading-state">
                {/* 🌟 [추가] 로딩 중에도 스타일이 깨지지 않도록 <style> 태그 포함 */}
                <style>{styles}</style> 
                <div className="spinner-large"></div>
                <p className="loading-text">일기를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="diary-container error-state">
                <style>{styles}</style> 
                <div className="error-card">
                    {/* 🌟 [수정] AlertCircle 아이콘 사용 */}
                    <AlertCircle className="icon-large" />
                    <p className="error-message">{error}</p>
                    <button
                        onClick={() => navigate('/diary')}
                        className="action-button primary-button"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (!diary) {
        return null;
    }
    
    // 7. 🌟 [수정] 본인 글인지 확인 (diary.userId와 currentUser.id 비교)
    const isOwner = currentUser && diary.userId === currentUser.id;


    return (
        <div className="diary-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            {/* 🌟 [수정] '몽글몽글' 테마의 CSS로 변경 */}
            <style>{styles}</style>

            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <button onClick={() => navigate('/diary')} className="back-button">
                        <ArrowLeft className="w-5 h-5" />일기 목록으로
                    </button>
                </div>
            </header>

            <main className="main-wrapper">
                <article className="diary-card">

                    {/* 🌟 [추가] 이미지 표시 영역 */}
                    {diary.image ? (
                        <div className="image-wrapper">
                            <img 
                                src={diary.image} 
                                alt={diary.title} 
                                className="main-image"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/F2E2CE/594C3C?text=Image"; }}
                            />
                        </div>
                    ) : (
                        <div className="image-placeholder">
                             <Image className="icon-placeholder" />
                             <span>사진이 없습니다.</span>
                        </div>
                    )}
                    
                    {/* 게시글 헤더 */}
                    <div className="card-header">
                        <div className="header-top">
                            <span className={`mood-badge ${getMoodStyle(diary.mood)}`}>
                                {diary.mood}
                            </span>
                            {/* 9. 🌟 [수정] 본인 글일 때만 '수정/삭제' 버튼 보이기 */}
                            {isOwner && (
                                <div className="button-group">
                                    <Link 
                                        to={`/diary/edit/${diary.id}`} 
                                        className="button edit"
                                    >
                                        <Edit className="icon-xs" />수정
                                    </Link>
                                    <button 
                                        onClick={handleDelete} 
                                        className="button delete"
                                    >
                                        <Trash2 className="icon-xs" />삭제
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* 제목 */}
                        <h1 className="title">{diary.title}</h1>
                        {/* 메타 정보 */}
                        <div className="meta">
                            <div className="meta-item">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(diary.createdAt).toLocaleString('ko-KR')}</span>
                            </div>
                            {/* 🌟 [제거] 작성자 표시는 DB JOIN이 필요하므로 일단 제거
                            <div className="meta-item">
                                <span>작성자: {diary.author}</span>
                            </div>
                            */}
                        </div>
                    </div>
                    
                    {/* 게시글 본문 */}
                    <div className="diary-body">
                        <div className="content">
                            <p>{diary.content}</p>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}

// 🌟 [수정] 몽글몽글 테마 CSS
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
    --text-primary: #374151;
    --text-light: #6b7280;
    --danger-color: #991b1b;
    --danger-color-light: #be123c; /* rose-700 */
    --brand-danger-bg: #fff1f2; /* rose-50 */
    --brand-danger-text: #9f1239; /* rose-900 */
    --brand-danger-border: #fecdd3; /* rose-200 */
}

/* ===============================================
 * 1. 메인 레이아웃
 * =============================================== */
.diary-container {
    min-height: 100vh;
    background-color: var(--bg-main);
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
}
.diary-container *, .diary-container *:before, .diary-container *:after {
    box-sizing: inherit;
}

.diary-container.loading-state, .diary-container.error-state {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-main);
    color: var(--text-light);
    text-align: center;
}
.spinner-large {
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--brand-primary); 
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.loading-text {
    margin-top: 16px;
    font-weight: 500;
    color: var(--brand-primary-dark);
}
.error-card {
    padding: 32px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.error-message {
    color: var(--danger-color);
    font-size: 20px;
    margin-bottom: 16px;
}
.icon-large {
    width: 48px;
    height: 48px;
    color: #B91C1C; 
    margin: 0 auto 16px;
}
.action-button.primary-button {
    background-color: var(--brand-primary);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    text-decoration: none;
}


/* ===============================================
 * 2. 헤더
 * =============================================== */
.header {
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid var(--border-color-light);
}
.header-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-light);
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
    color: var(--brand-primary);
    background-color: var(--bg-main);
}
.icon-sm {
    width: 1.25rem;
    height: 1.25rem;
}

/* ===============================================
 * 3. 메인 콘텐츠 (카드)
 * =============================================== */
.main-wrapper { /* 🌟 [수정] main-content -> main-wrapper */
    max-width: 900px;
    margin: 32px auto;
    padding: 0 16px;
}
.diary-card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid var(--border-color-light);
}

/* 🌟 [추가] 이미지 */
.image-wrapper {
    width: 100%;
    max-height: 500px;
    background-color: var(--bg-main);
}
.main-image {
    width: 100%;
    height: 100%;
    max-height: 500px;
    object-fit: contain; /* 사진이 잘리지 않도록 */
}
.image-placeholder {
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-main);
    color: var(--border-color);
}
.icon-placeholder {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
}


.card-header {
    padding: 24px;
    border-bottom: 1px solid var(--border-color-light);
}
.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.title {
    font-size: 32px;
    font-weight: bold;
    color: var(--brand-primary-dark);
    margin-bottom: 16px;
}
.meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: var(--brand-primary-text);
    padding-top: 12px;
    border-top: 1px dashed var(--border-color-light);
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-light); /* 🌟 [수정] 날짜/작성자 텍스트 색상 */
}
.icon-xs { /* 🌟 [추가] */
    width: 14px;
    height: 14px;
}

/* 본문 스타일 */
.diary-body {
    padding: 24px;
}
.content {
    color: var(--text-primary);
    line-height: 1.7;
    white-space: pre-wrap;
    min-height: 200px;
}
.content p {
    margin: 0; /* 🌟 <p> 태그 기본 마진 제거 */
}

/* 무드 배지 스타일 */
.mood-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 600;
}
/* 🌟 [수정] 몽글몽글 테마 색상 적용 */
.mood-행복 { background-color: #fef3c7; color: #a16207; } /* amber-100 / amber-800 */
.mood-슬픔 { background-color: #dbeafe; color: #1e40af; } /* blue-100 / blue-800 */
.mood-설렘 { background-color: #fce7f3; color: #be185d; } /* pink-100 / pink-700 */
.mood-일상 { background-color: #f3f4f6; color: #4b5563; } /* gray-100 / gray-600 */
.mood-화남 { background-color: var(--brand-danger-bg); color: var(--brand-danger-text); }
 
/* 하단 버튼 그룹 스타일 */
.bottom-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
.action-button {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    transition: background-color 0.15s;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--brand-primary);
    color: var(--brand-primary);
    background-color: white;
}
.action-button:hover {
    background-color: var(--bg-main);
}
.delete-button {
    background-color: #B91C1C; 
    color: white;
    border: none;
}
.delete-button:hover {
    background-color: #991B1B;
}

/* 🌟 [추가] .button-group (수정/삭제 버튼) */
.button-group {
    display: flex;
    gap: 0.5rem;
}
.button {
    font-size: 0.75rem; /* text-xs */
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: background-color 0.2s ease;
    border: 1px solid;
    cursor: pointer;
    text-decoration: none;
}
.button.edit {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
}
.button.edit:hover { background-color: var(--bg-main); }
.button.delete {
    background-color: transparent;
    border-color: var(--brand-danger-text);
    color: var(--brand-danger-text); 
}
.button.delete:hover {
    background-color: var(--brand-danger-bg); 
    color: var(--danger-color); 
}
`;