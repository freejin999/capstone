import React, { useState } from 'react';
// 1. useNavigate와 Link를 import 합니다.
import { useNavigate, Link } from 'react-router-dom';

/**
 * 로그인 페이지 컴포넌트
 * @param {object} props
 * @param {function} props.handleLogin - App.js에서 받은 로그인 상태 변경 함수 (user 객체를 받음)
 */
function LoginPage({ handleLogin }) {
    const navigate = useNavigate();
    
    // ID와 PW를 관리할 상태 생성
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // 에러 메시지 상태
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태

    // 폼 제출(로그인 버튼 클릭) 시 실행되는 함수
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
        setError(null); // 에러 초기화
        setIsSubmitting(true);

        // 🌟 실제 백엔드 API 호출 🌟
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json(); // 🌟 response.json()을 'result' 변수에 저장

            if (response.ok) {
                // ✅ 로그인 성공
                console.log('로그인 성공:', result.message);
                
                // 🌟 [핵심 수정] 🌟
                // App.js의 handleLogin에 서버로부터 받은 'user' 객체를 전달합니다.
                handleLogin(result.user); 
                
                navigate('/'); // 로그인 완료 후 메인 페이지로 이동
            } else {
                // 🚨 로그인 실패 (서버에서 보낸 에러 메시지 표시)
                setError(result.message || '로그인에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('로그인 API 오류:', apiError);
            setError('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">로그인</h1>
                
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    
                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* 아이디 입력 필드 */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                        <input
                            id="username"
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="아이디를 입력하세요"
                            required
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
                            required
                        />
                    </div>

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                <span>로그인 중...</span>
                            </div>
                        ) : (
                            '로그인'
                        )}
                    </button>
                </form>
                
                <p className="mt-4 text-center text-sm text-gray-500">
                    <Link to="/register" className="text-blue-500 hover:underline">회원가입</Link> | 
                    <a href="#" className="text-blue-500 hover:underline ml-1">아이디/비밀번호 찾기</a>
                </p>
            </div>
        </div>
    );
}

// 📍 이 파일의 기본 내보내기로 LoginPage 함수를 지정합니다.
export default LoginPage;