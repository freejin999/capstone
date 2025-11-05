import React, { useState } from 'react';
// 1. Link를 import 합니다.
import { useNavigate, Link } from 'react-router-dom';

/**
 * 로그인 페이지 컴포넌트
 * @param {object} props
 * @param {function} props.handleLogin - App.js에서 받은 로그인 상태 변경 함수
 */
function LoginPage({ handleLogin }) {
  const navigate = useNavigate();
  
  // ID와 PW를 관리할 상태 생성
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 폼 제출(로그인 버튼 클릭) 시 실행되는 함수
  const handleLoginSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    // 🌟 서버 통신 시뮬레이션 🌟
    // 실제로는 여기에 서버로 ID/PW를 보내는 API 통신 코드가 들어갑니다.
    
    if (username && password) {
      console.log('로그인 시도:', username);
      
      // ✅ 서버 통신 성공 가정 후 로그인 상태 변경 (App.js의 상태를 true로 만듦)
      handleLogin(); 
      
      // 로그인 완료 후 메인 페이지로 이동
      navigate('/'); 
    } else {
      // 🚨 window.alert() 대신, 더 나은 UI/UX를 위해 상태 기반 에러 메시지를 고려해보세요.
      alert('아이디와 비밀번호를 모두 입력해주세요.');
    }
  };
  
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">로그인</h1>
        
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* 아이디 입력 필드 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input
              id="username"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={username}
              // ✅ 올바른 코드
              onChange={(e) => setUsername(e.target.value)}              
              placeholder="아이디를 입력하세요"
            />
          </div>
          
          {/* 비밀번호 입력 필드 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              id="password"
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-150"
          >
            로그인
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-500">
          {/* 2. <a> 태그를 <Link>로 변경하고, to="/register" 경로를 지정합니다. */}
          <Link to="/register" className="text-blue-500 hover:underline">회원가입</Link> | 
          <a href="#" className="text-blue-500 hover:underline ml-1">아이디/비밀번호 찾기</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

