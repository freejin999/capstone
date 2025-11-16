import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Image, Heart } from 'lucide-react';
// 🌟 [제거] import './PetDiary.css';

// ===============================================
// 💡 CSS 스타일 블록
// ===============================================
// PetDiary.css의 내용을 여기에 붙여넣습니다.
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
}

/* ===============================================
 * 1. 메인 레이아웃
 * =============================================== */
.diary-container {
    min-height: 100vh;
    background-color: var(--bg-main);
    padding: 32px 0;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
}
.diary-container *, .diary-container *:before, .diary-container *:after {
    box-sizing: inherit;
}
.main-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}
.diary-header {
    font-size: 28px;
    font-weight: bold;
    color: var(--brand-primary-text);
    margin-bottom: 24px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border-color-light);
}

/* 로딩/에러 상태 */
.diary-container.loading-state, .diary-container.error-state {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
    color: var(--brand-primary-dark);
    font-weight: 500;
}
.error-message {
    color: var(--danger-color);
    font-size: 1.125rem;
    margin-bottom: 1rem;
}
.primary-button {
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
 * 2. 필터 및 검색
 * =============================================== */
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
.mood-tabs {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color-light);
    flex-wrap: wrap; 
}
.mood-button {
    padding: 10px 16px;
    font-weight: 500;
    transition: background-color 0.2s, color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--brand-primary-text);
    border-radius: 10px;
    margin: 4px;
}
.mood-button:hover {
    background-color: var(--bg-main);
}
.mood-button.active {
    color: white; 
    background-color: var(--brand-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin: 4px;
}

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
    height: 44px;
    padding: 8px 12px 8px 40px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-sizing: border-box;
    font-size: 16px;
}
.search-input:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 2px var(--brand-primary-light);
    outline: none;
}
.write-button {
    background-color: var(--brand-primary);
    color: white;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    text-decoration: none;
    white-space: nowrap;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.write-button:hover {
    background-color: var(--brand-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
}
.icon-sm {
    width: 1.25rem;
    height: 1.25rem;
}

/* ===============================================
 * 3. 일기 카드 그리드
 * =============================================== */
.diary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 24px;
}
.diary-card {
    display: block; /* Link로 사용 */
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border: 1px solid var(--border-color-light);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    display: flex;
    flex-direction: column;
}
.diary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.diary-card-image-wrapper {
    width: 100%;
    height: 180px; /* 고정 이미지 높이 */
    background-color: var(--bg-main);
    display: flex;
    align-items: center;
    justify-content: center;
}
.diary-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-main);
}
.icon-placeholder {
    width: 40px;
    height: 40px;
    color: var(--border-color);
}

.diary-card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* 🌟 카드가 꽉 차도록 */
}
.content-top {
    flex-grow: 1; /* 🌟 제목/기분이 위쪽을 차지 */
}
.mood-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 8px;
}
/* Mood Colors */
.mood-행복 { background-color: #fef3c7; color: #a16207; } /* amber-100 / amber-800 */
.mood-슬픔 { background-color: #dbeafe; color: #1e40af; } /* blue-100 / blue-800 */
.mood-설렘 { background-color: #fce7f3; color: #be185d; } /* pink-100 / pink-700 */
.mood-일상 { background-color: #f3f4f6; color: #4b5563; } /* gray-100 / gray-600 */
.mood-화남 { background-color: #fee2e2; color: #991b1b; } /* red-100 / red-800 */

.diary-card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--brand-primary-dark);
    margin-bottom: 8px;
    /* 1줄 말줄임표 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.diary-card-footer {
    padding-top: 12px;
    margin-top: auto; /* 🌟 날짜를 항상 하단에 고정 */
    border-top: 1px dashed var(--border-color-light);
    color: var(--text-light);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.icon-xs {
    width: 14px;
    height: 14px;
}

/* 데이터 없음 */
.empty-state {
    text-align: center;
    padding: 50px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}
.empty-state p {
    font-size: 1.125rem;
    color: var(--brand-primary-text);
}
.empty-state .write-button.empty {
    margin-top: 20px;
    background-color: var(--border-color);
    color: var(--brand-primary-text);
}
.empty-state .write-button.empty:hover {
    background-color: var(--border-color-light);
    color: var(--brand-primary-dark);
}
`;

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetDiary({ currentUser }) {
    const navigate = useNavigate();
    const [diaries, setDiaries] = useState([]); // 💡 DB에서 불러온 일기를 저장할 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMood, setSelectedMood] = useState('전체');

    const moods = ['전체', '행복', '슬픔', '설렘', '일상', '화남']; // 🌟 '화남' 추가
    
    // 2. 💡 DB에서 일기를 불러오는 useEffect
    useEffect(() => {
        if (currentUser) {
            fetchDiaries(currentUser.username);
        } else {
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
            const response = await fetch(`http://localhost:3001/api/diaries/${username}`); 
            if (response.ok) {
                const data = await response.json();
                setDiaries(data);
            } else if (response.status === 404) {
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

    // 🌟 [수정] 로딩 및 에러 상태 렌더링
    if (loading) {
        return (
            <div className="diary-container loading-state">
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
                <p className="error-message">{error}</p>
                <button onClick={() => navigate('/')} className="primary-button">홈으로</button>
            </div>
        );
    }


    return (
        <div className="diary-container">
            {/* 🌟 [추가] <style> 태그로 CSS 주입 */}
            <style>{styles}</style>

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
                            <Plus className="icon-sm" />
                            새 일기 작성
                        </Link>
                    </div>
                </div>
                
                {/* 🌟 [수정] 일기 목록 그리드 (새 디자인 적용) */}
                {filteredDiaries.length > 0 ? (
                    <div className="diary-grid">
                        {filteredDiaries.map(diary => (
                            <Link 
                                to={`/diary/${diary.id}`} 
                                key={diary.id} 
                                className="diary-card"
                            >
                                {/* 🌟 1. 이미지 영역 */}
                                <div className="diary-card-image-wrapper">
                                    {diary.image ? (
                                        <img 
                                            src={diary.image} 
                                            alt={diary.title} 
                                            className="diary-card-image"
                                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/F2E2CE/594C3C?text=Image"; }}
                                        />
                                    ) : (
                                        <div className="image-placeholder">
                                            <Image className="icon-placeholder" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* 🌟 2. 콘텐츠 영역 */}
                                <div className="diary-card-content">
                                    <div className="content-top">
                                        <span className={`mood-badge mood-${diary.mood}`}>
                                            {diary.mood}
                                        </span>
                                        <h2 className="diary-card-title">{diary.title}</h2>
                                    </div>
                                    <div className="diary-card-footer">
                                        <Calendar className="icon-xs"/> 
                                        <span>{new Date(diary.createdAt).toISOString().split('T')[0]}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>😭 
                            {searchTerm ? '검색 결과가 없습니다.' : '작성된 일기가 없습니다.'}
                        </p>
                        <Link 
                            to="/diary/write" 
                            className="write-button empty"
                        >
                            <Plus className="icon-sm" />
                            첫 번째 일기 작성하기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}