import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Star } from 'lucide-react';
// 🌟 [추가] 몽글몽글 디자인 CSS 파일 임포트
// (PetProductReviewWrite.css와 동일한 폼 스타일을 공유합니다)
import './PetProductReviewWrite.css'; 

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetProductReviewEdit({ currentUser }) {
    const { id } = useParams(); // URL에서 리뷰 ID
    const navigate = useNavigate();
    
    // (기능 로직은 기존과 100% 동일합니다)
    const [formData, setFormData] = useState({
        productName: '',
        category: '사료',
        rating: 0,
        content: '',
        image: '',
    });
    const [ratingHover, setRatingHover] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const categories = ['사료', '간식', '장난감', '미용', '위생용품', '급식기', '외출용품', '기타'];

    useEffect(() => {
        if (!currentUser) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        const fetchReview = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3001/api/reviews/entry/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.userId !== currentUser.id) {
                        alert('이 리뷰를 수정할 권한이 없습니다.');
                        navigate('/reviews');
                        return;
                    }
                    
                    setFormData({
                        productName: data.productName,
                        category: data.category,
                        rating: data.rating,
                        content: data.content,
                        image: data.image || '', 
                    });
                } else {
                    throw new Error('리뷰를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                console.error('리뷰 로드 오류:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [id, currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rate) => {
        setFormData(prev => ({ ...prev, rating: rate }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 🌟 [수정] 0점도 유효한 값이므로 이 검사 제거
        // if (formData.rating === 0) {
        //     setError('별점을 선택해주세요.');
        //     return;
        // }
        if (!formData.productName.trim()) {
            setError('제품명을 입력해주세요.');
            return;
        }
         if (!formData.content.trim()) {
            setError('리뷰 내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            ...formData,
            userId: currentUser.id 
        };

        try {
            const response = await fetch(`http://localhost:3001/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('리뷰가 성공적으로 수정되었습니다!');
                navigate('/reviews'); 
            } else {
                const errData = await response.json();
                setError(errData.message || '리뷰 수정에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('리뷰 수정 오류:', apiError);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🌟 [수정] 모든 className을 새 CSS 파일 기준으로 변경
    if (loading) {
        return (
            <div className="review-form-page-wrapper loading">
                <div className="spinner"></div>
                <p>리뷰를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-form-page-wrapper loading">
                 <div className="error-box">
                    <p>😭 {error}</p>
                    <button
                        onClick={() => navigate('/reviews')} 
                        className="button primary-button"
                    >
                        목록으로
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="review-form-page-wrapper">
            {/* Header */}
            <header className="form-header">
                <div className="form-header-container">
                    <h1 className="form-title">리뷰 수정</h1>
                    <button
                        onClick={() => navigate('/reviews')}
                        className="button-link"
                    >
                        <ArrowLeft className="icon-sm" />
                        목록으로
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="form-main-container">
                <form onSubmit={handleSubmit} className="form-card">
                    
                    {error && (
                        <div className="message-box error">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* 제품명 */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="productName">
                            제품명 <span className="required-star">*</span>
                        </label>
                        <input
                            id="productName"
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* 카테고리 선택 */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="category">
                            카테고리 <span className="required-star">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-input"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 별점 */}
                    <div className="form-group">
                        <label className="form-label">
                            별점 <span className="required-star">*</span>
                        </label>
                        <div className="star-rating-input">
                            {[...Array(5)].map((_, index) => {
                                const rate = index + 1;
                                return (
                                    <button
                                        type="button"
                                        key={rate}
                                        onClick={() => handleRatingClick(rate)}
                                        onMouseEnter={() => setRatingHover(rate)}
                                        onMouseLeave={() => setRatingHover(0)}
                                        className="star-button"
                                    >
                                        <Star
                                            className={`star ${
                                                rate <= (ratingHover || formData.rating)
                                                    ? 'filled'
                                                    : ''
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                            <span className="star-rating-text">{formData.rating} / 5</span>
                        </div>
                    </div>

                    {/* 이미지 URL */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="image">
                            제품 이미지 URL (선택)
                        </label>
                        <input
                            id="image"
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* 내용 입력 */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="content">
                            리뷰 내용 <span className="required-star">*</span>
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={10}
                            className="form-input"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="form-footer">
                        <button
                            type="button"
                            onClick={() => navigate('/reviews')}
                            className="button secondary-button"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="button primary-button"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner-sm"></div>
                                    수정 중...
                                </>
                            ) : (
                                <>
                                    <Save className="icon-sm" />
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