import React, { useState } from 'react';
import { Search, Plus, Calendar, Image, Heart } from 'lucide-react';

// 일기 더미 데이터
const mockDiaries = [
  { id: 1, title: "복돌이의 첫 눈 산책! ❄️", date: "2024-10-15", mood: "행복", photos: 3, likes: 25, content: "오랜만에 내린 눈을 처음 밟은 우리 복돌이! 신나서 뛰어다니는 모습이 너무 사랑스러웠다." },
  { id: 2, title: "병원 가는 날... (간식 필수)", date: "2024-10-10", mood: "슬픔", photos: 1, likes: 8, content: "주사 맞을까 봐 덜덜 떠는 모습에 마음이 아팠다. 집에 와서 특식으로 위로해 줌." },
  { id: 3, title: "나만의 장난감 발명! 🧶", date: "2024-10-05", mood: "일상", photos: 2, likes: 15, content: "버려진 양말로 새로운 장난감을 만들어줬더니 하루 종일 물고 다닌다. 역시 수제가 최고." },
  { id: 4, title: "가족 여행, 바다에 가다! 🌊", date: "2024-09-20", mood: "설렘", photos: 5, likes: 40, content: "태어나서 처음 본 바다! 파도를 보고 어리둥절한 표정이 잊혀지지 않는다. 다음엔 캠핑 가자!" },
];

export default function PetDiary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMood, setSelectedMood] = useState('전체');

    const moods = ['전체', '행복', '슬픔', '설렘', '일상'];
    
    // 임시 함수 (실제 작성 페이지로 이동)
    const handleWriteClick = () => {
        alert("일기 작성 페이지로 이동합니다. (라우팅 필요)");
        // 실제로는 navigate('/diary/write')와 같이 사용됩니다.
    };

    // 필터링 로직
    const filteredDiaries = mockDiaries.filter(diary => {
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
                    
                    {/* 일기 작성 버튼 */}
                    <button 
                        onClick={handleWriteClick}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 whitespace-nowrap font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        새 일기 작성
                    </button>
                </div>
            </div>

            {/* 일기 목록 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredDiaries.length > 0 ? (
                    filteredDiaries.map(diary => (
                        <div key={diary.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer">
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
                                        <Calendar className="w-4 h-4"/> {diary.date}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{diary.title}</h2>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{diary.content}</p>

                                <div className="flex justify-between items-center pt-3 border-t text-sm text-gray-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Image className="w-4 h-4"/> {diary.photos}장
                                        </span>
                                        <span className="flex items-center gap-1 text-red-500 font-medium">
                                            <Heart className="w-4 h-4 fill-red-500"/> {diary.likes}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // 카드 전체 클릭 방지
                                            alert(`일기 #${diary.id} 상세 보기`);
                                        }}
                                        className="text-purple-600 hover:underline text-sm"
                                    >
                                        자세히 보기
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg text-gray-500">
                        <p>😭 조건에 맞는 일기가 없습니다. 새로운 추억을 기록해 보세요!</p>
                        <button 
                            onClick={handleWriteClick} 
                            className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                        >
                            지금 작성하기
                        </button>
                    </div>
                )}
            </div>
            
        </div>
    );
}
