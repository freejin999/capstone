import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetDiaryEdit({ currentUser }) {
    const { id } = useParams(); // URL에서 수정할 일기 ID 가져오기
    const navigate = useNavigate();
    
    // 2. 폼 상태 관리
    const [formData, setFormData] = useState({
        title: '',
        mood: '일상',
        content: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const moods = ['행복', '설렘', '일상', '슬픔', '화남'];

    // 3. 💡 기존 일기 데이터 불러오기 (useEffect)
    useEffect(() => {
        // 'currentUser'가 없으면(비정상 접근) 즉시 차단
        if (!currentUser) {
            alert('이 페이지에 접근하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        fetchDiary(id);
    }, [id, currentUser, navigate]); // 의존성 배열에 currentUser, navigate 추가

    /**
     * 4. 💡 API 호출 함수 (GET)
     * @param {string} diaryId - URL에서 가져온 일기 ID
     */
    const fetchDiary = async (diaryId) => {
        setLoading(true);
        setError(null);
        try {
            // '상세 보기' API를 그대로 사용
            const response = await fetch(`http://localhost:3001/api/diaries/entry/${diaryId}`);
            if (response.ok) {
                const data = await response.json();

                // 5. [보안] 🌟 권한 검사 🌟
                // 불러온 일기의 'userId'와 현재 로그인한 'currentUser.id'가 일치하는지 확인
                if (data.userId !== currentUser.id) {
                    alert('이 일기를 수정할 권한이 없습니다.');
                    navigate('/diary'); // 일기 목록으로 돌려보내기
                    return; 
                }

                // 6. 권한이 있으면 폼 데이터 설정
                setFormData({
                    title: data.title,
                    mood: data.mood,
                    content: data.content
                });
            } else {
                alert('일기를 불러오는데 실패했습니다.');
                navigate('/diary');
            }
        } catch (err) {
            console.error('일기 조회 오류:', err);
            alert('서버와의 연결에 실패했습니다.');
            navigate('/diary');
        } finally {
            setLoading(false);
        }
    };

    // 7. 폼 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 8. 폼 제출 (일기 수정) 핸들러
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
        
        setIsSubmitting(true);

        // 9. 서버로 전송할 데이터(payload) 조립
        const payload = {
            ...formData,
            userId: currentUser.id // 🌟 [보안] 본인 확인을 위해 userId를 함께 전송
        };

        try {
            // 10. 'PUT' 메소드로 수정 API 호출
            const response = await fetch(`http://localhost:3001/api/diaries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), 
            });

            if (response.ok) {
                alert('일기가 성공적으로 수정되었습니다!');
                navigate(`/diary/${id}`); // 수정된 상세 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '일기 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('일기 수정 오류:', error);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 11. 로딩 UI
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">일기를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-purple-600">일기 수정하기</h1>
                        <button
                            onClick={() => navigate(`/diary/${id}`)} // 상세 페이지로 돌아가기
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            수정 취소
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
                            onClick={() => navigate(`/diary/${id}`)} // 상세 페이지로 돌아가기
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