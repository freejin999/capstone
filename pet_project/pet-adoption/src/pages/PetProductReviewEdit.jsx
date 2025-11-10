import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Star } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetProductReviewEdit({ currentUser }) {
    const { id } = useParams(); // URL에서 리뷰 ID
    const navigate = useNavigate();
    
    // 2. 폼 데이터 상태
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

    // 3. 기존 리뷰 데이터 불러오기
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
                    
                    // 4. [보안] 본인 확인
                    if (data.userId !== currentUser.id) {
                        alert('이 리뷰를 수정할 권한이 없습니다.');
                        navigate('/reviews');
                        return;
                    }
                    
                    // 5. 본인 확인 후 폼 데이터 설정
                    setFormData({
                        productName: data.productName,
                        category: data.category,
                        rating: data.rating,
                        content: data.content,
                        image: data.image || '', // null일 경우 빈 문자열로
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

    // 6. 수정 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (formData.rating === 0) {
            setError('별점을 선택해주세요.');
            return;
        }
        // (다른 유효성 검사 생략)

        setIsSubmitting(true);

        // 7. API로 전송할 데이터 조립 (userId 포함)
        const payload = {
            ...formData,
            userId: currentUser.id // [보안] 본인 인증용 ID
        };

        try {
            const response = await fetch(`http://localhost:3001/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('리뷰가 성공적으로 수정되었습니다!');
                navigate('/reviews'); // 리뷰 목록 페이지로 이동
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-blue-600">리뷰 수정</h1>
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
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    수정 중...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
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