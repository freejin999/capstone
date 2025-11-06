import React, { useState } from 'react';
import { User, ClipboardList, BookOpen, Key, Mail, Edit, Trash2, Calendar } from 'lucide-react';

// ===============================================
// 💡 더미 데이터 (실제 데이터 연동 전까지 사용)
// ===============================================
const mockApplications = [
  { id: 101, petName: '나비 (Shih Tzu)', date: '2024-09-01', status: '심사 중', shelter: '강남 보호소' },
  { id: 102, petName: '초코 (Poodle)', date: '2024-08-15', status: '승인 완료', shelter: '송파 보호소' },
  { id: 103, petName: '복돌이 (Mix)', date: '2024-07-20', status: '반려', shelter: '성남 보호소' },
];

const mockUserPosts = [
  { id: 5, title: '오늘 날씨 정말 좋네요!', category: '자유게시판', date: '2024-01-13', views: 678, comments: 42 },
  { id: 4, title: '회원가입 오류 문의드립니다', category: '질문답변', date: '2024-01-14', views: 234, comments: 15 },
];

// ===============================================
// 💡 서브 컴포넌트: 각 탭의 내용
// ===============================================

// 1. 회원 정보 관리 탭
const ProfileContent = () => {
    // ⚠️ 경고: alert()는 사용하지 않으므로 console.log로 대체
    const handleAction = (action) => {
        console.log(`[ACTION] ${action} 버튼 클릭됨`);
        alert(`${action} 기능은 백엔드 연동이 필요합니다.`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><User className="w-5 h-5 text-blue-600"/> 회원 기본 정보</h2>
            
            {/* 닉네임 */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">닉네임</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        defaultValue="사용자 닉네임"
                        className="flex-1 p-3 border rounded-lg focus:ring-blue-500"
                    />
                    <button 
                        onClick={() => handleAction('닉네임 중복 확인')} 
                        className="bg-gray-200 text-gray-700 px-4 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                        중복 확인
                    </button>
                </div>
            </div>

            {/* 이메일 */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">이메일</label>
                <div className="flex items-center p-3 border rounded-lg bg-gray-100 text-gray-500">
                    <Mail className="w-5 h-5 mr-2 text-gray-400" /> user@example.com
                </div>
            </div>

            {/* 비밀번호 변경 및 탈퇴 */}
            <div className="border-t pt-4 flex justify-between items-center">
                <button 
                    onClick={() => handleAction('비밀번호 변경')} 
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                >
                    <Key className="w-4 h-4" /> 비밀번호 변경
                </button>
                <button 
                    onClick={() => handleAction('회원 탈퇴')} 
                    className="text-sm text-gray-500 hover:text-red-500 transition"
                >
                    회원 탈퇴
                </button>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end pt-4 border-t">
                <button 
                    onClick={() => handleAction('정보 저장')} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                    정보 저장
                </button>
            </div>
        </div>
    );
};

// 2. 입양 신청 내역 탭
const ApplicationContent = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><ClipboardList className="w-5 h-5 text-blue-600"/> 입양 신청 내역</h2>
      
      {/* 신청 목록 */}
      <div className="mt-4 space-y-3">
          {mockApplications.map(app => (
              <div 
                  key={app.id} 
                  className="p-4 border rounded-lg flex justify-between items-center hover:bg-blue-50 transition cursor-pointer" // 👈 클릭 가능하도록 변경
                  onClick={() => {
                      console.log(`[ACTION] 입양 신청서 ID ${app.id} 상세 보기`);
                      alert(`입양 신청서 ID ${app.id}의 상세 정보를 보여줍니다.`);
                  }}
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
      
  </div>
);

// 3. 나의 게시글/활동 탭
const ActivityContent = () => {
    // ⚠️ 경고: alert()는 사용하지 않으므로 console.log로 대체
    const handlePostAction = (postId, action) => {
        console.log(`[ACTION] 게시글 ID ${postId}, ${action} 버튼 클릭됨`);
        alert(`게시글 ${postId}를 ${action} 처리합니다. (백엔드 필요)`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b"><BookOpen className="w-5 h-5 text-blue-600"/> 나의 게시글</h2>
            
            {/* 게시글 목록 테이블 */}
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
                        {mockUserPosts.map(post => (
                            <tr key={post.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                                <td 
                                    className="px-4 py-4 text-sm font-medium text-blue-600 cursor-pointer"
                                    onClick={() => {
                                        console.log(`[ACTION] 게시글 ID ${post.id} 제목 클릭`);
                                        alert(`게시판 상세 페이지로 이동합니다. (ID: ${post.id})`);
                                    }}
                                >
                                    {post.title}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                    {post.comments} / {post.views}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{post.date}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                                    <div className="flex justify-center space-x-2">
                                        <button 
                                            onClick={() => handlePostAction(post.id, '수정')} 
                                            className="text-blue-500 hover:text-blue-700 p-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handlePostAction(post.id, '삭제')} 
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
        </div>
    );
};

// 탭 버튼 컴포넌트
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
export default function ProfileManagement() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // 💡 누락된 탭 핸들러 함수 추가 (이전에 추가 완료)
  const handleTabClick = (tabName) => {
      setActiveTab(tabName);
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent />;
      case 'application':
        return <ApplicationContent />;
      case 'activity':
        return <ActivityContent />;
      default:
        return <ProfileContent />;
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
          label="나의 게시글/활동" 
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
