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

        if (!username.trim() || !password.trim()) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        // 🌟 실제 백엔드 API 호출 🌟
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json(); 

            if (response.ok) {
                // ✅ 로그인 성공
                console.log('로그인 성공:', result.user);
                
                // App.js의 handleLogin에 서버로부터 받은 'user' 객체와 토큰을 전달
                // 현재는 DB 연동 전이므로 user 객체에 임시값만 있다고 가정
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
        <div className="login-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
                
                .login-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #F2EDE4; /* Light Background */
                    font-family: 'Inter', sans-serif;
                    padding: 20px;
                }
                .login-card {
                    padding: 32px;
                    background-color: white;
                    box-shadow: 0 10px 20px rgba(89, 76, 60, 0.15); /* Dark Brown Shadow */
                    border-radius: 12px;
                    width: 100%;
                    max-width: 380px;
                    border: 1px solid #F2E2CE; /* Light Accent border */
                }
                .title {
                    font-size: 28px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 24px;
                    color: #735048; /* Primary Color */
                }
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .label-text {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #594C3C; /* Dark Brown Text */
                    margin-bottom: 4px;
                }
                .input-field {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #F2CBBD; /* Accent Border */
                    border-radius: 8px;
                    box-sizing: border-box;
                    font-size: 16px;
                    color: #594C3C;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #735048; /* Primary Focus Color */
                    box-shadow: 0 0 0 2px #F2E2CE; /* Light Accent Ring */
                }
                .primary-button {
                    width: 100%;
                    padding: 12px 16px;
                    background-color: #735048; /* Primary Color */
                    color: white;
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: 600;
                    transition: background-color 0.15s;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .primary-button:hover:not(:disabled) {
                    background-color: #594C3C; /* Darker Brown on Hover */
                }
                .primary-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .link-area {
                    margin-top: 16px;
                    text-align: center;
                    font-size: 14px;
                    color: #594C3C;
                }
                .link-area a {
                    color: #735048; /* Primary Color for Links */
                    text-decoration: none;
                    transition: color 0.15s;
                    margin-left: 8px;
                }
                .link-area a:hover {
                    text-decoration: underline;
                    color: #594C3C;
                }
                .error-box {
                    background-color: #fcebeb; /* Light Red */
                    border: 1px solid #f09b9b; /* Red Border */
                    color: #c23939; /* Dark Red Text */
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                /* 로딩 스피너 스타일 */
                .spinner {
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top: 3px solid #fff;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            
            <div className="login-card">
                <h1 className="title">로그인</h1>
                
                {/* 에러 메시지 표시 */}
                {error && (
                    <div className="error-box" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit} className="login-form">
                    
                    {/* 아이디 입력 필드 */}
                    <div>
                        <label htmlFor="username" className="label-text">아이디</label>
                        <input
                            id="username"
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>
                    
                    {/* 비밀번호 입력 필드 */}
                    <div>
                        <label htmlFor="password" className="label-text">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        className="primary-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="spinner"></span>
                                <span>로그인 중...</span>
                            </div>
                        ) : (
                            '로그인'
                        )}
                    </button>
                </form>
                
                <p className="link-area">
                    <Link to="/register">회원가입</Link> | 
                    <a href="#">아이디/비밀번호 찾기</a>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;