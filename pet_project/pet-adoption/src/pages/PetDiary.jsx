import React, { useState, useEffect } from 'react';
// 💡 Link를 import합니다.
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Image, Heart } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetDiary({ currentUser }) {
    const navigate = useNavigate();
    const [diaries, setDiaries] = useState([]); // 💡 DB에서 불러온 일기를 저장할 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMood, setSelectedMood] = useState('전체');

    const moods = ['전체', '행복', '슬픔', '설렘', '일상'];
    
    // 2. 💡 DB에서 일기를 불러오는 useEffect
    useEffect(() => {
        // currentUser가 있어야만(로그인해야만) 일기를 불러옵니다.
        if (currentUser) {
            fetchDiaries(currentUser.username);
        } else {
            // 비정상적인 접근 (PrivateRoute가 막아주겠지만, 예방 차원)
            setLoading(false);
            setError("일기를 불러오려면 로그인이 필요합니다.");
        }
    }, [currentUser]); // currentUser가 바뀔 때마다(로그인 시) 실행

    /**
     * 3. 💡 API 호출 함수
     * @param {string} username - 로그인한 사용자의 ID
     */
    const fetchDiaries = async (username) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/diaries/${username}`);
            if (response.ok) {
                const data = await response.json();
                setDiaries(data);
            } else {
                throw new Error('일기를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('일기 로드 오류:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. 필터링 로직 (DB에서 가져온 'diaries' 상태를 사용)
    const filteredDiaries = diaries.filter(diary => {
        const matchesMood = selectedMood === '전체' || diary.mood === selectedMood;
        const matchesSearch = diary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              diary.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMood && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
                반려동물 일기 🐾
            </h1>

            {/* 필터 및 검색, 작성 버튼 영역 */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                
                {/* Mood 필터 탭 */}
                <div className="flex border-b overflow-x-auto whitespace-nowrap bg-white p-2 rounded-lg shadow-sm">
                    {moods.map(mood => (
                        <button
                            key={mood}
                            onClick={() => setSelectedMood(mood)}
                            className={`px-4 py-2 font-medium transition rounded-md ${
                                selectedMood === mood
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {mood}
                        </button>
                    ))}
                </div>

                {/* 검색 및 작성 버튼 */}
                <div className="flex gap-3 items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="제목 또는 내용 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    {/* 5. 💡 '새 일기 작성' 버튼을 <Link>로 변경 */}
                    <Link 
                        to="/diary/write"
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 whitespace-nowrap font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        새 일기 작성
                    </Link>
                </div>
            </div>

            {/* 일기 목록 그리드 */}
            {loading && (
                <div className="text-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">일기를 불러오는 중...</p>
                </div>
            )}

            {error && (
                 <div className="col-span-full text-center p-10 bg-red-100 rounded-lg shadow-lg text-red-700">
                    <p>😭 {error}</p>
                 </div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredDiaries.length > 0 ? (
                        filteredDiaries.map(diary => (
                            // 6. 💡 카드 전체를 클릭하면 상세 페이지로 이동하도록 <Link>로 감쌈
                            <Link 
                                to={`/diary/${diary.id}`} 
                                key={diary.id} 
                                className="block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            diary.mood === '행복' ? 'bg-pink-100 text-pink-700' :
                                            diary.mood === '슬픔' ? 'bg-blue-100 text-blue-700' :
                                            diary.mood === '설렘' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {diary.mood}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            {/* 7. 💡 날짜 포맷 변경 */}
                                            <Calendar className="w-4 h-4"/> {new Date(diary.createdAt).toISOString().split('T')[0]}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{diary.title}</h2>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{diary.content}</p>

                                    <div className="flex justify-between items-center pt-3 border-t text-sm text-gray-500">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                {/* 💡 사진은 추후 구현 (일단 0으로) */}
                                                <Image className="w-4 h-4"/> 0장
                                            </span>
                                            <span className="flex items-center gap-1 text-red-500 font-medium">
                                                {/* 💡 좋아요는 추후 구현 (일단 0으로) */}
                                                <Heart className="w-4 h-4"/> 0
                                            </span>
                                        </div>
                                        {/* 8. 💡 '자세히 보기' 버튼은 <Link>로 대체되었으므로 제거 */}
                                        <span className="text-purple-600 hover:underline text-sm font-medium">
                                            자세히 보기
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg text-gray-500">
                            <p>😭 작성된 일기가 없습니다. 새로운 추억을 기록해 보세요!</p>
                            <Link 
                                to="/diary/write" 
                                className="mt-4 inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                            >
                                지금 작성하기
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}