import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dog, Cat, Bird, AlertCircle } from 'lucide-react'; // 1. 아이콘 추가

// 2. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionSite({ currentUser }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. 💡 DB에서 입양 공고 목록 불러오기
    useEffect(() => {
        fetchAdoptionPosts();
    }, []);

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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. 💡 로딩, 에러, 데이터 없음 UI 처리
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">입양 공고를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-10 bg-red-100 rounded-lg shadow-lg text-red-700">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold mb-2">오류 발생</p>
                    <p>😭 {error}</p>
                    <button 
                        onClick={fetchAdoptionPosts}
                        className="mt-4 px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* 헤더 및 공고 작성 버튼 */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">입양 공고</h1>
                    <p className="text-gray-600 mt-1">새로운 가족을 기다리는 아이들입니다.</p>
                </div>
                {/* 5. 💡 로그인한 사용자에게만 '공고 작성' 버튼 표시 */}
                {currentUser && (
                    <Link
                        to="/adoption/write"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap font-semibold shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        새 공고 작성
                    </Link>
                )}
            </div>

            {/* 6. 💡 공고 목록 그리드 */}
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                            첫 번째 공고를 등록해 보세요!
                        </Link>
                    )}
                </div>
            )}
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
        <Link to={`/adoption/${post.id}`} className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition duration-300 group">
            <div className="relative h-56 bg-gray-200">
                <img
                    src={post.image || `https://placehold.co/400x300/cccccc/ffffff?text=${post.name}`}
                    alt={post.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://placehold.co/400x300/cccccc/ffffff?text=${post.name}`;
                    }}
                />
                <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    post.status === '입양가능' ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                    {post.status || '입양가능'}
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{post.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{post.region}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-700">
                    <PostStats icon={getSpeciesIcon(post.species)} label={post.species} />
                    <PostStats label={post.breed} />
                    <PostStats label={`${post.age}살`} />
                    <PostStats label={post.gender} />
                    <PostStats label={post.size} />
                </div>
            </div>
        </Link>
    );
};

// 9. 💡 카드 하단 통계 컴포넌트
const PostStats = ({ icon, label }) => (
    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
        {icon}
        {label}
    </span>
);