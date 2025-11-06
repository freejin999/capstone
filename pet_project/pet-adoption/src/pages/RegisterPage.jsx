import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        // 이메일 형식 검사 (간단하게)
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
             setError('유효한 이메일 주소를 입력해주세요.');
             return;
        }

        setIsSubmitting(true);

        // 🌟 실제로는 여기에 백엔드 API 호출 로직이 들어갑니다.
        try {
            console.log('--- 회원가입 데이터 ---');
            console.log('아이디:', formData.username);
            console.log('이메일:', formData.email);
            console.log('닉네임:', formData.nickname);
            // 비밀번호는 보안상 로그 출력 X

            // API 호출 시뮬레이션 (2초 대기)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 가입 성공 가정
            alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
            navigate('/login'); // 로그인 페이지로 이동

        } catch (apiError) {
            console.error('회원가입 API 오류:', apiError);
            setError('회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        회원가입
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        환영합니다! 정보를 입력해주세요.
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
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
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="비밀번호 확인"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                    {/* 닉네임 */}
                    <div>
                        <label htmlFor="nickname" className="sr-only">닉네임</label>
                        <input
                            id="nickname"
                            name="nickname"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="닉네임"
                            value={formData.nickname}
                            onChange={handleChange}
                        />
                    </div>

                    {/* 회원가입 버튼 */}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    가입 처리 중...
                                </>
                            ) : (
                                '가입하기'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    <span className="text-gray-600">이미 계정이 있으신가요? </span>
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    );
}
