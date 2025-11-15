import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
// 🌟 [수정] MessageSquare 아이콘 추가
import { User, ClipboardList, BookOpen, Key, Mail, Edit, Trash2, Calendar, LogOut, Check, X, AlertCircle, MessageSquare } from 'lucide-react';
import './ProfileManagement.css'; // 🌟 몽글몽글 디자인 CSS 파일 임포트

// ===============================================
// 💡 1. 회원 정보 관리 탭 (ProfileContent)
// ===============================================
// 🌟 [수정] 메인 컴포넌트에서 navigate를 props로 받도록 변경
const ProfileContent = ({ currentUser, handleLogout, navigate }) => {
    // const navigate = useNavigate(); // 👈 [제거]
    const [nickname, setNickname] = useState(currentUser?.nickname || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' }); 
    
    // (기존 기능 로직은 모두 그대로 유지됩니다)
    // 닉네임 중복 확인
    const handleCheckNickname = async () => {
        setMessage({ type: '', text: '' }); 
        if (nickname === currentUser.nickname) {
            setMessage({ type: 'info', text: '현재 닉네임입니다.' });
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/users/check-nickname', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: data.message }); 
            } else {
                setMessage({ type: 'error', text: data.message }); 
            }
        } catch (error) {
            setMessage({ type: 'error', text: '중복 확인 중 오류가 발생했습니다.' });
        }
    };
    const handleProfileSave = async () => {
        if (nickname === currentUser.nickname) {
            setMessage({ type: 'info', text: '변경 사항이 없습니다.' });
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, nickname }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: '닉네임이 성공적으로 변경되었습니다. 갱신을 위해 3초 후 다시 로그인해주세요.' });
                setTimeout(() => {
                    handleLogout();
                    navigate('/login');
                }, 3000); 
            } else {
                setMessage({ type: 'error', text: data.message || '닉네임 변경에 실패했습니다.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '프로필 저장 중 오류가 발생했습니다.' });
        }
    };
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: '모든 비밀번호 필드를 입력해주세요.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/users/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: currentUser.id, 
                    currentPassword, 
                    newPassword 
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: '비밀번호가 변경되었습니다. 3초 후 다시 로그인해주세요.' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    handleLogout();
                    navigate('/login');
                }, 3000); 
            } else {
                setMessage({ type: 'error', text: data.message || '비밀번호 변경에 실패했습니다.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '비밀번호 변경 중 오류가 발생했습니다.' });
        }
    };
    const handleAccountDelete = async () => {
        // eslint-disable-next-line no-restricted-globals
        const isConfirmed = confirm(`정말로 회원 탈퇴를 진행하시겠습니까?\n'${currentUser.username}' 계정의 모든 정보(게시글, 댓글, 신청내역)가 삭제되며 복구할 수 없습니다.`);
        if (isConfirmed) {
            try {
                const response = await fetch('http://localhost:3001/api/users/account', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.id }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
                    handleLogout();
                    navigate('/');
                } else {
                    setMessage({ type: 'error', text: data.message || '회원 탈퇴에 실패했습니다.' });
                }
            } catch (error) {
                setMessage({ type: 'error', text: '회원 탈퇴 중 오류가 발생했습니다.' });
            }
        }
    };

    return (
        <div className="profile-content-wrapper">
            {/* ( ... 기존 ProfileContent JSX ... ) */}
            {message.text && (
                <div className={`message-box ${message.type}`}>
                    {message.type === 'success' && <Check className="icon" />}
                    {message.type === 'error' && <AlertCircle className="icon" />}
                    {message.text}
                </div>
            )}
            <div className="profile-card">
                <h2 className="card-header">
                    <User className="icon-main icon-amber"/> 회원 기본 정보
                </h2>
                <div className="form-group">
                    <label className="form-label">아이디</label>
                    <div className="form-input-readonly">
                        {currentUser.username}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">이메일</label>
                    <div className="form-input-readonly">
                        <Mail className="icon-sm" /> {currentUser.email}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="nickname" className="form-label">닉네임</label>
                    <div className="form-row">
                        <input 
                            id="nickname"
                            type="text" 
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="form-input flex-1"
                        />
                        <button 
                            onClick={handleCheckNickname} 
                            className="button secondary-light"
                        >
                            중복 확인
                        </button>
                    </div>
                </div>
                <div className="card-footer">
                    <button 
                        onClick={handleProfileSave} 
                        className="button primary"
                    >
                        정보 저장
                    </button>
                </div>
            </div>
            <form onSubmit={handleChangePassword} className="profile-card">
                <h2 className="card-header danger">
                    <Key className="icon-main icon-danger"/> 비밀번호 변경
                </h2>
                <div className="form-group">
                    <label className="form-label">현재 비밀번호</label>
                    <input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="form-input danger-focus"
                        placeholder="현재 사용 중인 비밀번호"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">새 비밀번호</label>
                    <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-input danger-focus"
                        placeholder="새 비밀번호"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">새 비밀번호 확인</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input danger-focus"
                        placeholder="새 비밀번호 확인"
                    />
                </div>
                <div className="card-footer danger">
                    <button 
                        type="submit"
                        className="button danger"
                    >
                        비밀번호 변경
                    </button>
                </div>
            </form>
            <div className="profile-card danger-light">
                 <h2 className="card-header danger-light-text">
                    <Trash2 className="icon-main icon-danger-light"/> 회원 탈퇴
                 </h2>
                 <p className="card-description danger">
                   회원 탈퇴 시 작성하신 모든 게시글, 댓글, 일기, 리뷰, 입양 신청 내역이 영구적으로 삭제되며 복구할 수 없습니다.
                 </p>
                 <div className="card-footer-text">
                    <button 
                        onClick={handleAccountDelete} 
                        className="button-link-danger"
                    >
                        회원 탈퇴 진행
                    </button>
                 </div>
            </div>
        </div>
    );
};

// ===============================================
// 💡 2. 입양 신청 내역 탭 (ApplicationContent)
// ===============================================
const ApplicationContent = ({ currentUser, navigate }) => { 
// ... (기존 ApplicationContent 코드와 동일) ...
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    // const navigate = useNavigate(); // 👈 [제거]

    useEffect(() => {
        if (!currentUser?.username) return;

        const fetchApplications = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:3001/api/applications/${currentUser.username}`);
                if (response.ok) {
                    const data = await response.json();
                    setApplications(data);
                } else {
                    setError('신청 내역을 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                setError('서버 연결에 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchApplications();
    }, [currentUser.username]);

    return (
      <div className="profile-card">
        <h2 className="card-header">
            <ClipboardList className="icon-main icon-amber"/> 입양 신청 내역
        </h2>
        
        {loading ? (
            <p className="card-placeholder">신청 내역을 불러오는 중...</p>
        ) : error ? (
            <p className="card-placeholder error">{error}</p>
        ) : applications.length === 0 ? (
            <p className="card-placeholder">입양 신청 내역이 없습니다.</p>
        ) : (
            <div className="application-list">
            {applications.map(app => (
                <div 
                    key={app.id} 
                    className="application-card"
                    onClick={() => navigate(`/adoption/${app.postId}`)}
                >
                    <div>
                        <p className="application-pet-name">{app.petName}</p>
                        <div className="application-meta">
                            <span className="meta-item"><Calendar className="icon-xs"/> 신청일: {new Date(app.createdAt).toLocaleDateString('ko-KR')}</span>
                            <span className="meta-item">보호소: {app.shelter}</span>
                        </div>
                    </div>
                    <span className={`status-badge ${
                        app.status === '심사 중' || app.status === '신청완료' ? 'status-pending' :
                        app.status === '승인 완료' ? 'status-success' :
                        'status-danger'
                    }`}>
                        {app.status}
                    </span>
                </div>
            ))}
            </div>
        )}
      </div>
    );
};

// ===============================================
// 💡 3. 나의 게시글 탭 (ActivityContent)
// ===============================================
const ActivityContent = ({ currentUser, navigate }) => { 
// ... (기존 ActivityContent 코드와 동일) ...
    // const navigate = useNavigate(); // 👈 [제거]
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser?.username) return; 
        const fetchMyPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:3001/api/users/${currentUser.username}/posts`);
                if (response.ok) {
                    const data = await response.json();
                    setMyPosts(data);
                } else {
                    setError('게시글을 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                setError('서버 연결에 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyPosts();
    }, [currentUser.username]);

    const handlePostDelete = async (postId) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                // 🌟 [수정] ProfileManagement에서 삭제 시에도 본인 ID(username) 전송
                const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ authorUsername: currentUser.username }) 
                });
                if (response.ok) {
                    setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                    alert('게시글이 삭제되었습니다.');
                } else {
                    const errData = await response.json();
                    alert(errData.message || '게시글 삭제에 실패했습니다.');
                }
            } catch (err) {
                alert('게시글 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="profile-card">
            <h2 className="card-header">
                <BookOpen className="icon-main icon-amber"/> 나의 게시글
            </h2>
            
            {loading ? (
                <p className="card-placeholder">게시글을 불러오는 중...</p>
            ) : error ? (
                <p className="card-placeholder error">{error}</p>
            ) : myPosts.length === 0 ? (
                <p className="card-placeholder">작성한 게시글이 없습니다.</p>
            ) : (
                <div className="activity-table-wrapper">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>카테고리</th>
                                <th>제목</th>
                                <th>댓글/조회</th>
                                <th>날짜</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myPosts.map(post => (
                                <tr key={post.id}>
                                    <td data-label="카테고리">{post.category}</td>
                                    <td data-label="제목">
                                        <span 
                                            className="table-link"
                                            onClick={() => navigate(`/board/${post.id}`)}
                                        >
                                            {post.title}
                                        </span>
                                    </td>
                                    <td data-label="댓글/조회" className="text-center">{post.comments} / {post.views}</td>
                                    <td data-label="날짜" className="text-center">{new Date(post.createdAt).toISOString().split('T')[0]}</td>
                                    <td data-label="관리" className="text-center">
                                        <div className="table-actions">
                                            <button 
                                                onClick={() => navigate(`/board/edit/${post.id}`)} 
                                                className="action-button edit"
                                            >
                                                <Edit className="icon-xs" />
                                            </button>
                                            <button 
                                                onClick={() => handlePostDelete(post.id)} 
                                                className="action-button delete"
                                            >
                                                <Trash2 className="icon-xs" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ===============================================
// 💡 4. [NEW] 나의 댓글 탭 (ActivityCommentsContent)
// ===============================================
const ActivityCommentsContent = ({ currentUser, navigate }) => {
    const [myComments, setMyComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 🌟 [수정] 닉네임이 아닌 username으로 API 호출
        if (!currentUser?.username) return;

        const fetchMyComments = async () => {
            setLoading(true);
            setError(null);
            try {
                // 🌟 [수정] API 경로를 nickname -> username으로 변경 (index.js와 일치)
                const response = await fetch(`http://localhost:3001/api/users/username/${currentUser.username}/comments`);
                if (response.ok) {
                    const data = await response.json();
                    setMyComments(data);
                } else {
                    setError('댓글 내역을 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                setError('서버 연결에 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyComments();
    }, [currentUser.username]); // 🌟 [수정] 의존성 변경

    return (
        <div className="profile-card">
            <h2 className="card-header">
                <MessageSquare className="icon-main icon-amber"/> 나의 댓글
            </h2>
            
            {loading ? (
                <p className="card-placeholder">댓글을 불러오는 중...</p>
            ) : error ? (
                <p className="card-placeholder error">{error}</p>
            ) : myComments.length === 0 ? (
                <p className="card-placeholder">작성한 댓글이 없습니다.</p>
            ) : (
                <div className="application-list">
                    {myComments.map(comment => (
                        <div 
                            key={comment.id} 
                            className="application-card" 
                            onClick={() => navigate(`/board/${comment.postId}`)}
                        >
                            <div>
                                <p className="comment-content">{comment.content}</p>
                                <div className="application-meta">
                                    <span className="meta-item"><Calendar className="icon-xs"/> {new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                                    <span className="meta-item-post">
                                        원본 글: {comment.postTitle ? `"${comment.postTitle}"` : `(게시글 ID: ${comment.postId})`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// ===============================================
// 💡 탭 버튼 컴포넌트
// ===============================================
const TabItem = ({ name, label, icon: Icon, active, onClick }) => (
// ... (기존 코드와 동일) ...
  <button
    onClick={() => onClick(name)}
    className={`tab-item ${active ? 'active' : ''}`}
  >
    <Icon className="icon" />
    {label}
  </button>
);


// ===============================================
// 💡 메인 컴포넌트
// ===============================================
export default function ProfileManagement({ currentUser, handleLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate(); // 🌟 [수정] 메인 컴포넌트 스코프에서 useNavigate 훅 사용

  // 🌟 [제거] PrivateRoute가 이미 처리하므로 중복 navigate 제거
  // useEffect(() => {
  //   if (!currentUser) {
  //     navigate('/login');
  //   }
  // }, [currentUser, navigate]); 

  const handleTabClick = (tabName) => {
      setActiveTab(tabName);
  };
  
  if (!currentUser) {
    return (
        <div className="profile-page-wrapper loading">
            <div className="loading-spinner"></div>
        </div>
    ); 
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent currentUser={currentUser} handleLogout={handleLogout} navigate={navigate} />;
      case 'application':
        return <ApplicationContent currentUser={currentUser} navigate={navigate} />;
      case 'activity':
        return <ActivityContent currentUser={currentUser} navigate={navigate} />;
      // 🌟 [추가] '나의 댓글' 탭 렌더링
      case 'comments':
        return <ActivityCommentsContent currentUser={currentUser} navigate={navigate} />;
      default:
        return <ProfileContent currentUser={currentUser} handleLogout={handleLogout} navigate={navigate} />;
    }
  };

  return (
    <div className="profile-page-wrapper">
        <div className="profile-container">
            <h1 className="profile-header">
                마이페이지
            </h1>

            <div className="profile-tabs-container">
                <TabItem 
                    name="profile" 
                    label="회원 정보 관리" 
                    icon={User} 
                    active={activeTab === 'profile'} 
                    onClick={handleTabClick} 
                />
                <TabItem 
                    name="application" 
                    label="입양 신청 내역" 
                    icon={ClipboardList} 
                    active={activeTab === 'application'} 
                    onClick={handleTabClick} 
                />
                <TabItem 
                    name="activity" 
                    label="나의 게시글" 
                    icon={BookOpen} 
                    active={activeTab === 'activity'} 
                    onClick={handleTabClick} 
                />
                {/* 🌟 [추가] '나의 댓글' 탭 버튼 */}
                <TabItem 
                  name="comments" 
                  label="나의 댓글" 
                  icon={MessageSquare}
                  active={activeTab === 'comments'} 
                  onClick={handleTabClick} 
                />
            </div>

            {/* 탭 콘텐츠 영역 */}
            {renderContent()}

        </div>
    </div>
  );
}