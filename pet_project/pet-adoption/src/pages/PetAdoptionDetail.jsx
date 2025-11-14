import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// Fix: Phone 아이콘을 import 목록에 추가했습니다.
import { ArrowLeft, Edit, Trash2, Send, AlertCircle, Dog, Cat, Bird, User, Calendar, MapPin, Heart, Phone } from 'lucide-react'; 

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
            setError('서버와의 연결에 실패했습니다.');
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

            // 💡 [주의: 백엔드에 이 API 구현 필요!]
            const response = await fetch('http://localhost:3001/api/adoption/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert('입양 신청이 완료되었습니다! 마이페이지에서 내역을 확인하세요.');
                // 신청 완료 후 상태 변경 (예: '신청완료'로 버튼 변경 - 여기서는 alert만)
            } else {
                // (예: 이미 신청한 경우 - 409 Conflict)
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
        // Note: 현재 DB 연동은 author(username) 기반이므로 author로 확인
        if (!currentUser || currentUser.username !== post.author) {
            alert('공고를 삭제할 권한이 없습니다.');
            return;
        }

        // eslint-disable-next-line no-restricted-globals
        if (!window.confirm('정말로 이 공고를 삭제하시겠습니까?')) {
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

    // 💡 정보 항목 렌더링 헬퍼
    const InfoItem = ({ icon, label, value }) => (
        <div className="info-item">
            <span className="info-label">
                {icon}
                {label}:
            </span>
            <span className="info-value">{value}</span>
        </div>
    );
    
    const getSpeciesIcon = (species) => {
        if (species === '고양이') return <Cat className="w-4 h-4" />;
        if (species === '기타') return <Bird className="w-4 h-4" />;
        return <Dog className="w-4 h-4" />; // 기본값 '개'
    };


    // 6. 💡 로딩 및 에러 UI
    if (loading) {
        return (
            <div className="detail-container loading-state">
                <div className="spinner-large"></div>
                <p className="loading-text">입양 공고를 불러오는 중...</p>
            </div>
        );
    }

    if (error && !post) { 
        return (
            <div className="detail-container error-state">
                <div className="error-card">
                    <AlertCircle className="icon-large" />
                    <p className="error-message">{error}</p>
                    <button onClick={() => navigate('/adoption')} className="action-button primary-button">
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }
    
    if (!post) { return null; }

    // 7. 💡 본인 글인지 확인
    const isOwner = currentUser && post.author === currentUser.username;


    return (
        <div className="detail-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
                
                .detail-container {
                    min-height: 100vh;
                    background-color: #F2EDE4; /* Light Background */
                    padding-top: 40px;
                    padding-bottom: 40px;
                    font-family: 'Inter', sans-serif;
                }
                .main-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 16px;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #594C3C;
                    margin-bottom: 24px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                }
                .back-link:hover {
                    color: #735048;
                }
                .pet-card {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 20px rgba(89, 76, 60, 0.1);
                    overflow: hidden;
                    border: 1px solid #F2E2CE;
                    display: flex;
                    flex-direction: column;
                }
                @media (min-width: 768px) {
                    .pet-card {
                        flex-direction: row;
                    }
                }
                
                .pet-image-wrapper {
                    flex-shrink: 0;
                    position: relative;
                }
                .pet-image {
                    height: 320px;
                    width: 100%;
                    object-fit: cover;
                }
                @media (min-width: 768px) {
                    .pet-image {
                        width: 320px;
                        height: 100%;
                    }
                }
                
                .pet-info {
                    padding: 32px;
                    flex-grow: 1;
                }
                .category-text {
                    text-transform: uppercase;
                    font-size: 14px;
                    color: #735048; /* Primary Color */
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .pet-name {
                    display: block;
                    margin-top: 4px;
                    font-size: 32px;
                    font-weight: bold;
                    color: #594C3C; /* Dark Text */
                    margin-bottom: 16px;
                }
                .sub-name {
                    font-size: 20px;
                    font-weight: 500;
                    color: #735048; /* Primary Color */
                }

                .grid-info {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    color: #594C3C;
                    margin-bottom: 24px;
                    padding-top: 16px;
                    border-top: 1px solid #F2E2CE;
                }
                .info-label {
                    font-weight: 600;
                    color: #735048;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .info-value {
                    font-weight: 500;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .description-section {
                    padding: 32px 32px 0 32px;
                }
                .description-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #594C3C;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #F2E2CE;
                }
                .description-content {
                    color: #594C3C;
                    line-height: 1.7;
                    margin-bottom: 32px;
                    white-space: pre-wrap;
                }

                /* 💡 입양 신청/문의 버튼 그룹 */
                .button-group {
                    margin-top: 24px;
                    display: flex;
                    flex-direction: column; /* 모바일 기본 */
                    gap: 16px;
                }
                @media (min-width: 640px) {
                    .button-group {
                        flex-direction: row; /* 데스크톱에서 가로 배열 */
                    }
                }
                
                .primary-button, .secondary-button {
                    flex: 1;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: 600;
                    transition: background-color 0.15s, transform 0.15s;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                }
                .primary-button {
                    background-color: #735048; /* Primary Color */
                    color: white;
                    box-shadow: 0 4px 8px rgba(115, 80, 72, 0.3);
                }
                .primary-button:hover:not(:disabled) {
                    background-color: #594C3C; /* Darker Brown */
                    transform: translateY(-1px);
                }
                .primary-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .secondary-button {
                    border: 2px solid #735048; /* Primary Color Border */
                    color: #735048;
                    background-color: white;
                }
                .secondary-button:hover {
                    background-color: #F2E2CE; /* Light Accent Hover */
                    transform: translateY(-1px);
                }
                
                /* 관리 버튼 */
                .admin-actions {
                    padding: 16px;
                    border-top: 1px solid #F2E2CE;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    flex-direction: row; /* 💡 항상 가로로 배열되도록 수정 */
                }
                .admin-actions a, .admin-actions button {
                    /* 버튼의 너비를 콘텐츠 크기에 맞춤 */
                    width: auto; 
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: background-color 0.15s;
                }
                .edit-btn {
                    border: 1px solid #735048;
                    color: #735048;
                    background-color: white;
                }
                .edit-btn:hover {
                    background-color: #F2E2CE;
                }
                .delete-btn {
                    background-color: #B91C1C;
                    color: white;
                    border: none;
                }
                .delete-btn:hover {
                    background-color: #991B1B;
                }

                /* 로딩/에러 상태 */
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
                .error-card .icon-large {
                    width: 48px;
                    height: 48px;
                    color: #B91C1C; 
                    margin: 0 auto 16px;
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

            <div className="main-wrapper">
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => navigate('/adoption')}
                    className="back-link"
                >
                    <ArrowLeft className="w-5 h-5" />
                    공고 목록으로 돌아가기
                </button>

                <div className="pet-card">
                    
                    {/* 상단 헤더: 이미지 + 기본 정보 */}
                    <div className="pet-header">
                        {/* 이미지 */}
                        <div className="pet-image-wrapper">
                            <img 
                                src={post.image} 
                                alt={post.name} 
                                className="pet-image" 
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x400/cccccc/ffffff?text=No+Image"; }}
                            />
                        </div>
                        
                        {/* 동물 정보 */}
                        <div className="pet-info">
                            <div className="category-text">
                                {post.species} - {post.breed}
                            </div>
                            <h1 className="pet-name">
                                {post.name} <span className="sub-name">({post.gender}아, {post.age}살)</span>
                            </h1>

                            <div className="grid-info">
                                <InfoItem icon={getSpeciesIcon(post.species)} label="종류" value={post.species} />
                                <InfoItem label="크기" value={post.size} />
                                <InfoItem icon={<MapPin className="w-4 h-4"/>} label="지역" value={post.region} />
                                <InfoItem icon={<User className="w-4 h-4"/>} label="작성자" value={post.author} />
                                {/* 💡 상태 필드 추가 */}
                                <div className="info-item" style={{gridColumn: '1 / -1'}}>
                                    <span className="info-label" style={{color: '#594C3C'}}>
                                        상태:
                                    </span>
                                    <span style={{fontWeight: 600, color: post.status === '입양가능' ? '#3b8a3e' : '#9ca3af'}}>
                                        {post.status || '입양가능'}
                                    </span>
                                </div>
                            </div>

                            <p className="description">
                                {post.description || "상세 설명이 준비 중입니다."}
                            </p>

                            <div className="button-group">
                                <button onClick={handleApply} disabled={isSubmitting || !currentUser} className="primary-button">
                                    {isSubmitting ? '신청 처리 중...' : '입양 신청하기'}
                                </button>
                                <button className="secondary-button">
                                    <Phone className="w-5 h-5" /> 문의하기
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* 관리 버튼 영역 (수정/삭제) */}
                    {isOwner && (
                        <div className="admin-actions">
                            <Link to={`/adoption/edit/${post.id}`} className="action-button edit-btn">
                                <Edit className="w-4 h-4" />공고 수정
                            </Link>
                            <button onClick={handleDelete} className="action-button delete-btn">
                                <Trash2 className="w-4 h-4" />공고 삭제
                            </button>
                        </div>
                    )}

                    {/* 하단 본문: 상세 설명 */}
                    <div className="description-section">
                        <h2 className="description-title">상세 설명</h2>
                        <p className="description-content">
                            {post.description || "상세 설명이 없습니다."}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}