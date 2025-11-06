import React, { useState } from 'react';
// 💡 Link를 react-router-dom에서 import 합니다.
import { Link } from 'react-router-dom';
import { PawPrint, LogOut, User, LogIn, UserPlus } from 'lucide-react';

/**
 * 상단 네비게이션 바 컴포넌트
 * @param {object} props
 * @param {object | null} props.currentUser - App.js에서 전달받은 로그인한 사용자 정보 (null이면 비로그인)
 * @param {function} props.handleLogout - App.js에서 전달받은 로그아웃 함수
 */
export default function Navigation({ currentUser, handleLogout }) {
    // 모바일 햄버거 메뉴를 위한 상태
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🌟 로그인 상태 확인: isLoggedIn (boolean) 대신 currentUser (object)가 존재하는지 확인
    const isLoggedIn = !!currentUser;

    const navLinks = [
        { name: '홈', href: '/' },
        { name: '입양하기', href: '/adoption' },
        { name: '커뮤니티', href: '/board' },
        { name: '용품 리뷰', href: '/reviews' },
        { name: '반려일기', href: '/diary' }, // 🌟 PrivateRoute로 보호됨
    ];

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* 1. 로고 및 메인 메뉴 */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-blue-600">
                            <PawPrint className="w-8 h-8" />
                            <span className="font-bold text-xl">행복한 동행</span>
                        </Link>
                        
                        {/* 데스크탑 메인 메뉴 */}
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 2. 로그인/로그아웃 버튼 (데스크탑) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoggedIn ? (
                            // 🌟 로그인 상태일 때 (currentUser가 존재함)
                            <>
                                <span className="text-sm text-gray-700">
                                    <span className="font-semibold text-blue-600">{currentUser.nickname}</span>님, 환영합니다!
                                </span>
                                <Link
                                    to="/mypage"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                                >
                                    <User className="w-4 h-4" />
                                    마이페이지
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition"
                                >
                                    <LogOut className="w-4 h-4" />
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            // 🌟 로그아웃 상태일 때 (currentUser가 null임)
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                                >
                                    <LogIn className="w-4 h-4" />
                                    로그인
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    회원가입
                                </Link>
                            </>
                        )}
                    </div>
                    
                    {/* 3. 모바일 햄버거 버튼 */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">메뉴 열기</span>
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* 4. 모바일 메뉴 (펼쳐졌을 때) */}
            <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} border-t`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            onClick={() => setIsMenuOpen(false)} // 🌟 메뉴 클릭 시 닫기
                            className="text-gray-600 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
                
                {/* 모바일 로그인/로그아웃 영역 */}
                <div className="pt-4 pb-3 border-t border-gray-200">
                    {isLoggedIn ? (
                        // 🌟 로그인 상태일 때
                        <div className="px-5 space-y-3">
                             <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    {currentUser.nickname}님
                                </span>
                            </div>
                            <Link
                                to="/mypage"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                            >
                                마이페이지
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : (
                        // 🌟 로그아웃 상태일 때
                        <div className="px-5 space-y-3">
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full bg-blue-600 text-white text-center px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                            >
                                로그인
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full bg-gray-100 text-gray-700 text-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-200"
                            >
                                회원가입
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}