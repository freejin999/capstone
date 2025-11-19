import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Send, AlertCircle, Dog, Cat, Bird, User, Calendar, MapPin, Image } from 'lucide-react'; // 🌟 Image 아이콘 추가

// 🌟 [핵심 수정] 로컬 파일 import를 사용하여 로고 이미지를 변수에 저장합니다.
// (파일이 src/assets/images/ 경로에 있어야 합니다.)
import fallbackLogo from '../assets/images/logo.png'; 
const DEFAULT_LOGO_URL = fallbackLogo; // import된 로컬 파일 URL을 사용합니다.

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionDetail({ currentUser }) {
    const { id } = useParams(); // URL에서 공고 ID 가져오기
    const navigate = useNavigate();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // 2. 💡 입양 신청 버튼 로딩 상태

    // 3. 💡 DB에서 공고 1개 불러오기
    useEffect(() => {
        fetchAdoptionPost(id);
    }, [id]);

    const fetchAdoptionPost = async (postId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/adoption/${postId}`);
            if (response.ok) {
                const data = await response.json();
                setPost(data);
            } else if (response.status === 404) {
                setError('해당 입양 공고를 찾을 수 없습니다.');
            } else {
                throw new Error('공고를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('공고 상세 로드 오류:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. 💡 [NEW] 입양 신청 핸들러
    const handleApply = async () => {
        // 4-1. [보안] 로그인 확인
        if (!currentUser) {
            alert('입양 신청을 하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        // 4-2. 🚨 alert() 대신 커스텀 모달 권장
        // eslint-disable-next-line no-restricted-globals
        const isConfirmed = confirm(`정말로 '${post.name}'의 입양을 신청하시겠습니까? 신청 내역은 마이페이지에서 확인하실 수 있습니다.`);
        
        if (!isConfirmed) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                userId: currentUser.id,
                username: currentUser.username,
                postId: post.id,
                petName: post.name
            };

            const response = await fetch('http://localhost:3001/api/adoption/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert('입양 신청이 완료되었습니다! 마이페이지에서 내역을 확인하세요.');
            } else {
                setError(result.message || '입양 신청에 실패했습니다.');
            }
        } catch (err) {
            console.error('입양 신청 API 오류:', err);
            setError('서버 오류로 입양 신청에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. 💡 [NEW] 삭제 핸들러
    const handleDelete = async () => {
        // [보안] 본인 확인
        if (!currentUser || currentUser.id !== post.userId) {
            alert('공고를 삭제할 권한이 없습니다.');
            return;
        }

        // eslint-disable-next-line no-restricted-globals
        const isConfirmed = confirm('정말로 이 공고를 삭제하시겠습니까?');

        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/adoption/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                // [보안] 본인 인증을 위해 userId를 body에 담아 전송
                body: JSON.stringify({ userId: currentUser.id })
            });

            if (response.ok) {
                alert('입양 공고가 삭제되었습니다.');
                navigate('/adoption'); // 목록으로 이동
            } else {
                const errData = await response.json();
                alert(errData.message || '삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error('삭제 API 오류:', err);
            alert('서버 오류로 삭제에 실패했습니다.');
        }
    };

    // 6. 💡 로딩 및 에러 UI
    if (loading) {
        return (
            // 🌟 [수정] <style> 태그 제거 (CSS 파일로 분리)
            <div className="adoption-detail-container loading">
                <style>{styles}</style>
                <div className="spinner-large"></div>
                <p className="loading-text">입양 공고를 불러오는 중...</p>
            </div>
        );
    }

    if (error && !post) { // 7. 💡 post가 없을 때만 전체 화면 에러
        return (
            <div className="adoption-detail-container loading">
                <style>{styles}</style>
                <div className="error-card">
                    <AlertCircle className="icon-large" />
                    <p className="font-bold mb-2">오류 발생</p>
                    <p>😭 {error}</p>
                    <button 
                        onClick={() => navigate('/adoption')}
                        className="button primary"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }
    
    if (!post) {
        return null;
    }

    // 8. 💡 본인 글인지 확인 (post.userId는 INT, currentUser.id도 INT)
    const isOwner = currentUser && post.userId === currentUser.id;

    // 아이콘 헬퍼
    const getSpeciesIcon = (species) => {
        if (species === '고양이') return <Cat className="w-4 h-4" />;
        if (species === '기타') return <Bird className="w-4 h-4" />;
        return <Dog className="w-4 h-4" />; // 기본값 '개'
    };
    
    // 🌟 [추가] 이미지 URL 결정
    const imageUrl = post.image || DEFAULT_LOGO_URL;

    return (
        <div className="adoption-detail-container">
            {/* 🌟 [추가] CSS 파일을 여기에 포함합니다. */}
            <style>{styles}</style>
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <button 
                        onClick={() => navigate('/adoption')} 
                        className="back-button"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        공고 목록으로
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <article className="post-card">
                    {/* 상단 헤더: 이미지 + 기본 정보 */}
                    <div className="post-layout">
                        {/* 이미지 */}
                        <div className="image-column">
                            {/* 🌟 [수정] post.image가 없을 때 로고 이미지를 표시합니다. */}
                            {post.image ? (
                                <img
                                    src={imageUrl}
                                    alt={post.name}
                                    className="main-image"
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = DEFAULT_LOGO_URL;
                                    }}
                                />
                            ) : (
                                <div className="image-placeholder">
                                    {/* 🌟 [수정] 로고 이미지 표시 (placeholder 대신 실제 img 태그 사용) */}
                                    <img 
                                        src={DEFAULT_LOGO_URL} 
                                        alt="로고" 
                                        className="main-image" 
                                        style={{ objectFit: 'contain', width: '200px', height: '200px' }} 
                                    />
                                    <span></span>
                                </div>
                            )}
                        </div>
                        
                        {/* 기본 정보 */}
                        <div className="info-column">
                            <div>
                                <h1 className="pet-name">{post.name}</h1>
                                <p className="pet-region">
                                    <MapPin className="w-4 h-4" /> {post.region}
                                </p>
                                <div className={`status-badge ${'status-' + (post.status || '입양가능')}`}>
                                    {post.status || '입양가능'}
                                </div>
                                
                                <div className="info-grid">
                                    <InfoItem icon={getSpeciesIcon(post.species)} label="종류" value={post.species} />
                                    <InfoItem label="품종" value={post.breed} />
                                    <InfoItem label="나이" value={`${post.age}살`} />
                                    <InfoItem label="성별" value={post.gender} />
                                    <InfoItem label="크기" value={post.size} />
                                    {/* 🌟 authorNickname으로 수정 */}
                                    <InfoItem icon={<User className="w-4 h-4"/>} label="공고작성자" value={post.authorNickname || post.author} />
                                    <InfoItem icon={<Calendar className="w-4 h-4"/>} label="공고일" value={new Date(post.createdAt).toLocaleDateString('ko-KR')} />
                                </div>
                            </div>
                            
                            {/* 9. 💡 [보안] 본인 글일 때만 '수정/삭제' 버튼 보이기 */}
                            {isOwner && (
                                <div className="button-group">
                                    <Link 
                                        to={`/adoption/edit/${post.id}`}
                                        className="button secondary"
                                    >
                                        <Edit className="w-4 h-4" />공고 수정
                                    </Link>
                                    <button 
                                        onClick={handleDelete} 
                                        className="button danger"
                                    >
                                        <Trash2 className="w-4 h-4" />공고 삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 하단 본문: 상세 설명 및 입양 신청 버튼 */}
                    <div className="description-area">
                        <h2 className="description-title">상세 설명</h2>
                        <div className="description-content">
                            <p>
                                {post.description || "상세 설명이 없습니다."}
                            </p>
                        </div>

                        {/* 10. 💡 [정상 동작] 입양 신청 버튼 (본인 글이 아닐 때만 보임) */}
                        {!isOwner && (
                            <div className="apply-area">
                                {/* 11. 💡 신청 실패 시 에러 메시지 표시 */}
                                {error && (
                                    <div className="message-box error" role="alert">
                                        <AlertCircle className="icon" /> {error}
                                    </div>
                                )}
                                <button
                                    onClick={handleApply}
                                    disabled={isSubmitting || !currentUser}
                                    className="button primary apply-button"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="spinner-sm"></div>
                                            신청 처리 중...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            입양 신청하기
                                        </>
                                    )}
                                </button>
                                {!currentUser && (
                                    <p className="login-prompt">
                                        입양 신청을 하시려면 <Link to="/login" className="link">로그인</Link>이 필요합니다.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
}

// 12. 💡 상세 정보 항목 컴포넌트
const InfoItem = ({ icon, label, value }) => (
    <div className="info-item">
        <span className="info-label">
            {icon}
            {label}
        </span>
        <span className="info-value">{value}</span>
    </div>
);

// 🌟 [수정] CSS 스타일 블록 전체 수정
const styles = `
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
    .adoption-detail-container {
        min-height: 100vh;
        background-color: var(--bg-main);
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
    }
    .adoption-detail-container *, .adoption-detail-container *:before, .adoption-detail-container *:after {
        box-sizing: inherit;
    }

    .adoption-detail-container.loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-light);
        height: 100vh;
    }
    .spinner-large {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        border-top: 4px solid var(--brand-primary);
        border-right: 4px solid transparent;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-card {
        text-align: center;
        padding: 2.5rem;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        color: var(--danger-color);
    }
    .icon-large {
        width: 3rem;
        height: 3rem;
        color: #B91C1C;
        margin: 0 auto 1rem;
    }
    .loading-text {
        color: var(--brand-primary-dark);
        font-weight: 500;
    }

    /* ===============================================
    * 2. 헤더
    * =============================================== */
    .header {
        background-color: var(--bg-card);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid var(--border-color-light);
    }
    .header-content {
        max-width: 1024px;
        margin: 0 auto;
        padding: 1rem;
    }
    .back-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-light);
        text-decoration: none;
        transition: color 0.15s;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
    }
    .back-button:hover { color: var(--brand-primary); }

    /* ===============================================
    * 3. 메인 콘텐츠 (상세)
    * =============================================== */
    .main-content {
        max-width: 1024px;
        margin: 2rem auto;
        padding: 0 1rem;
    }
    .post-card {
        background-color: var(--bg-card);
        border-radius: 16px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
        overflow: hidden;
    }
    .post-layout {
        display: flex;
        flex-direction: column; /* 🌟 모바일 기본 */
    }
    @media (min-width: 768px) { /* md: */
        .post-layout {
            flex-direction: row; /* 데스크탑에서 가로 배치 */
        }
    }

    .image-column {
        width: 100%;
        height: 300px; /* 모바일 높이 */
        background-color: var(--bg-main); /* 🌟 이미지 없을 때 배경색 */
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }
    @media (min-width: 768px) {
        .image-column {
            width: 50%;
            height: auto; 
            padding: 1.5rem;
        }
    }
    .main-image {
        width: 100%;
        height: 100%;
        object-fit: cover; /* 🌟 [수정] contain 대신 cover로 유지 (배너 꽉 채우기) */
    }
    .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--border-color);
        background-color: #f8f8f8;
        padding: 1rem;
    }
    .icon-placeholder {
        width: 60px;
        height: 60px;
        margin-bottom: 0.5rem;
    }
    .image-placeholder span {
        font-size: 0.9rem;
        color: var(--text-light);
    }


    .info-column {
        width: 100%;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    @media (min-width: 768px) {
        .info-column {
            width: 50%;
        }
    }

    .pet-name {
        font-size: 2.25rem; /* text-4xl */
        font-weight: 700;
        color: var(--brand-primary-dark);
        margin-bottom: 0.25rem;
    }
    .pet-region {
        font-size: 1.125rem;
        color: var(--text-light);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    .status-badge {
        display: inline-block;
        padding: 0.25rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
    }
    .status-입양가능 { background-color: #3b8a3e; }
    .status-상담중 { background-color: #fbbf24; }
    .status-입양완료 { background-color: #9ca3af; }

    .info-grid {
        margin-top: 1.5rem;
        display: grid;
        grid-template-columns: 1fr; /* 🌟 모바일 기본 */
        gap: 0.75rem;
    }
    @media (min-width: 640px) { /* sm: */
        .info-grid {
             grid-template-columns: repeat(2, 1fr); /* 🌟 태블릿 2열 */
        }
    }
    .info-item {
        display: flex;
        align-items: center;
        color: var(--text-primary);
        font-size: 0.875rem;
    }
    .info-label {
        font-weight: 500;
        width: 100px; /* w-24 */
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-light);
    }
    .info-value {
        font-weight: 600;
        color: var(--brand-primary-dark);
    }

    .button-group {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }
    .button {
        flex: 1;
        text-align: center;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
    }
    .button.secondary {
        border: 1px solid var(--brand-primary);
        color: var(--brand-primary);
    }
    .button.secondary:hover {
        background-color: var(--bg-main);
    }
    .button.danger {
        background-color: var(--danger-color);
        color: white;
        border: none;
    }
    .button.danger:hover {
        background-color: var(--danger-color-light);
    }

    .description-area {
        padding: 1.5rem;
        border-top: 1px solid var(--border-color-light);
    }
    .description-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--brand-primary-dark);
        margin-bottom: 1rem;
    }
    .description-content {
        color: var(--text-primary);
        line-height: 1.7;
        white-space: pre-wrap;
        margin-bottom: 2rem;
    }
    .description-content p {
        margin: 0; /* 🌟 <p> 태그의 기본 마진 제거 */
    }

    .apply-area {
        text-align: center;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color-light);
    }
    .button.primary {
        background-color: var(--brand-primary);
        color: white;
        border: none;
    }
    .button.primary:hover:not(:disabled) {
        background-color: var(--brand-primary-dark);
    }
    .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .apply-button {
        padding: 0.75rem 2.5rem;
        font-size: 1.125rem;
        width: 100%;
    }
    @media (min-width: 768px) {
        .apply-button {
            width: auto;
            margin: 0 auto;
        }
    }
    .spinner-sm {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 50%;
        border-top: 2px solid white;
        border-right: 2px solid transparent;
        animation: spin 1s linear infinite;
    }
    .login-prompt {
        font-size: 0.875rem;
        color: var(--text-light);
        margin-top: 0.75rem;
    }
    .link {
        color: var(--brand-primary);
        text-decoration: underline;
    }
    .link:hover {
        color: var(--brand-primary-dark);
    }
    .message-box {
        padding: 1rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid;
        margin-bottom: 1rem;
        font-size: 0.875rem;
    }
    .message-box .icon { width: 1.25rem; height: 1.25rem; flex-shrink: 0; }
    .message-box.error {
        background-color: var(--brand-danger-bg);
        color: var(--brand-danger-text);
        border-color: var(--brand-danger-border);
    }
`;