// src/Navigation.jsx

import React from 'react';
import { Link } from 'react-router-dom';

// 👈 isLoggedIn, handleLogout을 prop으로 받습니다.
function Navigation({ isLoggedIn, handleLogout }) {
  return (
    <nav style={{ 
      backgroundColor: '#333', 
      padding: '10px 0',
      width: '100%' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          
          {/* 주요 메뉴 (왼쪽) - 변경 없음 */}
          <div style={{ display: 'flex' }}>
            <li style={{ marginRight: '20px' }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>메인 홈</Link>
            </li>
            <li style={{ marginRight: '20px' }}>
              <Link to="/adoption" style={{ textDecoration: 'none', color: 'white' }}>입양 공고 목록</Link>
            </li>
            <li style={{ marginRight: '20px' }}>
              <Link to="/board" style={{ textDecoration: 'none', color: 'white' }}>자유 게시판</Link>
            </li>
            <li style={{ marginRight: '20px' }}>
              <Link to="/reviews" style={{ textDecoration: 'none', color: 'white' }}>펫 용품 리뷰</Link>
            </li>
          </div>
          
          {/* 사용자 메뉴 (오른쪽) */}
          <div style={{ display: 'flex' }}>
            {/* 반려동물 일기 */}
            <li style={{ marginRight: '20px' }}>
              <Link to="/diary" style={{ textDecoration: 'none', color: 'white' }}>반려동물 일기 🐾</Link>
            </li>

            {/* 👈 로그인 상태에 따라 버튼 변경 */}
            <li style={{ marginLeft: '10px' }}>
              {isLoggedIn ? (
                // 로그인 상태: 마이페이지 링크와 로그아웃 버튼 표시
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Link to="/mypage" style={{ textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>
                    마이페이지
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    style={{ background: 'none', border: '1px solid #ff7f50', color: '#ff7f50', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                // 로그아웃 상태: 로그인 링크 표시
                <Link to="/login" style={{ textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>
                  로그인
                </Link>
              )}
            </li>

          </div>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;