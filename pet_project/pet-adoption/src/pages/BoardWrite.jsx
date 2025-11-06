import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function BoardWrite({ currentUser }) {
    const navigate = useNavigate();
    
    // 2. 'author'를 formData에서 제거합니다. (currentUser.username을 사용할 것이기 때문)
    const [formData, setFormData] = useState({
        title: '',
        category: '자유게시판', // 💡 기본값
        content: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['공지사항', '자유게시판', '질문답변', 'FAQ'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!formData.title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }
        
        // 3. 'currentUser'가 없으면(비정상 접근) 함수를 중단시킵니다.
        if (!currentUser) {
            alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);

        // 4. 전송할 데이터(payload)를 조립합니다.
        const payload = {
            ...formData,
            author: currentUser.username // 🌟 로그인한 사용자의 ID(username)를 'author'로 설정
        };

        try {
            // 🔥 백엔드 서버로 POST 요청
            const response = await fetch('http://localhost:3001/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // 5. 'author'가 포함된 payload를 전송합니다.
                body: JSON.stringify(payload), 
            });

            if (response.ok) {
                const result = await response.json();
                alert('게시글이 성공적으로 등록되었습니다!');
                navigate('/board'); // 목록 페이지로 이동
            } else {
                alert('게시글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('글쓰기 오류:', error);
            alert('서버 연결에 실패했습니다.');
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
                        <h1 className="text-2xl font-bold text-blue-600">게시글 작성</h1>
                        <button
                            onClick={() => navigate('/board')}
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

                    {/* 6. '작성자 입력' <div> 블록을 (삭제하는 대신) '로그인 정보 표시'로 변경 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            작성자
                        </label>
                        <div className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700">
                            {/* currentUser가 존재하면 닉네임을, 없으면 '로그인 필요'를 표시 */}
                            {currentUser ? (
                                <>
                                    <span className="font-semibold">{currentUser.nickname}</span>
                                    <span className="text-sm text-gray-500 ml-2">({currentUser.username})</span>
                                </>
                            ) : (
                                <span className="text-gray-500">로그인 정보가 없습니다...</span>
                            )}
                        </div>
                    </div>

                    {/* 제목 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            제목 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="제목을 입력하세요"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={100}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.title.length}/100
                        </p>
                    </div>

                    {/* 내용 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            내용 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="내용을 입력하세요"
                            rows={15}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/board')}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser} // 🌟 로그인이 안되어있으면 제출 비활성화
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