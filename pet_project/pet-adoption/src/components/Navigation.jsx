import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LogIn, UserPlus } from 'lucide-react';

import logoImg from '../assets/images/logo.png'; 

export default function Navigation({ currentUser, handleLogout }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isLoggedIn = !!currentUser;

    const navLinks = [
        { name: '홈', href: '/' },
        { name: '입양하기', href: '/adoption' },
        { name: '커뮤니티', href: '/board' },
        { name: '용품 리뷰', href: '/reviews' },
        { name: '반려일기', href: '/diary' },
    ];

    const handleLinkClick = (e, linkName) => {
        if (linkName === '반려일기' && !isLoggedIn) {
            e.preventDefault();
            alert('로그인이 필요한 서비스입니다.');
            setIsMenuOpen(false);
            navigate('/login');
        } else {
            setIsMenuOpen(false);
        }
    };

    const styles = `
        .nav-bar {
            background-color: rgba(255, 255, 255, 1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 50;
            height: 4rem;
        }
        .nav-max-width {
            max-width: 1280px;
            margin-left: auto;
            margin-right: auto;
            padding-left: 1rem;
            padding-right: 1rem;
        }
        @media (min-width: 640px) {
            .nav-max-width {
                padding-left: 1.5rem;
                padding-right: 1.5rem;
            }
        }
        @media (min-width: 1024px) {
            .nav-max-width {
                padding-left: 2rem;
                padding-right: 2rem;
            }
        }

        .nav-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 4rem;
        }

        .logo-group {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
        }
        .logo-link {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #735048;
            text-decoration: none;
        }
        .logo-image {
            height: 3.5rem;
            width: auto;
            object-fit: contain;
        }
        .logo-text {
            font-weight: 700;
            font-size: 1.25rem;
            white-space: nowrap;
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
            .logo-image {
                height: 3rem;
            }
            .logo-text {
                font-size: 1.125rem;
            }
        }
        
        @media (max-width: 767px) {
            .logo-link {
                gap: 0.25rem;
            }
            .logo-image {
                height: 2.5rem;
            }
            .logo-text {
                font-size: 1rem;
            }
        }
        
        @media (max-width: 360px) {
            .logo-image {
                height: 2rem;
            }
            .logo-text {
                font-size: 0.875rem;
            }
        }

        .desktop-menu {
            display: none;
        }
        @media (min-width: 768px) {
            .desktop-menu {
                display: flex;
                margin-left: 2.5rem;
                gap: 2rem;
            }
        }
        @media (max-width: 1024px) and (min-width: 768px) {
            .desktop-menu {
                margin-left: 1.5rem;
                gap: 1rem;
            }
        }
        
        .menu-link {
            color: #594C3C;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            transition: color 150ms, background-color 150ms;
            text-decoration: none;
            white-space: nowrap;
        }
        .menu-link:hover {
            color: #735048;
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
            .menu-link {
                font-size: 0.8125rem;
                padding: 0.5rem 0.5rem;
            }
        }

        .desktop-auth {
            display: none;
            align-items: center;
            gap: 1rem;
            flex-shrink: 0;
        }
        @media (min-width: 768px) {
            .desktop-auth {
                display: flex;
            }
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
            .desktop-auth {
                gap: 0.5rem;
            }
        }

        .welcome-text {
            font-size: 0.875rem;
            color: #594C3C;
            white-space: nowrap;
        }
        .welcome-name {
            font-weight: 600;
            color: #735048;
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
            .welcome-text {
                font-size: 0.8125rem;
            }
        }

        .auth-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: #594C3C;
            transition: color 150ms;
            text-decoration: none;
            white-space: nowrap;
        }
        .auth-link:hover {
            color: #735048;
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
            .auth-link {
                font-size: 0.8125rem;
                gap: 0.25rem;
            }
        }

        .desktop-register-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #735048;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 150ms;
            text-decoration: none;
            white-space: nowrap;
        }
        .desktop-register-button:hover {
            background-color: #594C3C;
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
            .desktop-register-button {
                font-size: 0.8125rem;
                padding: 0.5rem 0.75rem;
                gap: 0.25rem;
            }
        }

        .logout-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #F2EDE4;
            color: #735048;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 150ms;
            border: none;
            cursor: pointer;
            white-space: nowrap;
        }
        .logout-button:hover {
            background-color: #F2E2CE;
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
            .logout-button {
                font-size: 0.8125rem;
                padding: 0.5rem 0.5rem;
                gap: 0.25rem;
            }
        }

        .mobile-toggler {
            display: flex;
            align-items: center;
            margin-left: 0.5rem;
        }
        @media (min-width: 768px) {
            .mobile-toggler {
                display: none;
            }
        }
        .toggler-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
            border-radius: 0.375rem;
            color: #594C3C;
            transition: background-color 150ms;
            background-color: transparent;
            border: none;
        }
        .toggler-button:hover {
            background-color: #F2E2CE;
        }
        .h-6 { height: 1.5rem; }
        .w-6 { width: 1.5rem; }
        
        @media (max-width: 360px) {
            .toggler-button {
                padding: 0.25rem;
            }
            .h-6 { height: 1.25rem; }
            .w-6 { width: 1.25rem; }
        }

        .mobile-menu {
            border-top: 1px solid #F2E2CE;
            background-color: aliceblue;
        }
        @media (min-width: 768px) {
            .mobile-menu {
                display: none;
            }
        }
        .mobile-link-group {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-top: 0.5rem;
            padding-bottom: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .mobile-menu-link {
            color: #594C3C;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-weight: 500;
            transition: background-color 150ms;
            display: block;
            text-decoration: none;
        }
        .mobile-menu-link:hover {
            background-color: #F2E2CE;
            color: #735048;
        }

        .mobile-auth-group {
            padding-top: 1rem;
            padding-bottom: 0.75rem;
            border-top: 1px solid #F2E2CE;
        }
        .mobile-auth-content {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .mobile-auth-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .mobile-auth-user {
            color: #735048;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .mobile-mypage-link {
            display: block;
            width: 100%;
            text-align: left;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-weight: 500;
            color: #594C3C;
            transition: background-color 150ms;
            text-decoration: none;
        }
        .mobile-mypage-link:hover {
            background-color: #F2E2CE;
        }
        .mobile-logout-button {
            display: block;
            width: 100%;
            text-align: left;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-weight: 500;
            color: #735048;
            transition: background-color 150ms;
            background-color: #F2EDE4;
            border: none;
            cursor: pointer;
        }
        .mobile-logout-button:hover {
            background-color: #F2CBBD;
        }

        .mobile-login-register {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
            display: flex;
            flex-direction: row;
            gap: 0.75rem;
        }
        .mobile-login-link {
            display: block;
            flex: 1;
            background-color: #735048;
            color: white;
            text-align: center;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-weight: 500;
            transition: background-color 150ms;
            text-decoration: none;
        }
        .mobile-login-link:hover {
            background-color: #594C3C;
        }
        .mobile-register-link {
            display: block;
            flex: 1;
            background-color: #F2E2CE;
            color: #594C3C;
            text-align: center;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-weight: 500;
            transition: background-color 150ms;
            text-decoration: none;
        }
        .mobile-register-link:hover {
            background-color: #F2CBBD;
        }
        
        .hidden { display: none; }
        .block { display: block; }
    `;

    return (
        <>
            <style>{styles}</style>
            <nav className="nav-bar">
                <div className="nav-max-width">
                    <div className="nav-flex">
                        
                        <div className="logo-group">
                            <Link to="/" className="logo-link">
                                <img 
                                    src={logoImg} 
                                    alt="푸딩의 발자국 로고" 
                                    className="logo-image"
                                />
                                <span className="logo-text">푸딩의 발자국</span>
                            </Link>
                            
                            <div className="desktop-menu">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className="menu-link"
                                        onClick={(e) => handleLinkClick(e, link.name)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="desktop-auth">
                            {isLoggedIn ? (
                                <>
                                    <span className="welcome-text">
                                        <span className="welcome-name">{currentUser.nickname}</span>님, 환영합니다!
                                    </span>
                                    <Link to="/mypage" className="auth-link">
                                        <User className="w-4 h-4" />
                                        마이페이지
                                    </Link>
                                    <button onClick={handleLogout} className="logout-button">
                                        <LogOut className="w-4 h-4" />
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="auth-link">
                                        <LogIn className="w-4 h-4" />
                                        로그인
                                    </Link>
                                    <Link to="/register" className="desktop-register-button">
                                        <UserPlus className="w-4 h-4" />
                                        회원가입
                                    </Link>
                                </>
                            )}
                        </div>
                        
                        <div className="mobile-toggler">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="toggler-button"
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
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

                <div id="mobile-menu" className={`mobile-menu ${isMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="mobile-link-group">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={(e) => handleLinkClick(e, link.name)}
                                className="mobile-menu-link"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mobile-auth-group">
                        {isLoggedIn ? (
                            <div className="mobile-auth-content">
                                <div className="mobile-auth-status">
                                    <User className="w-5 h-5" style={{ color: '#735048' }} />
                                    <span className="mobile-auth-user">
                                        {currentUser.nickname}님
                                    </span>
                                </div>
                                <Link
                                    to="/mypage"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="mobile-mypage-link"
                                >
                                    마이페이지
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="mobile-logout-button"
                                >
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <div className="mobile-login-register">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="mobile-login-link"
                                >
                                    로그인
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="mobile-register-link"
                                >
                                    회원가입
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}