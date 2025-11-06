import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Calendar, User, Trash2, Edit } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function BoardDetail({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    
    // 2. 임시 ID/Author 변수 (currentUserId, currentUserAuthor) 제거

    // ----------------------------------------------------
    // 🔥 데이터 로드 (게시글 상세 + 댓글)
    // ----------------------------------------------------
    useEffect(() => {
        // (useEffect는 currentUser가 있든 없든 실행되어야 하므로 여기서 확인하지 않습니다)
        fetchPostDetail();
        fetchComments(); 
    }, [id]); // 3. useEffect 의존성에서 currentUser 제거 (새로고침 시 post 먼저 로드)

    // 4. fetchPostDetail은 currentUser가 바뀔 때마다 다시 호출 (좋아요 상태 갱신)
    useEffect(() => {
        if (post) { // 게시글이 로드된 *이후에*
            // 5. 좋아요 상태 초기화 (currentUser가 있을 때만 실행)
            if (currentUser && post.likedUsers && post.likedUsers.includes(currentUser.username)) {
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }
        }
    }, [post, currentUser]); // post 또는 currentUser가 변경될 때마다 실행

    const fetchPostDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:3001/api/posts/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                setPost(data);
                // 6. 좋아요 상태 초기화 로직은 별도 useEffect로 분리
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
    // 💡 댓글 작성 처리 (currentUser 연동)
    // ----------------------------------------------------
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        // 7. [보안] currentUser가 없으면(비로그인) 댓글 작성 차단
        if (!currentUser) {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
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
                    // 8. author를 임시 닉네임이 아닌, 실제 로그인한 유저의 '닉네임'으로 전송
                    author: currentUser.nickname 
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
    // 💡 '좋아요' 핸들러 (currentUser 연동)
    // ----------------------------------------------------
    const handleLike = async () => {
        // 9. [보안] currentUser가 없으면(비로그인) 좋아요 차단
        if (!currentUser) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500); // 애니메이션

        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // 10. userId를 임시 ID가 아닌, 실제 로그인한 유저의 'username'(고유 ID)으로 전송
                body: JSON.stringify({ userId: currentUser.username }) 
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
    // 💡 '삭제' 핸들러 (currentUser 연동)
    // ----------------------------------------------------
    const handleDelete = async () => {
        
        // 11. [보안] 권한 검사 (currentUser가 없거나, 글 작성자가 아니면 차단)
        if (!currentUser) {
            alert('삭제할 권한이 없습니다. (로그인 필요)');
            return;
        }
        if (currentUser.username !== post.author) {
            alert('본인이 작성한 글만 삭제할 수 있습니다.');
            return;
        }

        // 12. 🚨 alert() 대신 커스텀 UI/모달을 권장합니다.
        // 현재는 confirm이 작동하지 않을 수 있으므로, 임시로 true로 설정합니다.
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

    // ( ... 렌더링 로직 (loading, error, !post)은 동일 ... )
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
                        <div className="mb-3">
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${post.isNotice ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                {post.category}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t pt-3">
                            {/* 13. 작성자(author)가 username이므로, 닉네임 표시가 필요하면 JOIN 필요 (일단 author 표시) */}
                            <div className="flex items-center gap-1"><User className="w-4 h-4" /><span>{post.author}</span></div>
                            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{post.date ? post.date : (post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : '날짜없음')}</span></div>
                            <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>조회 {post.views}</span></div>
                            <div className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /><span>댓글 {post.comments}</span></div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="prose max-w-none">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </div>
                    </div>

                    {/* 좋아요 버튼 */}
                    <div className="border-t p-6 flex justify-center">
                        <button 
                            onClick={handleLike} 
                            // 14. 비로그인 시 버튼 비활성화
                            disabled={!currentUser || likeAnimating}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold like-btn-transition transition ${
                                isLiked 
                                    ? 'like-btn-liked text-white shadow-xl' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
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
                                placeholder={currentUser ? "따뜻한 댓글을 남겨주세요." : "댓글을 작성하려면 로그인이 필요합니다."}
                                className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none mb-3"
                                // 15. 비로그인 시 입력창 비활성화
                                disabled={!currentUser}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    {/* 16. 작성자를 임시 닉네임이 아닌, 실제 로그인한 유저의 '닉네임'으로 표시 */}
                                    작성자: {currentUser ? currentUser.nickname : '로그인 필요'}
                                </span>
                                <button
                                    type="submit"
                                    // 17. 비로그인 시 버튼 비활성화
                                    disabled={!currentUser || !newCommentText.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* 18. [보안] 🌟 하단 버튼 (수정/삭제) - 본인 글일 때만 렌더링 */}
                {currentUser && post.author === currentUser.username && (
                    <div className="mt-6 flex justify-end">
                        <div className="flex gap-3">
                            <button 
                                onClick={() => navigate(`/board/edit/${id}`)} 
                                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />수정
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />삭제
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}