import React, { useState, useEffect } from 'react';
// 🌟 1. [추가] ChevronUp, ChevronDown 아이콘 임포트
import { Star, Heart, Search, Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './PetProductReview.css'; 

export default function PetProductReview({ currentUser }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedRating, setSelectedRating] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null); 
    const navigate = useNavigate(); 
    
    // 🌟 2. [추가] 어떤 카드가 펼쳐져 있는지 기억하는 상태 (Set 사용)
    const [expandedCards, setExpandedCards] = useState(new Set());

    const categories = ['전체', '사료', '간식', '장난감', '미용', '위생용품', '급식기', '외출용품', '기타'];
    const ratings = ['전체', '5점', '4점', '3점', '2점', '1점', '0점']; 

    // (기존 기능 로직 ... )
    useEffect(() => {
        fetchReviews();
    }, []); 

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null); 
            const response = await fetch('http://localhost:3001/api/reviews'); 
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                console.error('리뷰 목록 불러오기 실패:', response.statusText);
                setError('리뷰 목록을 불러오는데 실패했습니다.'); 
            }
        } catch (error) {
            console.error('API 요청 오류:', error);
            setError('서버와의 연결에 실패했습니다.'); 
        } finally {
            setLoading(false); 
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedRating('전체'); 
        setSearchTerm(''); 
    };

    const handleRatingClick = (rating) => {
        setSelectedRating(rating);
        setSelectedCategory('전체'); 
        setSearchTerm(''); 
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedCategory('전체');
        setSelectedRating('전체');
    };
    
    const handleDelete = async (reviewId, reviewAuthor) => {
        if (!currentUser || currentUser.username !== reviewAuthor) {
            alert('삭제할 권한이 없습니다.');
            return;
        }
        // eslint-disable-next-line no-restricted-globals
        if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.id })
                });
                if (response.ok) {
                    alert('리뷰가 삭제되었습니다.');
                    setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
                } else {
                    const errData = await response.json();
                    alert(errData.message || '리뷰 삭제에 실패했습니다.');
                }
            } catch (err) {
                console.error('삭제 API 오류:', err);
                alert('서버 오류로 리뷰 삭제에 실패했습니다.');
            }
        }
    };
    
    // 🌟 3. [추가] '더 보기'/'간략히' 토글 함수
    const toggleExpand = (id) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev); // 현재 Set을 복사
            if (newSet.has(id)) {
                newSet.delete(id); // 이미 있으면(펼쳐져 있으면) 닫기
            } else {
                newSet.add(id); // 없으면(닫혀 있으면) 열기
            }
            return newSet;
        });
    };

    // (필터링 로직 ...)
    const filteredReviews = reviews.filter(review => {
        const ratingValue = selectedRating !== '전체' ? parseInt(selectedRating[0]) : null;
        const matchesRating = selectedRating === '전체' || review.rating === ratingValue;
        const matchesCategory = selectedCategory === '전체' || review.category === selectedCategory;
        const productNameMatch = review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const authorMatch = review.authorNickname?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const contentMatch = review.content?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesSearch = productNameMatch || contentMatch || authorMatch;
        return matchesCategory && matchesRating && matchesSearch;
    });

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`star ${index < rating ? 'filled' : ''}`}
            />
        ));
    };

    // (로딩, 에러 UI ...)
    if (loading) {
        return (
            <div className="review-page-wrapper loading">
                <div className="spinner"></div>
                <p>리뷰를 불러오는 중...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="review-page-wrapper loading">
                <div className="error-box">
                    <p>😭 {error}</p>
                    <button
                        onClick={fetchReviews} 
                        className="button primary-button"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="review-page-wrapper">
            <div className="review-container">
                {/* 헤더 */}
                <div className="review-header">
                    <div>
                        <h1 className="review-title">펫 용품 리뷰</h1>
                        <p className="review-subtitle">반려동물 용품에 대한 솔직한 후기를 확인하세요</p>
                    </div>
                    {currentUser && (
                        <Link 
                            to="/reviews/write"
                            className="button primary-button"
                        >
                            <Plus className="icon-sm" />
                            새 리뷰 작성
                        </Link>
                    )}
                </div>

                {/* (검색 바, 필터 ...) */}
                <div className="search-bar-wrapper">
                    <div className="search-bar">
                        <Search className="icon-search" />
                        <input
                            type="text"
                            placeholder="제품명, 리뷰 내용, 작성자 닉네임으로 검색하세요"
                            value={searchTerm}
                            onChange={handleSearchChange} 
                            className="search-input"
                        />
                    </div>
                </div>
                <div className="filter-section">
                    <div className="filter-group">
                        <h3 className="filter-title">카테고리</h3>
                        <div className="filter-buttons">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="filter-title">별점</h3>
                        <div className="filter-buttons">
                            {ratings.map(rating => (
                                <button
                                    key={rating}
                                    onClick={() => handleRatingClick(rating)}
                                    className={`filter-button rating ${selectedRating === rating ? 'active' : ''}`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>


                {/* 리뷰 목록 */}
                <div className="review-grid">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map(review => {
                            const isOwner = currentUser && currentUser.username === review.author;
                            // 🌟 4. [추가] 현재 카드가 펼쳐진 상태인지 확인
                            const isExpanded = expandedCards.has(review.id);
                            // 🌟 5. [추가] 텍스트가 100자 이상일 때만 '더 보기' 버튼 표시
                            const showReadMore = review.content.length > 100; // (100자는 예시입니다)

                            return (
                                <div key={review.id} className="review-card">
                                    <div>
                                        {/* (제품 이미지 ...) */}
                                        <div className="card-image-wrapper">
                                            <img
                                                src={review.image || "https://placehold.co/300x300/F2E2CE/594C3C?text=No+Image"}
                                                alt={review.productName}
                                                className="card-image"
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = "https://placehold.co/300x300/F2E2CE/594C3C?text=No+Image"; 
                                                }}
                                            />
                                            <div className="card-badge">
                                                {review.category}
                                            </div>
                                        </div>

                                        {/* 리뷰 내용 */}
                                        <div className="card-body">
                                            <h3 className="card-title">
                                                {review.productName}
                                            </h3>
                                            <div className="star-rating">
                                                {renderStars(review.rating)}
                                                <span className="star-rating-text">
                                                    {review.rating}.0
                                                </span>
                                            </div>
                                            
                                            {/* 🌟 6. [수정] 'expanded' 클래스 조건부 적용 */}
                                            <p className={`card-content ${isExpanded ? 'expanded' : ''}`}>
                                                {review.content}
                                            </p>

                                            {/* 🌟 7. [추가] '더 보기' / '간략히' 버튼 */}
                                            {showReadMore && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Link 태그 클릭 방지
                                                        toggleExpand(review.id);
                                                    }}
                                                    className="read-more-button"
                                                >
                                                    {isExpanded ? (
                                                        <>간략히 <ChevronUp className="icon-xs" /></>
                                                    ) : (
                                                        <>전체 보기 <ChevronDown className="icon-xs" /></>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* (하단 정보 및 수정/삭제 버튼 ...) */}
                                    <div className="card-footer">
                                        <div className="footer-info">
                                            <div className="author-info">
                                                <span className="author-nickname">{review.authorNickname || review.author}</span>
                                                <span className="footer-separator">•</span>
                                                <span className="date-info">{new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
                                            </div>
                                            <div className="likes-info">
                                                {/* <Heart className="icon-xs" /> */}
                                                {/* <span className="likes-count">{review.likes}</span> */}
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <div className="card-actions">
                                                <Link 
                                                    to={`/reviews/edit/${review.id}`}
                                                    className="action-button edit"
                                                >
                                                    <Edit className="icon-xs" />수정
                                                </Link>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); 
                                                        handleDelete(review.id, review.author); 
                                                    }}
                                                    className="action-button delete"
                                                >
                                                    <Trash2 className="icon-xs" />삭제
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-results-box">
                            <p>검색 결과가 없습니다.</p>
                            <p>다른 조건으로 검색해보세요.</p>
                        </div>
                    )}
                </div>

                {/* (결과 요약 ...) */}
                {filteredReviews.length > 0 && (
                    <div className="results-summary">
                        총 <span className="count">{filteredReviews.length}</span>개의 리뷰
                    </div>
                )}
            </div>
        </div>
    );
}