import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Dog, Cat, Bird, AlertCircle, MapPin, Heart } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionSite({ currentUser }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. 💡 DB에서 입양 공고 목록 불러오기
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

    // 4. 💡 로딩, 에러, 데이터 없음 UI 처리
    if (loading) {
        return (
            <div className="adoption-container loading-state">
                <div className="spinner-center"><div className="spinner-large"></div></div>
                <p className="loading-text">입양 공고를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="adoption-container error-state">
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
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */

                .adoption-container {
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
                .header-area {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #F2E2CE;
                }
                .header-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #594C3C;
                }
                .header-subtitle {
                    color: #735048; /* Primary Color */
                    margin-top: 4px;
                    font-size: 14px;
                }
                .write-button {
                    background-color: #735048; /* Primary Color */
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                    transition: background-color 0.15s;
                    text-decoration: none;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .write-button:hover {
                    background-color: #594C3C; /* Darker Brown */
                }
                
                /* 카드 그리드 */
                .card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                }
                
                /* 개별 카드 스타일 */
                .adoption-card {
                    display: block;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    border: 1px solid #F2E2CE;
                    transition: transform 0.2s, box-shadow 0.2s;
                    text-decoration: none;
                }
                .adoption-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                }
                
                .card-image-wrapper {
                    position: relative;
                    height: 224px; /* h-56 */
                    background-color: #F2EDE4;
                }
                .card-image {
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
                .status-입양가능 { background-color: #3b8a3e; } /* Custom Green */
                .status-상담중 { background-color: #fbbf24; } /* Custom Yellow */
                .status-입양완료 { background-color: #9ca3af; } /* Custom Gray */
                
                .card-content {
                    padding: 16px;
                    color: #594C3C;
                }
                .pet-name {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    transition: color 0.15s;
                }
                .adoption-card:hover .pet-name {
                    color: #735048; /* Primary Color on hover */
                }
                .pet-region {
                    font-size: 14px;
                    color: #735048;
                    margin-bottom: 12px;
                }
                .pet-details {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background-color: #F2E2CE; /* Light Accent */
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #594C3C;
                }
                
                /* 에러 및 로딩 상태 */
                .loading-state, .error-state {
                    min-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background-color: #F2EDE4;
                }
                .error-card {
                    text-align: center;
                    padding: 40px;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .icon-large {
                    width: 48px;
                    height: 48px;
                    color: #B91C1C; /* Red Icon */
                    margin: 0 auto 16px;
                }
                .retry-button {
                    margin-top: 16px;
                    padding: 8px 16px;
                    background-color: #735048;
                    color: white;
                    border-radius: 8px;
                    transition: background-color 0.15s;
                }
                .retry-button:hover {
                    background-color: #594C3C;
                }
            `}</style>

            <div className="main-wrapper">
                {/* 헤더 및 공고 작성 버튼 */}
                <div className="header-area">
                    <div>
                        <h1 className="header-title">입양 공고</h1>
                        <p className="header-subtitle">새로운 가족을 기다리는 아이들입니다. 총 {posts.length}건</p>
                    </div>
                    {/* 5. 💡 로그인한 사용자에게만 '공고 작성' 버튼 표시 */}
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

                {/* 6. 💡 공고 목록 그리드 */}
                {posts.length > 0 ? (
                    <div className="card-grid">
                        {posts.map(post => (
                            <AdoptionCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 bg-white rounded-lg shadow-lg text-gray-500">
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
    );
}

// 7. 💡 카드 컴포넌트
const AdoptionCard = ({ post }) => {
    const getSpeciesIcon = (species) => {
        if (species === '고양이') return <Cat className="w-4 h-4" />;
        if (species === '기타') return <Bird className="w-4 h-4" />;
        return <Dog className="w-4 h-4" />; // 기본값 '개'
    };

    return (
        // 8. 💡 상세 페이지로 이동하는 Link 태그
        <Link to={`/adoption/${post.id}`} className="adoption-card">
            <div className="card-image-wrapper">
                <img
                    src={post.image}
                    alt={post.name}
                    className="card-image"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://placehold.co/400x300/cccccc/ffffff?text=${post.name}`;
                    }}
                />
                <div className={`status-badge ${'status-' + (post.status || '입양가능')}`}>
                    {post.status || '입양가능'}
                </div>
            </div>
            <div className="card-content">
                <h3 className="pet-name">{post.name}</h3>
                <p className="pet-region flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{post.region}
                </p>
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