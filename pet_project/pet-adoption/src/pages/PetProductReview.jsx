import React, { useState, useEffect } from 'react';
import { Star, Heart, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Link, useNavigate 임포트

// 2. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetProductReview({ currentUser }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedRating, setSelectedRating] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null); 
    const navigate = useNavigate(); // 3. navigate 훅 사용

    const categories = ['전체', '사료', '간식', '장난감', '미용', '위생용품', '급식기', '외출용품', '기타'];
    const ratings = ['전체', '5점', '4점', '3점', '2점', '1점', '0점']; // 0점 리뷰 추가

    // 🔥 서버에서 리뷰 데이터 가져오기
    useEffect(() => {
        fetchReviews();
    }, []); // 최초 1회만 실행

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null); 
            // 4. [수정] API 경로를 DB 연동 API로 변경
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

    // 5. 🌟 [핵심 수정] 필터 버튼 클릭 핸들러
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedRating('전체'); // 👈 다른 필터를 '전체'로 리셋
        setSearchTerm(''); // 👈 검색어도 리셋
    };

    const handleRatingClick = (rating) => {
        setSelectedRating(rating);
        setSelectedCategory('전체'); // 👈 다른 필터를 '전체'로 리셋
        setSearchTerm(''); // 👈 검색어도 리셋
    };

    // 6. 🌟 [핵심 수정] 검색창 핸들러 (검색 시 필터 리셋)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedCategory('전체');
        setSelectedRating('전체');
    };
    
    // 7. 🌟 [추가] 삭제 핸들러
    const handleDelete = async (e, reviewId, reviewAuthor) => {
        e.stopPropagation(); // 카드 전체 클릭 방지
        
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
                    // [보안] 본인 인증을 위해 userId를 body에 담아 전송
                    body: JSON.stringify({ userId: currentUser.id })
                });

                if (response.ok) {
                    alert('리뷰가 삭제되었습니다.');
                    // 8. 🌟 삭제 성공 시, 목록(reviews) 상태에서 해당 리뷰를 즉시 제거
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


    // 필터링 로직
    const filteredReviews = reviews.filter(review => {
        // 9. 🌟 [수정] 0점 리뷰도 처리 (parseInt가 "0점" -> 0)
        const ratingValue = selectedRating !== '전체' ? parseInt(selectedRating[0]) : null;
        
        // 10. 🌟 [수정] review.rating이 0일 때도 비교가 되도록 수정 (ratingValue가 null일 때 true)
        const matchesRating = selectedRating === '전체' || review.rating === ratingValue;
        
        const matchesCategory = selectedCategory === '전체' || review.category === selectedCategory;
        
        const productNameMatch = review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        // 11. 🌟 [수정] authorNickname도 검색 대상에 포함
        const authorMatch = review.authorNickname?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const contentMatch = review.content?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesSearch = productNameMatch || contentMatch || authorMatch;
        
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
                <div className="mb-8 flex justify-between items-center border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">펫 용품 리뷰</h1>
                        <p className="text-gray-600">반려동물 용품에 대한 솔직한 후기를 확인하세요</p>
                    </div>
                    {/* 12. 🌟 [추가] '새 리뷰 작성' 버튼 (로그인한 경우에만 보임) */}
                    {currentUser && (
                        <Link 
                            to="/reviews/write"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            새 리뷰 작성
                        </Link>
                    )}
                </div>

                {/* 검색 바 */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="제품명, 리뷰 내용, 작성자 닉네임으로 검색하세요"
                            value={searchTerm}
                            // 13. 🌟 [수정] onChange 핸들러 변경
                            onChange={handleSearchChange} 
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
                                    // 14. 🌟 [수정] onClick 핸들러 변경
                                    onClick={() => handleCategoryClick(category)}
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
                                    // 15. 🌟 [수정] onClick 핸들러 변경
                                    onClick={() => handleRatingClick(rating)}
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
                        filteredReviews.map(review => {
                            // 16. 🌟 [추가] 본인 글인지 확인 (author는 username)
                            const isOwner = currentUser && currentUser.username === review.author;

                            return (
                                <div key={review.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                                    <div>
                                        {/* 제품 이미지 */}
                                        <div className="relative h-48 bg-gray-200">
                                            <img
                                                src={review.image || "https://placehold.co/300x300/cccccc/ffffff?text=No+Image"}
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
                                        </div>
                                    </div>

                                    {/* 하단 정보 */}
                                    <div className="p-4 border-t">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {/* 17. 🌟 [수정] author(username) 대신 authorNickname(닉네임) 표시 */}
                                                <span className="text-sm text-gray-500 font-semibold">{review.authorNickname || review.author}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-red-500">
                                                <Heart className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium">{review.likes}</span>
                                            </div>
                                        </div>

                                        {/* 18. 🌟 [추가] 수정/삭제 버튼 (본인 글일 때만) */}
                                        {isOwner && (
                                            <div className="flex gap-2 justify-end">
                                                <Link 
                                                    to={`/reviews/edit/${review.id}`}
                                                    className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition flex items-center gap-1"
                                                >
                                                    <Edit className="w-3 h-3" />수정
                                                </Link>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 🌟 카드 전체 클릭 방지
                                                        handleDelete(review.id, review.author);
                                                    }}
                                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />삭제
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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