import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit, Trash2 } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetDiaryDetail({ currentUser }) {
    const { id } = useParams(); // URL에서 일기 ID 가져오기
    const navigate = useNavigate();
    
    // 2. 일기 데이터, 로딩, 에러 상태
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. 💡 DB에서 일기 1개 불러오는 useEffect
    useEffect(() => {
        fetchDiaryDetail(id);
    }, [id]); // id가 변경될 때마다 실행

    /**
     * 4. 💡 API 호출 함수
     * @param {string} diaryId - URL에서 가져온 일기 ID
     */
    const fetchDiaryDetail = async (diaryId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/diaries/entry/${diaryId}`);
            if (response.ok) {
                const data = await response.json();
                setDiary(data);
            } else if (response.status === 404) {
                setError('해당 일기를 찾을 수 없습니다.');
            } else {
                throw new Error('일기를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('일기 상세 로드 오류:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 5. 💡 (임시) 삭제 핸들러
    const handleDelete = async () => {
        // 🚨 이 기능은 아직 server/index.js에 API가 없습니다!
        // 🚨 API 구현 후 이 함수를 완성해야 합니다.
        alert('삭제 기능은 아직 구현되지 않았습니다.');
        
        // (추후 구현 예시)
        // if (window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
        //     try {
        //         const response = await fetch(`http://localhost:3001/api/diaries/entry/${id}`, {
        //             method: 'DELETE',
        //         });
        //         if (response.ok) {
        //             alert('일기가 삭제되었습니다.');
        //             navigate('/diary');
        //         } else {
        //             alert('삭제에 실패했습니다.');
        //         }
        //     } catch (err) {
        //         alert('서버 오류로 삭제에 실패했습니다.');
        //     }
        // }
    };

    // 6. 💡 로딩 및 에러 UI 처리
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-10 bg-red-100 rounded-lg shadow-lg text-red-700">
                    <p>😭 {error}</p>
                    <button 
                        onClick={() => navigate('/diary')}
                        className="mt-4 px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (!diary) {
        // (로딩이 끝났는데 diary가 null이면 에러 처리됨)
        return null;
    }
    
    // 7. 💡 본인 글인지 확인 (userId가 일치하는지)
    const isOwner = currentUser && diary.userId === currentUser.id;

    // 8. 💡 기분(mood)에 따른 스타일 반환
    const getMoodStyle = (mood) => {
        switch (mood) {
            case '행복': return 'bg-pink-100 text-pink-700';
            case '슬픔': return 'bg-blue-100 text-blue-700';
            case '설렘': return 'bg-green-100 text-green-700';
            case '화남': return 'bg-red-100 text-red-700';
            case '일상':
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button 
                        onClick={() => navigate('/diary')} 
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        일기 목록으로
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* 게시글 헤더 */}
                    <div className="border-b p-6">
                        {/* 카테고리(기분) 배지 */}
                        <div className="flex justify-between items-center mb-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMoodStyle(diary.mood)}`}>
                                {diary.mood}
                            </span>
                            {/* 9. 💡 [보안] 본인 글일 때만 '수정/삭제' 버튼 보이기 */}
                            {isOwner && (
                                <div className="flex gap-3">
                                    <Link 
                                        to={`/diary/edit/${diary.id}`} // 🚨 /diary/edit/:id 라우트 및 컴포넌트 추가 필요
                                        className="px-4 py-1 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 text-sm"
                                    >
                                        <Edit className="w-4 h-4" />수정
                                    </Link>
                                    <button 
                                        onClick={handleDelete} 
                                        className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />삭제
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* 제목 */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{diary.title}</h1>
                        {/* 메타 정보 */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(diary.createdAt).toLocaleString('ko-KR')}</span>
                            </div>
                        </div>
                    </div>
                    {/* 게시글 본문 */}
                    <div className="p-6">
                        <div className="prose max-w-none">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{diary.content}</p>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}