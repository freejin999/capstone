import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Calendar, User, Trash2, Edit, Save, X } from 'lucide-react';

// ===============================================
// 1. 개별 댓글 컴포넌트 (BoardDetail 밖으로 분리)
// ===============================================
const CommentItem = ({ 
    comment, 
    currentUser, 
    isEditing, 
    editedContent,
    onEdit,
    onCancel,
    onUpdate,
    onDelete,
    onTextChange 
}) => {
    // 본인 댓글인지 확인
    const isOwner = currentUser && currentUser.username === comment.authorUsername;

    return (
        <div className="comment-item">
            <div className="comment-meta">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-date">
                    {new Date(comment.createdAt).toISOString().split('T')[0]}
                </span>
            </div>
            
            {/* 수정 모드일 때 입력창 표시 */}
            {isEditing ? (
                <div className="comment-edit-form">
                    <textarea
                        className="comment-textarea edit"
                        value={editedContent}
                        onChange={(e) => onTextChange(e.target.value)}
                    />
                    <div className="comment-actions">
                        <button 
                            onClick={() => onUpdate(comment.id)} 
                            className="action-button-small save"
                        >
                            <Save className="w-4 h-4" /> 저장
                        </button>
                        <button 
                            onClick={onCancel} 
                            className="action-button-small cancel"
                        >
                            <X className="w-4 h-4" /> 취소
                        </button>
                    </div>
                </div>
            ) : (
                // 평소에는 댓글 내용 표시
                <p className="comment-content">{comment.content}</p>
            )}

            {/* 본인 댓글이고 수정 모드가 아닐 때 버튼 표시 */}
            {isOwner && !isEditing && (
                <div className="comment-actions">
                    <button 
                        onClick={() => onEdit(comment)}
                        className="action-button-small edit"
                    >
                        <Edit className="w-4 h-4" /> 수정
                    </button>
                    <button 
                        onClick={() => onDelete(comment.id, comment.authorUsername)}
                        className="action-button-small delete"
                    >
                        <Trash2 className="w-4 h-4" /> 삭제
                    </button>
                </div>
            )}
        </div>
    );
};


// ===============================================
// 2. 메인 상세 페이지 컴포넌트
// ===============================================
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
    
    const [editingCommentId, setEditingCommentId] = useState(null); 
    const [editingCommentText, setEditingCommentText] = useState(''); 
    
    // 조회수 중복 증가 방지용 Ref
    const viewCountFetched = useRef(false);

    // ----------------------------------------------------
    // 초기 데이터 로드
    // ----------------------------------------------------
    useEffect(() => {
        const incrementView = async () => {
            try {
                await fetch(`http://localhost:3001/api/posts/${id}/view`, { method: 'POST' });
            } catch (err) {
                console.error("조회수 증가 API 실패:", err);
            }
        };

        if (viewCountFetched.current === false) {
            incrementView(); 
            viewCountFetched.current = true; 
        }

        fetchPostDetail(); 
        fetchComments(); 
        
    }, [id]);

    // 좋아요 상태 동기화
    useEffect(() => {
        if (post) { 
            if (currentUser && post.likedUsers && post.likedUsers.includes(currentUser.username)) {
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }
        }
    }, [post, currentUser]); 

    // 게시글 상세 정보 가져오기
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
    
    // 댓글 목록 가져오기
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
    // 핸들러 함수들 (댓글, 좋아요, 삭제)
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
                    author: currentUser.nickname,
                    authorUsername: currentUser.username 
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setComments(prev => [data.comment, ...prev]); 
                setNewCommentText(''); 
                setPost(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));
            } else {
                alert('댓글 작성에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
            alert('서버와의 연결에 실패했습니다.');
        }
    };

    const handleCommentEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.content);
    };
    const handleCommentCancel = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };
    const handleCommentUpdate = async (commentId) => {
        if (!editingCommentText.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: editingCommentText,
                    authorUsername: currentUser.username 
                })
            });
            if (response.ok) {
                setComments(prev => 
                    prev.map(c => 
                        c.id === commentId ? { ...c, content: editingCommentText } : c
                    )
                );
                handleCommentCancel(); 
            } else {
                const errData = await response.json();
                alert(errData.message || '댓글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 수정 오류:', error);
            alert('서버 오류로 댓글 수정에 실패했습니다.');
        }
    };
    const handleCommentDelete = async (commentId, authorUsername) => {
        if (!currentUser || currentUser.username !== authorUsername) {
            alert('삭제할 권한이 없습니다.');
            return;
        }
        // eslint-disable-next-line no-restricted-globals
        if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ authorUsername: currentUser.username }) 
                });
                if (response.ok) {
                    setComments(prev => prev.filter(c => c.id !== commentId));
                    setPost(prev => ({ ...prev, comments: (prev.comments || 1) - 1 }));
                } else {
                    const errData = await response.json();
                    alert(errData.message || '댓글 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('댓글 삭제 오류:', error);
                alert('서버 오류로 댓글 삭제에 실패했습니다.');
            }
        }
    };

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

    const handleDelete = async () => {
        if (!currentUser) {
            alert('삭제할 권한이 없습니다. (로그인 필요)');
            return;
        }
        if (currentUser.username !== post.author) {
            alert('본인이 작성한 글만 삭제할 수 있습니다.');
            return;
        }
        // eslint-disable-next-line no-restricted-globals
        const userConfirmed = confirm('정말로 이 게시글을 삭제하시겠습니까?');
        if (!userConfirmed) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authorUsername: currentUser.username })
            });
            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                navigate('/board'); 
            } else {
                const errData = await response.json();
                alert(errData.message || '게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('삭제 API 오류:', error);
            alert('서버와의 연결에 실패했습니다.');
        }
    };


    // ----------------------------------------------------
    // 렌더링 (UI)
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
                <button onClick={() => navigate('/board')} className="primary-button">
                    목록으로 돌아가기
                </button>
            </div>
        );
    }
    if (!post) { return null; }


    return (
        <div className="detail-container">
            {/* =============================================== */}
            {/* CSS 스타일 정의 */}
            {/* =============================================== */}
            <style>{`
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
                .primary-button {
                    background-color: #735048;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
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

                .post-header {
                    padding: 24px;
                    border-bottom: 1px solid #F2E2CE;
                }
                .category-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 9999px;
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
                
                .post-body {
                    padding: 24px;
                }
                
                /* 🌟 [추가된 이미지 스타일] */
                .post-image-container {
                    margin-bottom: 24px;
                    text-align: center;
                    border-radius: 8px;
                }
                .post-image {
                    max-width: 70%;
                    max-height: 600px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    object-fit: contain;
                }
                
                .post-content {
                    color: #594C3C;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    min-height: 200px;
                }

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
                    background-color: #735048;
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
                    background-color: #EF4444;
                    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
                }
                .like-button.liked:hover:not(:disabled) {
                    background-color: #DC2626; 
                }
                @keyframes heartBeat {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                .heart-beat {
                    animation: heartBeat 0.5s ease-in-out;
                }

                .comments-area {
                    padding: 24px;
                    background-color: #F2EDE4;
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
                    font-family: inherit;
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
                    white-space: pre-wrap; 
                    word-break: break-word; 
                }

                .comment-edit-form {
                    margin-top: 8px;
                }
                .comment-textarea.edit {
                    width: 100%; 
                    min-height: 80px;
                }

                .comment-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                .action-button-small {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    font-size: 13px;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .action-button-small .w-4 { width: 16px; height: 16px; } 
                
                .action-button-small.edit {
                    color: #735048; 
                    background-color: #F2E2CE;
                    border-color: #F2E2CE;
                }
                .action-button-small.edit:hover {
                    background-color: #e4d2bc; 
                }
                .action-button-small.delete {
                    color: #991B1B; 
                    background-color: #fee2e2; 
                    border-color: #fee2e2;
                }
                .action-button-small.delete:hover {
                    background-color: #fecdd3;
                }
                .action-button-small.save {
                    color: white;
                    background-color: #735048; 
                    border-color: #735048;
                }
                .action-button-small.save:hover {
                    background-color: #594C3C;
                }
                .action-button-small.cancel {
                    color: #6b7280; 
                    background-color: #e5e7eb; 
                    border-color: #e5e7eb;
                }
                .action-button-small.cancel:hover {
                    background-color: #d1d5db;
                }

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
                    text-decoration: none; 
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
                    background-color: #B91C1C;
                    color: white;
                    border: none;
                }
                .delete-button:hover {
                    background-color: #991B1B;
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
                        <div className="mb-3">
                            <span className="category-badge">
                                {post.category}
                            </span>
                        </div>
                        <h1 className="post-title">
                            {post.title}
                        </h1>
                        <div className="post-meta">
                            <div className="meta-item"><User className="w-4 h-4" /><span>{post.author}</span></div>
                            <div className="meta-item"><Calendar className="w-4 h-4" /><span>{post.date ? post.date : (post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : '날짜없음')}</span></div>
                            <div className="meta-item"><Eye className="w-4 h-4" /><span>조회 {post.views}</span></div>
                            <div className="meta-item"><MessageSquare className="w-4 h-4" /><span>댓글 {post.comments}</span></div>
                        </div>
                    </div>
                    
                    {/* 게시글 본문 */}
                    <div className="post-body">
                        {/* 🌟 [이미지 렌더링 영역 추가] */}
                        {post.image && (
                            <div className="post-image-container">
                                <img 
                                    src={post.image} 
                                    alt="게시글 첨부 이미지" 
                                    className="post-image" 
                                />
                            </div>
                        )}
                        
                        <div className="post-content">
                            {post.content}
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

                    {/* 댓글 영역 */}
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
                                    <CommentItem 
                                        key={comment.id} 
                                        comment={comment} 
                                        currentUser={currentUser} 
                                        isEditing={editingCommentId === comment.id}
                                        editedContent={editingCommentText}
                                        onEdit={handleCommentEdit}
                                        onCancel={handleCommentCancel}
                                        onUpdate={handleCommentUpdate}
                                        onDelete={handleCommentDelete}
                                        onTextChange={setEditingCommentText}
                                    />
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
                        <Link
                            to={`/board/edit/${id}`}
                            className="action-button edit-button"
                        >
                            <Edit className="w-4 h-4" />수정
                        </Link>
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