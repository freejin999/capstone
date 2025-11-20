import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom'; // [수정] react-router-dom 의존성 제거

// [수정] react-router-dom이 없는 환경을 위해 <a> 태그를 사용하는 Mock Link 정의
const Link = (props) => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={props.to} {...props} className={props.className}>{props.children}</a>;
};

// --- CSS Block for Styling ---
const styles = `
/* Color Palette */
/* C1: #F2EDE4 (Light Background) */
/* C2: #594C3C (Dark Text / Main Focus) */
/* C3: #F2E2CE (Light Accent / Input Border) */
/* C4: #F2CBBD (Warm Accent / Error Border) */
/* C5: #735048 (Accent Color / Links / Buttons) */

.register-page-container {
    min-height: 100vh;
    background-color: #F2EDE4; /* C1 */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem; /* py-12 px-4 */
}

.register-card {
    max-width: 28rem; /* max-w-md */
    width: 100%;
    margin-top: 2rem;
    margin-bottom: 2rem;
    padding: 2.5rem; /* p-10 */
    background-color: white;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); /* shadow-xl */
    border-radius: 1rem; /* rounded-2xl */
    border: 1px solid #F2E2CE; /* C3 */
}

.header-section {
    text-align: center;
    margin-bottom: 2rem;
}

.title {
    margin-top: 1.5rem; /* mt-6 */
    font-size: 1.875rem; /* text-3xl */
    font-weight: 800; /* font-extrabold */
    color: #594C3C; /* C2: Dark Brown Title */
}

.subtitle {
    margin-top: 0.5rem; /* mt-2 */
    font-size: 0.875rem; /* text-sm */
    color: #735048; /* C5: Subtitle Color */
}

.form-spacing {
    margin-top: 2rem; /* mt-8 */
    display: flex;
    flex-direction: column;
    gap: 1rem; /* space-y-6 equivalent for form elements */
}

/* Error Message */
.error-alert {
    background-color: #F2EDE4; /* C1 */
    border: 1px solid #F2CBBD; /* C4: Warm Pink Border */
    color: #735048; /* C5: Error Text */
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    position: relative;
    font-size: 0.875rem;
}

/* Input Fields */
.input-field {
    appearance: none;
    border-radius: 0.375rem; /* rounded-md */
    position: relative;
    display: block;
    width: 94%;
    padding: 0.75rem; /* px-3 py-3 */
    border: 1px solid #F2E2CE; /* C3: Light Beige Border */
    placeholder-color: #735048; /* C5 */
    color: #594C3C; /* C2 */
    font-size: 0.875rem; /* sm:text-sm */
    transition: border-color 150ms, box-shadow 150ms;
}

.input-field:focus {
    outline: none;
    z-index: 10;
    border-color: #735048; /* C5: Accent Focus */
    box-shadow: 0 0 0 2px rgba(115, 80, 72, 0.2);
}

.sr-only { /* Tailwind equivalent for screen-reader-only label */
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}


/* Register Button */
.register-button {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.75rem 1rem; /* py-3 px-4 */
    border: 1px solid transparent;
    font-size: 0.875rem; /* text-sm */
    font-weight: 500;
    border-radius: 0.375rem; /* rounded-md */
    color: white;
    background: linear-gradient(to right, #735048, #594C3C); /* C5 to C2 Gradient */
    transition: background 150ms;
    cursor: pointer;
}

.register-button:hover:not(:disabled) {
    background: linear-gradient(to right, #594C3C, #735048); /* Darker/Reversed Hover */
}

.register-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Loading Spinner */
@keyframes spin {
    to { transform: rotate(360deg); }
}
.spinner {
    animation: spin 1s linear infinite;
    border: 2px solid white;
    border-bottom-color: transparent;
    border-radius: 50%;
    height: 1.25rem; /* h-5 */
    width: 1.25rem; /* w-5 */
    margin-right: 0.75rem; /* mr-3 */
}

/* Footer Link */
.footer-link-container {
    font-size: 0.875rem; /* text-sm */
    text-align: center;
    margin-top: 1.5rem;
}
.login-prompt {
    color: #735048; /* C5 */
}
.login-link {
    font-weight: 500;
    color: #594C3C; /* C2 */
    text-decoration: none;
    transition: color 150ms;
}
.login-link:hover {
    color: #735048; /* C5 */
    text-decoration: underline;
}
`;
// --- End CSS Block ---


export default function RegisterPage() {
    // const navigate = useNavigate(); // [수정] react-router-dom 의존성 제거
    
    // 폼 입력 값을 관리할 상태
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        nickname: ''
    });
    const [error, setError] = useState(null); // 에러 메시지 상태
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태

    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [nicknameError, setNicknameError] = useState(null);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // [NEW] 닉네임을 수정하면 중복 확인 상태 초기화
    if (name === 'nickname') {
        setNicknameChecked(false);
        setNicknameError(null);
        }
    };

    // [NEW] 닉네임 중복 확인 버튼 클릭 시 호출
    const handleCheckNickname = async () => {
        const { nickname } = formData;
        if (!nickname.trim()) {
            setNicknameError('닉네임을 입력해주세요.');
            return;
        }

        setNicknameError(null);
        setIsSubmitting(true); // 버튼 로딩 효과 재활용

        try {
            const response = await fetch('http://localhost:3001/api/users/check-nickname', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname })
            });

            const result = await response.json();

            if (response.ok) {
                setNicknameError('사용 가능한 닉네임입니다.');
                setNicknameChecked(true); // ✅ 확인 완료
            } else {
                setNicknameError(result.message); // "이미 사용 중인 닉네임입니다."
                setNicknameChecked(false);
            }

        } catch (apiError) {
            setNicknameError('닉네임 확인 중 오류가 발생했습니다.');
            setNicknameChecked(false);
        } finally {
            setIsSubmitting(false); // 로딩 종료
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // 에러 초기화

        // 유효성 검사
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.nickname) {
            setError('모든 필드를 입력해주세요.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        // [NEW] 닉네임 중복 확인 여부 검사
        if (!nicknameChecked) {
            setError('닉네임 중복 확인을 해주세요.');
            return;
        }
        // 이메일 형식 검사 (간단하게)
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('유효한 이메일 주소를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        // 🌟 실제 백엔드 API 호출 로직 🌟
        try {
            // API 호출 시 confirmPassword는 제외하고 보냅니다.
            const { username, email, password, nickname } = formData;
            
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    nickname
                })
            });

            const result = await response.json();

            if (response.ok) {
                // 가입 성공
                console.log('회원가입 성공:', result.message);
                // navigate('/login'); // [수정] 라우터 없이 직접 로그인 페이지로 이동
                window.location.href = '/login';
            } else {
                // 가입 실패 (서버에서 보낸 에러 메시지 표시)
                setError(result.message || '회원가입에 실패했습니다. 아이디/이메일 중복 등을 확인해주세요.');
            }

        } catch (apiError) {
            console.error('회원가입 API 오류:', apiError);
            setError('회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="register-page-container">
                <div className="register-card">
                    <div className="header-section">
                        <h2 className="title">
                            회원가입
                        </h2>
                        <p className="subtitle">
                            환영합니다! 정보를 입력해주세요.
                        </p>
                    </div>
                    
                    <form className="form-spacing" onSubmit={handleSubmit}>
                        {/* 에러 메시지 표시 */}
                        {error && (
                            <div className="error-alert" role="alert">
                                <span className="block">{error}</span>
                            </div>
                        )}
                        
                        {/* 아이디 */}
                        <div>
                            <label htmlFor="username" className="sr-only">아이디</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="input-field"
                                placeholder="아이디"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        {/* 이메일 */}
                        <div>
                            <label htmlFor="email" className="sr-only">이메일 주소</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="input-field"
                                placeholder="이메일 주소"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {/* 비밀번호 */}
                        <div>
                            <label htmlFor="password" className="sr-only">비밀번호</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="비밀번호"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        {/* 비밀번호 확인 */}
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">비밀번호 확인</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="input-field"
                                placeholder="비밀번호 확인"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                        {/* 닉네임 */}
                        <div>
                            <label htmlFor="nickname" className="sr-only">닉네임</label>
                            {/* [NEW] 닉네임 입력과 버튼을 묶을 div (flex 사용을 위해) */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    id="nickname"
                                    name="nickname"
                                    type="text"
                                    required
                                    // [NEW] flex-grow: 1 (CSS를 style로 간단히 적용)
                                    className="input-field"
                                    style={{ flex: 1 }} 
                                    placeholder="닉네임"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button" // 👈 중요: form submit을 방지
                                    onClick={handleCheckNickname}
                                    disabled={isSubmitting}
                                    // [NEW] 버튼 스타일 (register-button 재활용 및 크기 조절)
                                    className="register-button"
                                    style={{ width: 'auto', padding: '0.75rem 1rem' }} 
                                >
                                    중복 확인
                                </button>
                            </div>
                            {/* [NEW] 닉네임 에러/성공 메시지 표시 */}
                            {nicknameError && (
                                <p style={{ 
                                    color: nicknameChecked ? 'green' : '#735048', 
                                    fontSize: '0.875rem', 
                                    marginTop: '0.5rem' 
                                }}>
                                    {nicknameError}
                                </p>
                            )}
                        </div>

                        {/* 회원가입 버튼 */}
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="register-button"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="spinner"></div>
                                        <span>가입 처리 중...</span>
                                    </>
                                ) : (
                                    '가입하기'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="footer-link-container">
                        <span className="login-prompt">이미 계정이 있으신가요? </span>
                        <Link to="/login" className="login-link">
                            로그인
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}