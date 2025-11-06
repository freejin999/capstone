import React, { useState, useEffect } from 'react';
import { Star, Heart, Search } from 'lucide-react';

export default function PetProductReview() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedRating, setSelectedRating] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null); // API 에러 상태 추가

    const categories = ['전체', '사료', '간식', '장난감', '미용', '위생용품', '급식기', '외출용품'];
    const ratings = ['전체', '5점', '4점', '3점', '2점', '1점'];

    // 🔥 서버에서 리뷰 데이터 가져오기 (try/catch/finally 강화)
    useEffect(() => {
        fetchReviews();
    }, []); // 최초 1회만 실행

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null); // 에러 상태 초기화
            const response = await fetch('http://localhost:3001/api/reviews');
            
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                console.error('리뷰 목록 불러오기 실패:', response.statusText);
                setError('리뷰 목록을 불러오는데 실패했습니다.'); // 에러 메시지 설정
            }
        } catch (error) {
            console.error('API 요청 오류:', error);
            setError('서버와의 연결에 실패했습니다.'); // 네트워크 에러 메시지 설정
        } finally {
            setLoading(false); // 로딩 상태 확실히 종료
        }
    };

    // 필터링 로직
    const filteredReviews = reviews.filter(review => {
        const matchesCategory = selectedCategory === '전체' || review.category === selectedCategory;
        const ratingValue = selectedRating !== '전체' ? parseInt(selectedRating[0]) : null;
        const matchesRating = selectedRating === '전체' || review.rating === ratingValue;
        
        // productName 또는 content가 null/undefined일 경우 에러 방지
        const productNameMatch = review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const contentMatch = review.content?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesSearch = productNameMatch || contentMatch;
        
        return matchesCategory && matchesRating && matchesSearch;
    });

    // 별점 렌더링
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-5 h-5 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    // 로딩 중
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">리뷰를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 발생 시
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={fetchReviews} // 재시도 버튼
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">펫 용품 리뷰</h1>
                    <p className="text-gray-600">반려동물 용품에 대한 솔직한 후기를 확인하세요</p>
                </div>

                {/* 검색 바 */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="제품명이나 리뷰 내용으로 검색하세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* 필터 */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    {/* 카테고리 필터 */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">카테고리</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                        selectedCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 별점 필터 */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">별점</h3>
                        <div className="flex flex-wrap gap-2">
                            {ratings.map(rating => (
                                <button
                                    key={rating}
                                    onClick={() => setSelectedRating(rating)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                        selectedRating === rating
                                            ? 'bg-yellow-400 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 리뷰 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map(review => (
                            <div key={review.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                                {/* 제품 이미지 */}
                                <div className="relative h-48 bg-gray-200">
                                    <img
                                        src={review.image}
                                        alt={review.productName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://placehold.co/300x300/cccccc/ffffff?text=No+Image"; 
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {review.category}
                                    </div>
                                </div>

                                {/* 리뷰 내용 */}
                                <div className="p-4">
                                    {/* 제품명 */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {review.productName}
                                    </h3>

                                    {/* 별점 */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {review.rating}.0
                                        </span>
                                    </div>

                                    {/* 리뷰 내용 */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {review.content}
                                    </p>

                                    {/* 하단 정보 */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">{review.author}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-sm text-gray-500">{review.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-red-500">
                                            <Heart className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium">{review.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                            <p className="text-gray-400 text-sm mt-2">다른 조건으로 검색해보세요.</p>
                        </div>
                    )}
                </div>

                {/* 결과 요약 */}
                {filteredReviews.length > 0 && (
                    <div className="mt-8 text-center text-gray-600">
                        총 <span className="font-bold text-blue-600">{filteredReviews.length}</span>개의 리뷰
                    </div>
                )}
            </div>
        </div>
    );
}

