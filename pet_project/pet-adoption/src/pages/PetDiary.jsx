import React, { useState, useEffect } from 'react';
// 💡 Link를 import합니다.
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Image, Heart } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetDiary({ currentUser }) {
    const navigate = useNavigate();
    const [diaries, setDiaries] = useState([]); // 💡 DB에서 불러온 일기를 저장할 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMood, setSelectedMood] = useState('전체');

    const moods = ['전체', '행복', '슬픔', '설렘', '일상'];
    
    // 2. 💡 DB에서 일기를 불러오는 useEffect
    useEffect(() => {
        // currentUser가 있어야만(로그인해야만) 일기를 불러옵니다.
        if (currentUser) {
            fetchDiaries(currentUser.username);
        } else {
            // PrivateRoute가 막아주겠지만, 비로그인 상태 대비
            setLoading(false);
            setError("일기를 불러오려면 로그인이 필요합니다.");
        }
    }, [currentUser]); // currentUser가 바뀔 때마다(로그인 시) 실행

    /**
     * 3. 💡 API 호출 함수
     * @param {string} username - 로그인한 사용자의 ID
     */
    const fetchDiaries = async (username) => {
        setLoading(true);
        setError(null);
        try {
            // 💡 주의: 백엔드에 이 API (GET /api/diaries/:username) 구현 필요!
            const response = await fetch(`http://localhost:3001/api/diaries/${username}`); 
            if (response.ok) {
                const data = await response.json();
                setDiaries(data);
            } else if (response.status === 404) {
                 // DB에 데이터가 없는 경우도 성공으로 처리
                 setDiaries([]);
            } else {
                throw new Error('일기를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('일기 로드 오류:', err);
            setError('서버와의 연결에 실패했거나, 일기 API 구현이 필요합니다.');
        } finally {
            setLoading(false);
        }
    };

    // 4. 필터링 로직 (DB에서 가져온 'diaries' 상태를 사용)
    const filteredDiaries = diaries.filter(diary => {
        const matchesMood = selectedMood === '전체' || diary.mood === selectedMood;
        const matchesSearch = (diary.title && diary.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (diary.content && diary.content.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesMood && matchesSearch;
    });

    // 로딩 및 에러 상태 렌더링
    if (loading) {
        return <div className="diary-container loading-state"><div className="spinner-large"></div><p className="loading-text">일기를 불러오는 중...</p></div>;
    }
    if (error) {
        return <div className="diary-container error-state"><p className="error-message">{error}</p><button onClick={() => navigate('/')} className="primary-button">홈으로</button></div>;
    }


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
                    padding: 32px 0;
                    font-family: 'Inter', sans-serif;
                }
                .main-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 16px;
                }
                .diary-header {
                    font-size: 28px;
                    font-weight: bold;
                    color: #735048; /* Primary Color */
                    margin-bottom: 24px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #F2E2CE;
                }

                /* 필터 및 버튼 영역 */
                .filter-area {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                @media (min-width: 768px) {
                    .filter-area {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                    }
                }

                /* Mood 탭 스타일 */
                .mood-tabs {
                    display: flex;
                    overflow-x: auto;
                    white-space: nowrap;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    border: 1px solid #F2E2CE;
                    flex-wrap: wrap; /* 모바일에서 랩핑 */
                }
                .mood-button {
                    padding: 8px 16px;
                    font-weight: 500;
                    transition: background-color 0.15s, color 0.15s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #594C3C;
                }
                .mood-button:hover {
                    background-color: #F2E2CE;
                }
                .mood-button.active {
                    color: white; 
                    background-color: #735048; /* Primary Color */
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    margin: 2px;
                }
                
                /* 검색 및 작성 버튼 그룹 */
                .search-group {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                }
                @media (min-width: 768px) {
                    .search-group {
                        width: auto;
                    }
                }
                .search-input-wrapper {
                    position: relative;
                    flex-grow: 1;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 20px;
                    color: #A0A0A0;
                }
                .search-input {
                    width: 100%;
                    padding: 8px 12px 8px 40px;
                    border: 1px solid #F2CBBD;
                    border-radius: 8px;
                    box-sizing: border-box;
                    font-size: 16px;
                }
                .write-button {
                    background-color: #F2CBBD; /* Accent Color */
                    color: #735048;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background-color 0.15s;
                    text-decoration: none;
                    white-space: nowrap;
                    border: none;
                }
                .write-button:hover {
                    background-color: #F2E2CE;
                }
                
                /* 일기 카드 그리드 */
                .diary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                    margin-top: 24px;
                }
                .diary-card {
                    display: block; /* Link로 사용 */
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    border: 1px solid #F2E2CE;
                    transition: transform 0.2s, box-shadow 0.2s;
                    text-decoration: none;
                }
                .diary-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
                }
                .card-padding {
                    padding: 20px;
                }
                .mood-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 500;
                }
                /* Mood Colors */
                .mood-행복 { background-color: #e9f5db; color: #5a8a1f; }
                .mood-슬픔 { background-color: #e0f2f1; color: #00796b; }
                .mood-설렘 { background-color: #ffe0b2; color: #ff9800; }
                .mood-일상 { background-color: #f5f5f5; color: #594C3C; }

                .card-footer {
                    padding-top: 12px;
                    margin-top: 12px;
                    border-top: 1px dashed #F2E2CE;
                    color: #735048;
                }
                .footer-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .footer-item-text {
                    font-size: 14px;
                }
                .empty-state {
                    text-align: center;
                    padding: 50px;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
                }
                .empty-state a {
                    margin-top: 16px;
                    text-decoration: none;
                }

                /* 로딩/에러 상태 */
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

            <div className="main-wrapper">
                <h1 className="diary-header">반려동물 일기 🐾</h1>
                
                {/* 필터 및 검색, 작성 버튼 영역 */}
                <div className="filter-area">
                    {/* Mood 필터 탭 */}
                    <div className="mood-tabs">
                        {moods.map(mood => (
                            <button
                                key={mood}
                                onClick={() => setSelectedMood(mood)}
                                className={`mood-button ${selectedMood === mood ? 'active' : ''}`}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>

                    {/* 검색 및 작성 버튼 */}
                    <div className="search-group">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="제목 또는 내용 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        
                        {/* 새 일기 작성 버튼 */}
                        <Link to="/diary/write" className="write-button">
                            <Plus className="w-5 h-5" />
                            새 일기 작성
                        </Link>
                    </div>
                </div>
                
                {/* 일기 목록 그리드 */}
                {filteredDiaries.length > 0 ? (
                    <div className="diary-grid">
                        {filteredDiaries.map(diary => (
                            <Link 
                                to={`/diary/${diary.id}`} 
                                key={diary.id} 
                                className="diary-card"
                            >
                                <div className="card-padding">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`mood-badge mood-${diary.mood}`}>
                                            {diary.mood}
                                        </span>
                                        <span className="footer-item-text flex items-center gap-1">
                                            <Calendar className="w-4 h-4"/> {new Date(diary.createdAt).toISOString().split('T')[0]}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">{diary.title}</h2>
                                    <p className="text-sm text-gray-600 mb-4" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{diary.content}</p>

                                    <div className="card-footer flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="footer-item">
                                                <Image className="w-4 h-4"/> 0장
                                            </span>
                                            <span className="footer-item" style={{color: '#B91C1C'}}>
                                                <Heart className="w-4 h-4 fill-current"/> 0
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium" style={{color: '#735048'}}>
                                            자세히 보기
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p className="text-lg" style={{color: '#735048'}}>😭 작성된 일기가 없습니다. 새로운 추억을 기록해 보세요!</p>
                        <Link 
                            to="/diary/write" 
                            className="write-button"
                            style={{marginTop: '20px', backgroundColor: '#F2CBBD', color: '#735048'}}
                        >
                            <Plus className="w-5 h-5" />
                            지금 작성하기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}