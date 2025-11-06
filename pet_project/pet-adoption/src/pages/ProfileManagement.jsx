import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ClipboardList, BookOpen, Key, Mail, Edit, Trash2, Calendar, LogOut, Check, X } from 'lucide-react';

// ===============================================
// 💡 1. 회원 정보 관리 탭 (ProfileContent)
// ===============================================
const ProfileContent = ({ currentUser, handleLogout }) => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState(currentUser?.nickname || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' }); // 성공/에러 메시지

    // 닉네임 중복 확인
    const handleCheckNickname = async () => {
        setMessage({ type: '', text: '' }); // 메시지 초기화
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
                setMessage({ type: 'success', text: data.message }); // "사용 가능한 닉네임입니다."
            } else {
                setMessage({ type: 'error', text: data.message }); // "이미 사용 중인 닉네임입니다."
            }
        } catch (error) {
            setMessage({ type: 'error', text: '중복 확인 중 오류가 발생했습니다.' });
        }
    };

    // 닉네임/프로필 저장
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
                setMessage({ type: 'success', text: '닉네임이 성공적으로 변경되었습니다. 다시 로그인해주세요.' });
                // 중요: 닉네임 변경 시 세션/토큰 정보 갱신을 위해 로그아웃 처리
                setTimeout(() => {
                    handleLogout();
                    navigate('/login');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || '닉네임 변경에 실패했습니다.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '프로필 저장 중 오류가 발생했습니다.' });
        }
    };

    // 비밀번호 변경
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
                setMessage({ type: 'success', text: '비밀번호가 변경되었습니다. 다시 로그인해주세요.' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    handleLogout();
                    navigate('/login');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || '비밀번호 변경에 실패했습니다.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '비밀번호 변경 중 오류가 발생했습니다.' });
        }
    };

    // 회원 탈퇴
    const handleAccountDelete = async () => {
        // 🚨 alert() 대신 window.confirm()을 사용해야 하지만, 
        // 가이드라인에 따라 confirm을 사용할 수 없으므로 텍스트 기반으로 대체합니다.
        // 실제 운영 시에는 '비밀번호'를 한 번 더 입력받는 모달창을 띄우는 것이 좋습니다.
        
        // eslint-disable-next-line no-restricted-globals
        const isConfirmed = confirm(`정말로 회원 탈퇴를 진행하시겠습니까?\n'${currentUser.username}' 계정의 모든 정보가 삭제되며 복구할 수 없습니다.`);

        if (isConfirmed) {
            try {
                const response = await fetch('http://localhost:3001/api/users/account', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.id }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.'); // 탈퇴는 alert 사용 허용
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
        <div className="space-y-8">
            {/* 메시지 알림창 */}
            {message.text && (
                <div className={`p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-100 text-green-800' :
                    message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {message.text}
                </div>
            )}
            
            {/* 회원 기본 정보 */}
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><User className="w-5 h-5 text-blue-600"/> 회원 기본 정보</h2>
                
                {/* 아이디 */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">아이디</label>
                    <div className="flex items-center p-3 border rounded-lg bg-gray-100 text-gray-500">
                        {currentUser.username}
                    </div>
                </div>

                {/* 이메일 */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">이메일</label>
                    <div className="flex items-center p-3 border rounded-lg bg-gray-100 text-gray-500">
                        <Mail className="w-5 h-5 mr-2 text-gray-400" /> {currentUser.email}
                    </div>
                </div>
                
                {/* 닉네임 */}
                <div className="flex flex-col">
                    <label htmlFor="nickname" className="text-sm font-medium text-gray-600 mb-1">닉네임</label>
                    <div className="flex gap-2">
                        <input 
                            id="nickname"
                            type="text" 
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="flex-1 p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button 
                            onClick={handleCheckNickname} 
                            className="bg-gray-200 text-gray-700 px-4 rounded-lg hover:bg-gray-300 transition text-sm"
                        >
                            중복 확인
                        </button>
                    </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex justify-end pt-4 border-t">
                    <button 
                        onClick={handleProfileSave} 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        정보 저장
                    </button>
                </div>
            </div>

            {/* 비밀번호 변경 */}
            <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><Key className="w-5 h-5 text-red-600"/> 비밀번호 변경</h2>
                
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">현재 비밀번호</label>
                    <input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="현재 사용 중인 비밀번호"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">새 비밀번호</label>
                    <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="새 비밀번호"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">새 비밀번호 확인</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="새 비밀번호 확인"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button 
                        type="submit"
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                        비밀번호 변경
                    </button>
                </div>
            </form>

            {/* 회원 탈퇴 */}
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><Trash2 className="w-5 h-5 text-gray-500"/> 회원 탈퇴</h2>
                 <p className="text-gray-600 text-sm">
                    회원 탈퇴 시 작성하신 모든 게시글과 댓글, 입양 신청 내역이 영구적으로 삭제되며 복구할 수 없습니다.
                 </p>
                 <div className="flex justify-end pt-4 border-t">
                    <button 
                        onClick={handleAccountDelete} 
                        className="text-sm text-gray-500 hover:text-red-500 hover:underline transition"
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
const ApplicationContent = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⚠️ TODO: 입양 신청 내역 API 연동 필요
    // 현재는 더미 데이터를 사용합니다.
    useEffect(() => {
        setLoading(true);
        // [임시] 더미 데이터
        const mockApplications = [
            { id: 101, petName: '나비 (Shih Tzu)', date: '2024-09-01', status: '심사 중', shelter: '강남 보호소' },
            { id: 102, petName: '초코 (Poodle)', date: '2024-08-15', status: '승인 완료', shelter: '송파 보호소' },
            { id: 103, petName: '복돌이 (Mix)', date: '2024-07-20', status: '반려', shelter: '성남 보호소' },
        ];
        setApplications(mockApplications);
        setLoading(false);
    }, []);

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><ClipboardList className="w-5 h-5 text-blue-600"/> 입양 신청 내역</h2>
        
        {loading ? (
            <p className="text-gray-500 text-center py-4">불러오는 중...</p>
        ) : applications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">입양 신청 내역이 없습니다.</p>
        ) : (
            <div className="mt-4 space-y-3">
            {applications.map(app => (
                <div 
                    key={app.id} 
                    className="p-4 border rounded-lg flex justify-between items-center hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => alert(`입양 신청서 ID ${app.id}의 상세 정보를 보여줍니다. (연동 필요)`)}
                >
                    <div>
                        <p className="font-semibold text-gray-800">{app.petName}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1 gap-4">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> 신청일: {app.date}</span>
                            <span className="flex items-center gap-1">보호소: {app.shelter}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                        app.status === '심사 중' ? 'bg-yellow-200 text-yellow-800' :
                        app.status === '승인 완료' ? 'bg-green-200 text-green-800' :
                        'bg-red-200 text-red-800'
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
const ActivityContent = ({ currentUser }) => {
    const navigate = useNavigate();
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🌟 '내가 쓴 글' 목록을 서버에서 가져오기
    useEffect(() => {
        if (!currentUser?.username) return; // 사용자 정보가 없으면 실행 중지

        const fetchMyPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // 🌟 서버 API 호출 (server/index.js에 구현된 API)
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
    }, [currentUser.username]); // currentUser.username이 변경될 때만 실행

    // 게시글 삭제 핸들러
    const handlePostDelete = async (postId) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    // UI에서 즉시 삭제
                    setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                    alert('게시글이 삭제되었습니다.');
                } else {
                    alert('게시글 삭제에 실패했습니다.');
                }
            } catch (err) {
                alert('게시글 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><BookOpen className="w-5 h-5 text-blue-600"/> 나의 게시글</h2>
            
            {loading ? (
                <p className="text-gray-500 text-center py-4">게시글을 불러오는 중...</p>
            ) : error ? (
                <p className="text-red-500 text-center py-4">{error}</p>
            ) : myPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">작성한 게시글이 없습니다.</p>
            ) : (
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">댓글/조회</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {myPosts.map(post => (
                                <tr key={post.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                                    <td 
                                        className="px-4 py-4 text-sm font-medium text-blue-600 cursor-pointer"
                                        onClick={() => navigate(`/board/${post.id}`)}
                                    >
                                        {post.title}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                        {post.comments} / {post.views}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                        {new Date(post.createdAt).toISOString().split('T')[0]}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => navigate(`/board/edit/${post.id}`)} 
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handlePostDelete(post.id)} 
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
// 💡 탭 버튼 컴포넌트
// ===============================================
const TabItem = ({ name, label, icon: Icon, active, onClick }) => (
  <button
    onClick={() => onClick(name)}
    className={`flex items-center gap-2 px-6 py-3 font-medium transition whitespace-nowrap ${
      active 
        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5"/>
    {label}
  </button>
);


// ===============================================
// 💡 메인 컴포넌트
// ===============================================
/**
 * 마이페이지 메인 컴포넌트
 * @param {object} props
 * @param {object | null} props.currentUser - App.js에서 전달받은 로그인한 사용자 정보
 * @param {function} props.handleLogout - App.js에서 전달받은 로그아웃 함수
 */
export default function ProfileManagement({ currentUser, handleLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // 💡 currentUser가 없으면(로그아웃 상태) 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleTabClick = (tabName) => {
      setActiveTab(tabName);
  };
  
  // 💡 currentUser가 로드되기 전에 렌더링되는 것을 방지
  if (!currentUser) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    ); 
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        // 🌟 ProfileContent에 currentUser와 handleLogout 전달
        return <ProfileContent currentUser={currentUser} handleLogout={handleLogout} />;
      case 'application':
        return <ApplicationContent currentUser={currentUser} />;
      case 'activity':
        // 🌟 ActivityContent에 currentUser 전달
        return <ActivityContent currentUser={currentUser} />;
      default:
        return <ProfileContent currentUser={currentUser} handleLogout={handleLogout} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">
        마이페이지
      </h1>

      {/* 탭 네비게이션 */}
      <div className="flex border-b mb-6 bg-white rounded-t-lg shadow-sm overflow-x-auto">
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
      </div>

      {/* 탭 콘텐츠 영역 */}
      {renderContent()}

    </div>
  );
}