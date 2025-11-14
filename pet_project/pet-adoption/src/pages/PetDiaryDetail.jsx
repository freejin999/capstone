import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// Fix: Phone 아이콘을 import 목록에 추가했습니다.
import { ArrowLeft, Calendar, Edit, Trash2, Phone } from 'lucide-react'; 

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
     * 4. API 호출 함수
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
        // Note: DB 연동 시 diary.userId가 currentUser.id와 일치하는지 확인해야 합니다.
        if (!currentUser || (diary.author !== currentUser.username && diary.userId !== currentUser.id)) {
            alert('일기를 삭제할 권한이 없습니다.');
            return;
        }

        // 🚨 alert() 대신 window.confirm()을 사용해야 하지만,
        if (!window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
            return;
        }

        try {
            // [수정] API 호출 (DELETE)
            const response = await fetch(`http://localhost:3001/api/diaries/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                // [보안] 본인 인증을 위해 userId를 body에 담아 전송
                body: JSON.stringify({ userId: currentUser.username }) // username을 userId로 사용한다고 가정
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
        return <div className="diary-container loading-state"><div className="spinner-large"></div><p className="loading-text">일기를 불러오는 중...</p></div>;
    }

    if (error) {
        return (
            <div className="diary-container error-state">
                <div className="error-card">
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
    
    // 7. 🌟 본인 글인지 확인 (post.author는 username이 저장된다고 가정)
    const isOwner = currentUser && diary.author === currentUser.username;


    return (
        <div className="diary-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
                
                .diary-container {
                    min-height: 100vh;
                    background-color: #F2EDE4; /* Light Background */
                    font-family: 'Inter', sans-serif;
                }
                .main-wrapper {
                    max-width: 900px;
                    margin: 32px auto;
                    padding: 0 16px;
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
                }
                .back-button:hover {
                    color: #735048;
                }
                
                /* 카드 및 콘텐츠 스타일 */
                .diary-card {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    border: 1px solid #F2E2CE;
                }
                .card-header {
                    padding: 24px;
                    border-bottom: 1px solid #F2E2CE;
                }
                .title {
                    font-size: 32px;
                    font-weight: bold;
                    color: #594C3C;
                    margin-bottom: 16px;
                }
                .meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                    color: #735048;
                    padding-top: 12px;
                    border-top: 1px dashed #F2E2CE;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                /* 본문 스타일 */
                .diary-body {
                    padding: 24px;
                }
                .content {
                    color: #594C3C;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    min-height: 200px;
                }
                
                /* 무드 배지 스타일 */
                .mood-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 9999px;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px; /* 추가 */
                }
                /* Mood Colors - 기존 색상 유지하면서 Primary/Accent와 톤 일치 */
                .mood-happy { background-color: #F2CBBD; color: #735048; } 
                .mood-sad { background-color: #dbe4f1; color: #3b82f6; } /* Light Blue */
                .mood-excited { background-color: #fef3c7; color: #fbbf24; } /* Light Yellow */
                .mood-normal { background-color: #f5f5f5; color: #594C3C; } /* Light Gray */
                .mood-angry { background-color: #fecaca; color: #ef4444; } /* Light Red */
                
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
                    border: 1px solid #735048;
                    color: #735048;
                    background-color: white;
                }
                .action-button:hover {
                    background-color: #F2E2CE;
                }
                .delete-button {
                    background-color: #B91C1C; /* Red */
                    color: white;
                    border: none;
                }
                .delete-button:hover {
                    background-color: #991B1B;
                }

                /* 로딩/에러 상태 */
                .loading-state, .error-state {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background-color: #F2EDE4;
                    color: #594C3C;
                    text-align: center;
                }
                .error-card {
                    padding: 32px;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .error-message {
                    color: #735048;
                    font-size: 20px;
                    margin-bottom: 16px;
                }
                .spinner-large {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #735048; 
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

            `}</style>

            <header className="header">
                <div className="header-content">
                    <button onClick={() => navigate('/diary')} className="back-button">
                        <ArrowLeft className="w-5 h-5" />일기 목록으로
                    </button>
                </div>
            </header>

            <main className="main-wrapper">
                <article className="diary-card">
                    {/* 게시글 헤더 */}
                    <div className="card-header">
                        <div className="flex justify-between items-center mb-3">
                            <span className={`mood-badge ${getMoodStyle(diary.mood)}`}>
                                {diary.mood}
                            </span>
                            {/* 9. 🌟 [수정] 본인 글일 때만 '수정/삭제' 버튼 보이기 */}
                            {isOwner && (
                                <div className="bottom-actions" style={{marginTop: 0, padding: 0}}>
                                    <Link 
                                        to={`/diary/edit/${diary.id}`} 
                                        className="action-button"
                                    >
                                        <Edit className="w-4 h-4" />수정
                                    </Link>
                                    <button 
                                        onClick={handleDelete} 
                                        className="action-button delete-button"
                                    >
                                        <Trash2 className="w-4 h-4" />삭제
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
                            <div className="meta-item">
                                <span>작성자: {diary.author}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* 게시글 본문 */}
                    <div className="diary-body">
                        <div className="content">
                            <p>{diary.content}</p>
                        </div>
                    </div>
                </article>
                
                {/* 하단 버튼 (모바일용 및 Owner가 아닐 때를 대비한 목록 버튼) */}
                <div className="bottom-actions" style={{justifyContent: 'flex-start'}}>
                    <button onClick={() => navigate('/diary')} className="action-button edit-button">
                        <ArrowLeft className="w-4 h-4" /> 목록으로
                    </button>
                </div>
            </main>
        </div>
    );
}