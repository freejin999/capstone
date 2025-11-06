import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetDiaryWrite({ currentUser }) {
    const navigate = useNavigate();
    
    // 2. 폼 상태 관리
    const [formData, setFormData] = useState({
        title: '',
        mood: '일상', // 기본값
        content: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const moods = ['행복', '설렘', '일상', '슬픔', '화남']; // 💡 기분 옵션

    // 3. 폼 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. 폼 제출 (일기 등록) 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (!formData.title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }
        
        // 5. 'currentUser'가 없으면(비정상 접근) 함수를 중단시킵니다.
        if (!currentUser) {
            alert('일기를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);

        // 6. 서버로 전송할 데이터(payload) 조립
        const payload = {
            ...formData,
            userId: currentUser.id // 🌟 로그인한 사용자의 고유 ID(숫자)를 'userId'로 설정
        };

        try {
            const response = await fetch('http://localhost:3001/api/diaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), 
            });

            if (response.ok) {
                alert('일기가 성공적으로 등록되었습니다!');
                navigate('/diary'); // 목록 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '일기 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('일기 작성 오류:', error);
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
                        <h1 className="text-2xl font-bold text-purple-600">새 일기 작성</h1>
                        <button
                            onClick={() => navigate('/diary')}
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
                    
                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* 제목 입력 */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            제목 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="오늘의 가장 기억에 남는 순간은?"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            maxLength={100}
                        />
                    </div>

                    {/* 기분 선택 */}
                    <div>
                        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
                            오늘의 기분 <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="mood"
                            name="mood"
                            value={formData.mood}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        >
                            {moods.map(mood => (
                                <option key={mood} value={mood}>
                                    {mood}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 내용 입력 */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            내용 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="우리 아이의 특별한 순간을 기록해주세요."
                            rows={15}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/diary')}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser} 
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    등록 중...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    등록하기
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}