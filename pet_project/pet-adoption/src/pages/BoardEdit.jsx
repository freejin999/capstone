import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function BoardEdit({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        category: '자유게시판',
        content: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['공지사항', '자유게시판', '질문답변', 'FAQ'];

    // 기존 게시글 데이터 불러오기
    useEffect(() => {
        // 2. 'currentUser'가 없으면(비정상 접근) 즉시 차단
        if (!currentUser) {
            alert('이 페이지에 접근하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        fetchPost();
    }, [id, currentUser, navigate]); // 3. useEffect 의존성에 currentUser, navigate 추가

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/posts/${id}`);
            
            if (response.ok) {
                const data = await response.json();

                // 4. [보안] 🌟 권한 검사 🌟
                // 불러온 게시글의 'author'(username)와
                // 현재 로그인한 'currentUser.username'이 일치하는지 확인
                if (data.author !== currentUser.username) {
                    alert('이 글을 수정할 권한이 없습니다.');
                    navigate(`/board/${id}`); // 상세 페이지로 돌려보내기
                    return; // 폼 데이터 설정을 막음
                }

                // 5. 권한이 있으면 폼 데이터 설정
                setFormData({
                    title: data.title,
                    category: data.category,
                    content: data.content
                });
            } else {
                alert('게시글을 불러오는데 실패했습니다.');
                navigate('/board');
            }
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            alert('서버와의 연결에 실패했습니다.');
            navigate('/board');
        } finally {
            setLoading(false);
        }
    };

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

        setIsSubmitting(true);

        // 6. 전송할 데이터에 'author'는 포함하지 않습니다. (author는 불변)
        // 'title', 'category', 'content'만 전송합니다.
        const payload = {
            title: formData.title,
            category: formData.category,
            content: formData.content
        };

        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // 7. payload 전송
            });

            if (response.ok) {
                alert('게시글이 수정되었습니다!');
                navigate(`/board/${id}`); // 수정된 상세 페이지로 이동
            } else {
                alert('게시글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('수정 요청 오류:', error);
            alert('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">게시글을 불러오는 중...</p>
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
                        <h1 className="text-2xl font-bold text-blue-600">게시글 수정</h1>
                        <button
                            onClick={() => navigate(`/board/${id}`)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            취소
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
                    
                    {/* 8. 작성자 폼 추가 (BoardWrite.jsx와 동일) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            작성자
                        </label>
                        <div className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700">
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
                            onClick={() => navigate(`/board/${id}`)}
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