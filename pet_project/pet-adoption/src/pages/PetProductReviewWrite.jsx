import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Star } from 'lucide-react';
// 🌟 [추가] 몽글몽글 디자인 CSS 파일 임포트
import './PetProductReviewWrite.css'; 

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetProductReviewWrite({ currentUser }) {
    const navigate = useNavigate();
    
    // 2. 폼 데이터 상태
    const [formData, setFormData] = useState({
        productName: '',
        category: '사료', // 기본값
        rating: 0,
        content: '',
        image: '', // 이미지 URL (간단하게 텍스트 입력으로 처리)
    });
    const [ratingHover, setRatingHover] = useState(0); // 별점 호버 상태
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const categories = ['사료', '간식', '장난감', '미용', '위생용품', '급식기', '외출용품', '기타'];

    // (기능 로직은 기존과 100% 동일합니다)
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

        if (!currentUser) {
            alert('리뷰를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

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
            userId: currentUser.id,
            authorUsername: currentUser.username, 
            authorNickname: currentUser.nickname 
        };

        try {
            const response = await fetch('http://localhost:3001/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('리뷰가 성공적으로 등록되었습니다!');
                navigate('/reviews'); 
            } else {
                const errData = await response.json();
                setError(errData.message || '리뷰 등록에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('리뷰 작성 오류:', apiError);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // 🌟 [수정] 모든 className을 새 CSS 파일 기준으로 변경
        <div className="review-form-page-wrapper">
            {/* Header */}
            <header className="form-header">
                <div className="form-header-container">
                    <h1 className="form-title">새 리뷰 작성</h1>
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
                    
                    {/* 에러 메시지 */}
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
                            placeholder="예: 슈퍼프리미엄 연어 사료"
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
                            placeholder="https://example.com/image.png"
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
                            placeholder="제품에 대한 솔직한 리뷰를 남겨주세요."
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
                            disabled={isSubmitting || !currentUser}
                            className="button primary-button"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner-sm"></div>
                                    등록 중...
                                </>
                            ) : (
                                <>
                                    <Send className="icon-sm" />
                                    리뷰 등록
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}