import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Star } from 'lucide-react';

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

        // 3. [보안] currentUser 확인
        if (!currentUser) {
            alert('리뷰를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // 유효성 검사
        if (!formData.productName.trim()) {
            setError('제품명을 입력해주세요.');
            return;
        }
        
        // 🌟 [수정] 별점 0점(rating: 0)도 유효한 값으로 인정하므로, 프론트엔드 유효성 검사 제거
        // if (formData.rating === 0) {
        //     setError('별점을 선택해주세요.');
        //     return;
        // }
        
        if (!formData.content.trim()) {
            setError('리뷰 내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        // 4. API로 전송할 데이터 조립 (currentUser 정보 포함)
        const payload = {
            ...formData,
            userId: currentUser.id,
            // 🌟 [핵심 수정] 
            // 'author' -> 'authorUsername' (서버 index.js와 키 이름을 일치시킴)
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
                navigate('/reviews'); // 리뷰 목록 페이지로 이동
            } else {
                const errData = await response.json();
                // 🌟 서버에서 보낸 에러 메시지를 표시
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-blue-600">새 리뷰 작성</h1>
                        <button
                            onClick={() => navigate('/reviews')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            목록으로
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* 제품명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            제품명 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            placeholder="예: 슈퍼프리미엄 연어 사료"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 카테고리 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            카테고리 <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 별점 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            별점 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, index) => {
                                const rate = index + 1;
                                return (
                                    <button
                                        type="button"
                                        key={rate}
                                        onClick={() => handleRatingClick(rate)}
                                        onMouseEnter={() => setRatingHover(rate)}
                                        onMouseLeave={() => setRatingHover(0)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${
                                                rate <= (ratingHover || formData.rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                            <span className="ml-3 text-lg font-bold text-gray-700">{formData.rating} / 5</span>
                        </div>
                    </div>

                    {/* 이미지 URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            제품 이미지 URL (선택)
                        </label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.png"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 내용 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            리뷰 내용 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="제품에 대한 솔직한 리뷰를 남겨주세요."
                            rows={10}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/reviews')}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    등록 중...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
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