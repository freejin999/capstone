import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Dog, Cat, Bird, AlertCircle, MapPin, Heart } from 'lucide-react';

// 🌟 [핵심 수정] 로고 이미지 파일을 import 합니다. 
// (파일을 src/assets/images/logo.png 경로에 넣어주세요.)
import fallbackLogo from '../assets/images/logo.png'; 
const DEFAULT_LOGO_URL = fallbackLogo; // 이제 로고 이미지 변수를 기본값으로 사용합니다.

// 7. 💡 카드 컴포넌트 (파일 내부에 하나만 존재하도록 정의)
const AdoptionCard = ({ post }) => {
    const getSpeciesIcon = (species) => {
        if (species === '고양이') return <Cat className="w-4 h-4" />;
        if (species === '기타') return <Bird className="w-4 h-4" />;
        return <Dog className="w-4 h-4" />; // 기본값 '개'
    };

    // 🌟 [핵심 수정] post.image가 null이거나 비어있으면 import된 로고 URL을 사용
    const imageUrl = post.image || DEFAULT_LOGO_URL; 

    return (
        // 🌟 [수정] .adoption-card -> .list-item-card
        <Link to={`/adoption/${post.id}`} className="list-item-card">
            {/* 🌟 1. 사진 (왼쪽) */}
            <div className="list-image-wrapper">
                <img
                    src={imageUrl} // 🌟 수정된 URL 사용
                    alt={post.name}
                    className="list-image"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = DEFAULT_LOGO_URL; // 이미지 로드 오류 시 fallback
                    }}
                />
                <div className={`status-badge ${'status-' + (post.status || '입양가능')}`}>
                    {post.status || '입양가능'}
                </div>
            </div>
            {/* 🌟 2. 정보 (오른쪽) */}
            <div className="list-content">
                <div className="list-content-header">
                    <h3 className="pet-name">{post.name}</h3>
                    <p className="pet-region">
                        <MapPin className="w-4 h-4" />{post.region}
                    </p>
                </div>
                <div className="pet-details">
                    <span className="detail-item">
                        {getSpeciesIcon(post.species)} {post.species}
                    </span>
                    <span className="detail-item">
                        {post.breed}
                    </span>
                    <span className="detail-item">
                        {post.age}살
                    </span>
                    <span className="detail-item">
                        {post.gender}
                    </span>
                    <span className="detail-item">
                        {post.size}
                    </span>
                </div>
            </div>
        </Link>
    );
};


// App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionSite({ currentUser }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // DB에서 입양 공고 목록 불러오기
    useEffect(() => {
        fetchAdoptionPosts();
    }, []); // 최초 1회만 실행

    const fetchAdoptionPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/adoption');
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            } else {
                throw new Error('공고 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('입양 공고 API 오류:', err);
            setError('서버와의 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 로딩, 에러, 데이터 없음 UI 처리
    if (loading) {
        return (
            <div className="adoption-container loading-state">
                {/* 🌟 [수정] 스타일을 미리 적용하기 위해 <style> 태그 추가 */}
                <style>{styles}</style>
                <div className="spinner-center"><div className="spinner-large"></div></div>
                <p className="loading-text">입양 공고를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="adoption-container error-state">
                {/* 🌟 [수정] 스타일을 미리 적용하기 위해 <style> 태그 추가 */}
                <style>{styles}</style>
                <div className="error-card">
                    <AlertCircle className="icon-large" />
                    <p className="font-bold mb-2">오류 발생</p>
                    <p>😭 {error}</p>
                    <button 
                        onClick={fetchAdoptionPosts}
                        className="retry-button"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="adoption-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{styles}</style>

            <div className="main-wrapper">
                {/* 헤더 및 공고 작성 버튼 */}
                <div className="header-area">
                    <div>
                        <h1 className="header-title">입양 공고</h1>
                        <p className="header-subtitle">새로운 가족을 기다리는 아이들입니다. 총 {posts.length}건</p>
                    </div>
                    {currentUser && (
                        <Link
                            to="/adoption/write"
                            className="write-button"
                        >
                            <Plus className="w-5 h-5" />
                            새 공고 작성
                        </Link>
                    )}
                </div>

                {/* 🌟 [수정] .card-grid -> .list-container로 변경 (CSS 클래스명 변경) */}
                <div className="list-container">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <AdoptionCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="no-results-card">
                            <p>현재 등록된 입양 공고가 없습니다.</p>
                            {currentUser && (
                                <Link 
                                    to="/adoption/write"
                                    className="write-button"
                                    style={{marginTop: '16px', background: '#F2CBBD', color: '#735048'}}
                                >
                                    <Plus className="w-5 h-5" />
                                    첫 번째 공고를 등록해 보세요!
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 🌟 [수정] CSS 스타일 블록 전체 수정
const styles = `
    :root {
        --brand-primary: #735048;
        --brand-primary-dark: #594C3C;
        --brand-primary-light: #F2E2CE;
        --bg-main: #F2EDE4;
        --bg-card: #ffffff;
        --border-color: #F2CBBD;
        --border-color-light: #F2E2CE;
        --text-primary: #374151;
        --text-light: #6b7280;
    }

    .adoption-container {
        min-height: 100vh;
        background-color: var(--bg-main);
        padding: 32px 0;
        font-family: 'Inter', sans-serif;
    }
    .main-wrapper {
        max-width: 1024px; /* 🌟 [수정] max-w-5xl (1024px) */
        margin: 0 auto;
        padding: 0 16px;
    }
    .header-area {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        padding-bottom: 16px;
        border-bottom: 2px solid var(--border-color-light);
    }
    .header-title {
        font-size: 28px;
        font-weight: bold;
        color: var(--brand-primary-dark);
    }
    .header-subtitle {
        color: var(--brand-primary);
        margin-top: 4px;
        font-size: 14px;
    }
    .write-button {
        background-color: var(--brand-primary);
        color: white;
        padding: 12px 24px;
        border-radius: 12px; /* 🌟 둥글게 */
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        transition: all 0.2s ease;
        text-decoration: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .write-button:hover {
        background-color: var(--brand-primary-dark);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    /* 🌟 [수정] 그리드 -> 리스트 컨테이너 */
    .list-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem; /* 24px */
    }

    /* 🌟 [수정] 카드 -> 리스트 아이템 (가로형) */
    .list-item-card {
        display: flex;
        flex-direction: row; /* 가로 정렬 */
        height: 200px; /* 고정 높이 */
        background-color: var(--bg-card);
        border-radius: 16px; /* 몽글몽글 */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--border-color-light);
        transition: transform 0.2s, box-shadow 0.2s;
        text-decoration: none;
        overflow: hidden; /* 둥근 모서리 적용 */
    }
    .list-item-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    /* 🌟 [수정] 이미지 래퍼 (왼쪽) */
    .list-image-wrapper {
        position: relative;
        height: 100%; /* 부모 높이(200px) 꽉 채움 */
        width: 200px; /* 고정 너비 */
        flex-shrink: 0; /* 찌그러지지 않음 */
        background-color: var(--bg-main);
    }
    .list-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .status-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        color: white;
    }
    .status-입양가능 { background-color: #3b8a3e; }
    .status-상담중 { background-color: #fbbf24; }
    .status-입양완료 { background-color: #9ca3af; }
    
    /* 🌟 [수정] 콘텐츠 래퍼 (오른쪽) */
    .list-content {
        padding: 1.5rem; /* 24px */
        color: var(--brand-primary-dark);
        flex-grow: 1; /* 남은 공간 모두 차지 */
        display: flex;
        flex-direction: column;
        justify-content: space-between; /* 위 아래로 요소를 밀착 */
    }
    .list-content-header {
        /* 상단 (이름, 지역) */
    }
    .pet-name {
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 4px;
        transition: color 0.15s;
        color: var(--brand-primary-dark);
    }
    .list-item-card:hover .pet-name {
        color: var(--brand-primary);
    }
    .pet-region {
        font-size: 14px;
        color: var(--brand-primary-text);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .pet-details {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        /* margin-top: auto; - space-between으로 대체 */
    }
    .detail-item {
        display: flex;
        align-items: center;
        gap: 4px;
        background-color: var(--bg-main);
        padding: 6px 10px; /* 🌟 패딩 살짝 키움 */
        border-radius: 8px; /* 🌟 둥글게 */
        font-size: 14px;
        color: var(--brand-primary-text);
    }
    
    /* ( ... 로딩, 에러, No-Results 카드 스타일 ... ) */
    .loading-state, .error-state {
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #F2EDE4;
    }
    .spinner-center {
        padding: 2rem;
    }
    .spinner-large {
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--brand-primary); 
        border-radius: 50%;
        width: 48px;
        height: 48px;
        animation: spin 1s linear infinite;
    }
    .loading-text {
        color: var(--brand-primary-dark);
        font-weight: 500;
    }
    .error-card {
        text-align: center;
        padding: 40px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        color: var(--brand-danger-text);
    }
    .icon-large {
        width: 48px;
        height: 48px;
        color: #B91C1C;
        margin: 0 auto 16px;
    }
    .retry-button {
        margin-top: 16px;
        padding: 10px 20px;
        background-color: var(--brand-primary);
        color: white;
        border-radius: 8px;
        transition: background-color 0.15s;
        border: none;
        cursor: pointer;
    }
    .retry-button:hover {
        background-color: var(--brand-primary-dark);
    }
    .no-results-card {
        text-align: center; 
        padding: 40px; 
        background-color: white; 
        border-radius: 12px; 
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
        color: var(--text-light);
    }

    /* 🌟 [추가] 모바일 반응형 */
    @media (max-width: 640px) {
        .list-item-card {
            flex-direction: column; /* 모바일에선 다시 세로로 쌓임 */
            height: auto; /* 높이 자동 */
        }
        .list-image-wrapper {
            width: 100%; /* 이미지 가로 꽉 채움 */
            height: 250px; /* 모바일 이미지 높이 */
        }
        .header-area {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }
        .write-button {
            width: 100%;
            justify-content: center;
        }
    }
`;