import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Calendar, User, Trash2, Edit } from 'lucide-react';

export default function BoardDetail({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]); // 💡 댓글 목록 상태
    const [newCommentText, setNewCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    
    // 임시 사용자 닉네임 (댓글 작성 시 사용)
    const currentUserAuthor = currentUser ? currentUser.nickname : '비로그인 사용자';

    // ----------------------------------------------------
    // 🔥 데이터 로드 (게시글 상세 + 댓글)
    // ----------------------------------------------------
    useEffect(() => {
        fetchPostDetail();
        fetchComments(); 
    }, [id]);

    // 💡 좋아요 상태 초기화 (post, currentUser 변경 시)
    useEffect(() => {
        if (post && currentUser) { 
            // 게시글이 로드되고, 사용자가 로그인했을 때 좋아요 상태를 확인
            if (post.likedUsers && post.likedUsers.includes(currentUser.username)) {
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }
        }
        if (!currentUser) {
            setIsLiked(false); // 로그아웃하면 좋아요 상태 초기화
        }
    }, [post, currentUser]);

    const fetchPostDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:3001/api/posts/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                setPost(data);
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
    
    // 💡 댓글 목록 가져오기 함수 (9. GET /api/posts/:postId/comments)
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
    // 💡 댓글 작성 처리 (10. POST /api/posts/:postId/comments)
    // ----------------------------------------------------
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
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
                    author: currentUserAuthor 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // 상태 업데이트: 새 댓글을 목록 맨 위에 추가
                setComments(prev => [data.comment, ...prev]); 
                setNewCommentText(''); // 입력 필드 초기화
                
                // 게시글의 댓글 수 업데이트 (UI 상에서)
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
    // 💡 '좋아요' 핸들러 (5. PUT /api/posts/:id/like)
    // ----------------------------------------------------
    const handleLike = async () => {
        if (!currentUser) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500);

        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // userId로 로그인한 사용자의 username (고유 ID) 전송
                body: JSON.stringify({ userId: currentUser.username }) 
            });

            if (response.ok) {
                const data = await response.json();
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
    // 💡 '삭제' 핸들러 (7. DELETE /api/posts/:id)
    // ----------------------------------------------------
    const handleDelete = async () => {
        // [보안] 권한 검사
        if (!currentUser || currentUser.username !== post.author) {
            alert('이 글을 삭제할 권한이 없습니다.');
            return;
        }

        // NOTE: window.confirm 대신 커스텀 UI/모달을 권장
        if (!window.confirm(`정말로 이 게시글을 삭제하시겠습니까?`)) {
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
    // 로딩 및 에러 렌더링
    // ----------------------------------------------------
    if (loading) {
        return (
            <div className="detail-container loading-state">
                <div className="spinner-large"></div>
                <p className="loading-text">게시글을 불러오는 중...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="detail-container error-state">
                <p className="error-message">{error}</p>
                <button
                    onClick={() => navigate('/board')}
                    className="primary-button"
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }
    if (!post) { return null; }

    // ----------------------------------------------------
    // 💡 댓글 UI (Render Content)
    // ----------------------------------------------------
    const CommentItem = ({ comment }) => (
        <div className="comment-item">
            <div className="comment-meta">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-date">
                    {/* MySQL DateTime 포맷을 YYYY-MM-DD로 변환 */}
                    {new Date(comment.createdAt).toISOString().split('T')[0]}
                </span>
            </div>
            <p className="comment-content">{comment.content}</p>
        </div>
    );


    return (
        <div className="detail-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
                
                .detail-container {
                    min-height: 100vh;
                    background-color: #F2EDE4; 
                    font-family: 'Inter', sans-serif;
                }
                .loading-state, .error-state {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background-color: #F2EDE4;
                    color: #594C3C;
                    text-align: center;
                }
                .error-message {
                    color: #735048;
                    font-size: 18px;
                    margin-bottom: 16px;
                }
                .spinner-large {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #735048; 
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .header {
                    background-color: white;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border-bottom: 1px solid #F2E2CE;
                }
                .header-content {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 16px;
                }
                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #594C3C;
                    text-decoration: none;
                    transition: color 0.15s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                }
                .back-button:hover {
                    color: #735048;
                }

                .main-content {
                    max-width: 900px;
                    margin: 32px auto;
                    padding: 0 16px;
                }
                .post-card {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }

                /* 게시글 헤더 스타일 */
                .post-header {
                    padding: 24px;
                    border-bottom: 1px solid #F2E2CE;
                }
                .category-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 9999px; /* rounded-full */
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 12px;
                    background-color: #F2CBBD;
                    color: #735048;
                }
                .post-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #594C3C;
                    margin-bottom: 16px;
                }
                .post-meta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 16px;
                    font-size: 14px;
                    color: #594C3C;
                    padding-top: 12px;
                    border-top: 1px solid #F2E2CE;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* 게시글 본문 스타일 */
                .post-body {
                    padding: 24px;
                }
                .post-content {
                    color: #594C3C;
                    line-height: 1.7;
                    white-space: pre-wrap; /* 줄바꿈 유지 */
                    min-height: 200px;
                }

                /* 좋아요 버튼 스타일 */
                .like-area {
                    padding: 24px;
                    border-top: 1px solid #F2E2CE;
                    display: flex;
                    justify-content: center;
                }
                .like-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 32px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 18px;
                    color: white;
                    background-color: #735048; /* Primary Color */
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    box-shadow: 0 4px 8px rgba(115, 80, 72, 0.3);
                }
                .like-button:hover:not(:disabled) {
                    background-color: #594C3C;
                    transform: translateY(-1px);
                }
                .like-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .like-button.liked {
                    background-color: #EF4444; /* Red for liked */
                    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
                }
                .like-button.liked:hover:not(:disabled) {
                    background-color: #DC2626; 
                }
                /* 좋아요 애니메이션 (CSS는 JS 파일 상단에 정의됨) */

                /* 댓글 영역 스타일 */
                .comments-area {
                    padding: 24px;
                    background-color: #F2EDE4; /* Light Background */
                }
                .comments-header {
                    font-size: 20px;
                    font-weight: bold;
                    color: #594C3C;
                    border-bottom: 2px solid #F2E2CE;
                    padding-bottom: 8px;
                    margin-bottom: 16px;
                }
                .comment-form-box {
                    background-color: white;
                    padding: 16px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    margin-bottom: 24px;
                }
                .comment-textarea {
                    width: 95%;
                    padding: 12px;
                    border: 1px solid #F2E2CE;
                    border-radius: 6px;
                    resize: none;
                    font-size: 14px;
                    margin-bottom: 12px;
                }
                .comment-submit-area {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .comment-submit-button {
                    padding: 8px 16px;
                    background-color: #735048;
                    color: white;
                    border-radius: 6px;
                    font-weight: 600;
                    transition: background-color 0.15s;
                    border: none;
                    cursor: pointer;
                }
                .comment-submit-button:hover:not(:disabled) {
                    background-color: #594C3C;
                }
                .comment-submit-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .comment-list {
                    background-color: white;
                    padding: 16px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }
                .comment-item {
                    padding: 12px 0;
                    border-bottom: 1px dashed #F2E2CE;
                }
                .comment-item:last-child {
                    border-bottom: none;
                }
                .comment-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    margin-bottom: 4px;
                    color: #594C3C;
                }
                .comment-author {
                    font-weight: 600;
                }
                .comment-date {
                    color: #A0A0A0;
                }
                .comment-content {
                    font-size: 15px;
                    color: #594C3C;
                }


                /* 하단 버튼 그룹 스타일 */
                .bottom-actions {
                    margin-top: 24px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                .action-button {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: background-color 0.15s;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .edit-button {
                    border: 1px solid #735048;
                    color: #735048;
                    background-color: white;
                }
                .edit-button:hover {
                    background-color: #F2E2CE;
                }
                .delete-button {
                    background-color: #B91C1C; /* Red 700 */
                    color: white;
                    border: none;
                }
                .delete-button:hover {
                    background-color: #991B1B; /* Darker Red */
                }
            `}</style>
            
            <header className="header">
                <div className="header-content">
                    <button onClick={() => navigate('/board')} className="back-button">
                        <ArrowLeft className="w-5 h-5" />목록으로
                    </button>
                </div>
            </header>

            <main className="main-content">
                <article className="post-card">
                    {/* 게시글 헤더 */}
                    <div className="post-header">
                        {/* 카테고리 배지 */}
                        <div className="mb-3">
                            <span className="category-badge">
                                {post.category}
                            </span>
                        </div>
                        {/* 제목 */}
                        <h1 className="post-title">
                            {post.title}
                        </h1>
                        {/* 메타 정보 */}
                        <div className="post-meta">
                            <div className="meta-item"><User className="w-4 h-4" /><span>{post.author}</span></div>
                            <div className="meta-item"><Calendar className="w-4 h-4" /><span>{post.date ? post.date : (post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : '날짜없음')}</span></div>
                            <div className="meta-item"><Eye className="w-4 h-4" /><span>조회 {post.views}</span></div>
                            <div className="meta-item"><MessageSquare className="w-4 h-4" /><span>댓글 {post.comments}</span></div>
                        </div>
                    </div>
                    
                    {/* 게시글 본문 */}
                    <div className="post-body">
                        <div className="post-content">
                            <p>{post.content}</p>
                        </div>
                    </div>

                    {/* 좋아요 버튼 */}
                    <div className="like-area">
                        <button
                            onClick={handleLike}
                            disabled={!currentUser || likeAnimating}
                            className={`like-button ${isLiked ? 'liked' : ''}`}
                        >
                            <ThumbsUp 
                                className={`w-5 h-5 ${likeAnimating ? 'heart-beat' : ''}`}
                                fill={isLiked ? 'currentColor' : 'none'}
                            />
                            <span className="text-lg">
                                {isLiked ? '좋아요 취소' : '좋아요'} ({post.likes})
                            </span>
                        </button>
                    </div>

                    {/* 💡 댓글 영역 */}
                    <div className="comments-area">
                        <h3 className="comments-header">
                            댓글 {post.comments}개
                        </h3>
                        
                        {/* 댓글 작성 폼 */}
                        <form onSubmit={handleCommentSubmit} className="comment-form-box">
                            <textarea
                                rows="3"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder={currentUser ? "따뜻한 댓글을 남겨주세요." : "댓글을 작성하려면 로그인이 필요합니다."}
                                className="comment-textarea"
                                disabled={!currentUser}
                            />
                            <div className="comment-submit-area">
                                <span className="text-sm text-gray-500">
                                    작성자: {currentUser ? currentUser.nickname : '로그인 필요'}
                                </span>
                                <button
                                    type="submit"
                                    disabled={!currentUser || !newCommentText.trim()}
                                    className="comment-submit-button"
                                >
                                    댓글 등록
                                </button>
                            </div>
                        </form>

                        {/* 댓글 목록 */}
                        <div className="comment-list">
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
                {currentUser && post.author === currentUser.username && (
                    <div className="bottom-actions">
                        <button
                            onClick={() => navigate(`/board/edit/${id}`)}
                            className="action-button edit-button"
                        >
                            <Edit className="w-4 h-4" />수정
                        </button>
                        <button
                            onClick={handleDelete}
                            className="action-button delete-button"
                        >
                            <Trash2 className="w-4 h-4" />삭제
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}