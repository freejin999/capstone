import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Calendar, User, Trash2, Edit } from 'lucide-react';

export default function BoardDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]); // 💡 댓글 목록 상태
    const [newCommentText, setNewCommentText] = useState(''); // 💡 새 댓글 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    
    // 임시 사용자 ID (DB에 저장된 author 필드와 연동되어야 함)
    const currentUserId = 'user_abc123'; 
    const currentUserAuthor = '댓글러101'; // 임시 닉네임

    // ----------------------------------------------------
    // 🔥 데이터 로드 (게시글 상세 + 댓글)
    // ----------------------------------------------------
    useEffect(() => {
        fetchPostDetail();
        fetchComments(); // 💡 댓글 목록 로드
    }, [id]);

    const fetchPostDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:3001/api/posts/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                setPost(data);
                
                // 좋아요 상태 초기화 (서버 데이터 기반)
                if (data.likedUsers && data.likedUsers.includes(currentUserId)) {
                    setIsLiked(true);
                } else {
                    setIsLiked(false);
                }
            } else if (response.status === 404) {
                setError('게시글을 찾을 수 없습니다.');
            } else {
                setError('게시글을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('API 요청 오류:', error);
            setError('서버와의 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };
    
    // 💡 댓글 목록 가져오기 함수 (8. GET /api/posts/:postId/comments)
    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            } else {
                console.error('댓글 목록 불러오기 실패');
            }
        } catch (error) {
            console.error('댓글 API 요청 오류:', error);
        }
    };

    // ----------------------------------------------------
    // 💡 댓글 작성 처리 (9. POST /api/posts/:postId/comments)
    // ----------------------------------------------------
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: newCommentText, 
                    author: currentUserAuthor 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // 1. 상태 업데이트: 새 댓글을 목록 맨 위에 추가
                setComments(prev => [data.comment, ...prev]); 
                setNewCommentText(''); // 입력 필드 초기화
                
                // 2. 게시글의 댓글 수 업데이트 (UI 상에서)
                setPost(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));

            } else {
                alert('댓글 작성에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
            alert('서버와의 연결에 실패했습니다.');
        }
    };

    // ----------------------------------------------------
    // [FIX] '좋아요' 핸들러 로직 구현
    // ----------------------------------------------------
    const handleLike = async () => {
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500); // 애니메이션

        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId }) // 임시 userId 전송
            });

            if (response.ok) {
                const data = await response.json();
                // 서버 응답(data.likes)으로 UI 상태 업데이트
                setPost(prev => ({ ...prev, likes: data.likes }));
                setIsLiked(data.isLiked);
            } else {
                alert('좋아요 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('좋아요 API 오류:', error);
            alert('서버와의 연결에 실패했습니다.');
        }
    };

    // ----------------------------------------------------
    // [FIX] '삭제' 핸들러 로직 구현
    // ----------------------------------------------------
    const handleDelete = async () => {
        // 실제 앱에서는 모달 창 등으로 사용자 확인을 받는 것이 좋습니다.
        // 여기서는 `confirm`을 사용하지만, `alert`와 마찬가지로 환경에 따라
        // 작동하지 않을 수 있으므로, 임시로 true로 설정합니다.
        const userConfirmed = true; // window.confirm('정말로 이 게시글을 삭제하시겠습니까?');

        if (!userConfirmed) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                navigate('/board'); // 목록으로 이동
            } else {
                alert('게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('삭제 API 오류:', error);
            alert('서버와의 연결에 실패했습니다.');
        }
    };


    // ----------------------------------------------------
    // 렌더링
    // ----------------------------------------------------
    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><p>로딩 중...</p></div>;
    }
    if (error) {
        return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><p className="text-red-500">{error}</p></div>;
    }
    if (!post) { 
        return null; 
    }

    // ----------------------------------------------------
    // 💡 댓글 UI (Render Content)
    // ----------------------------------------------------
    const CommentItem = ({ comment }) => (
        <div className="border-b last:border-b-0 py-3">
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-semibold text-gray-800">{comment.author}</span>
                <span className="text-gray-500">
                    {/* MySQL DateTime 포맷을 YYYY-MM-DD로 변환 */}
                    {new Date(comment.createdAt).toISOString().split('T')[0]}
                </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ... (스타일 및 Header 유지) ... */}
            <style>{`
                @keyframes heartBeat {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                .heart-beat {
                    animation: heartBeat 0.5s ease-in-out;
                }
                .like-btn-transition {
                    transition: all 0.2s ease-in-out;
                }
                .like-btn-liked {
                    background-color: #EF4444; /* red-500 */
                    border-color: #EF4444;
                }
                .like-btn-liked:hover {
                    background-color: #DC2626; /* red-600 */
                }
            `}</style>
            
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button onClick={() => navigate('/board')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />목록으로
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* ... (게시글 헤더, 본문 유지) ... */}
                    <div className="border-b p-6">
                        {/* 카테고리 배지 */}
                        <div className="mb-3">
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${post.isNotice ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                {post.category}
                            </span>
                        </div>
                        {/* 제목 */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                        {/* 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t pt-3">
                            <div className="flex items-center gap-1"><User className="w-4 h-4" /><span>{post.author}</span></div>
                            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{post.date ? post.date : (post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : '날짜없음')}</span></div>
                            <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>조회 {post.views}</span></div>
                            <div className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /><span>댓글 {post.comments}</span></div>
                        </div>
                    </div>
                    {/* 게시글 본문 */}
                    <div className="p-6">
                        <div className="prose max-w-none">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </div>
                    </div>

                    {/* 좋아요 버튼 */}
                    <div className="border-t p-6 flex justify-center">
                        <button onClick={handleLike} className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold like-btn-transition transition ${isLiked ? 'like-btn-liked text-white shadow-xl' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}>
                            <ThumbsUp className={`w-5 h-5 ${likeAnimating ? 'heart-beat' : ''}`} fill={isLiked ? 'currentColor' : 'none'}/>
                            <span className="text-lg">{isLiked ? '좋아요 취소' : '좋아요'} ({post.likes})</span>
                        </button>
                    </div>

                    {/* 💡 댓글 영역 */}
                    <div className="border-t p-6 bg-gray-50">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2">
                            댓글 {post.comments}개
                        </h3>
                        
                        {/* 댓글 작성 폼 */}
                        <form onSubmit={handleCommentSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                            <textarea
                                rows="3"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="따뜻한 댓글을 남겨주세요."
                                className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none mb-3"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    작성자: {currentUserAuthor}
                                </span>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                                >
                                    댓글 등록
                                </button>
                            </div>
                        </form>

                        {/* 댓글 목록 */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            {comments.length > 0 ? (
                                comments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                            )}
                        </div>
                    </div>
                </article>

                {/* 하단 버튼 (수정/삭제) */}
                <div className="mt-6 flex justify-end">
                    <div className="flex gap-3">
                        <button onClick={() => navigate(`/board/edit/${id}`)} className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2">
                            <Edit className="w-4 h-4" />수정
                        </button>
                        <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />삭제
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}