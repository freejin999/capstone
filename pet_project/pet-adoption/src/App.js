import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 컴포넌트 임포트 (폴더 구조를 'components'와 'pages'로 분리했다고 가정합니다)
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import PetAdoptionSite from './pages/PetAdoptionSite.jsx';
import BoardWebsite from './pages/BoardWebsite.jsx';
import BoardWrite from './pages/BoardWrite.jsx';
import BoardDetail from './pages/BoardDetail.jsx';
import BoardEdit from './pages/BoardEdit.jsx';
import ProfileManagement from './pages/ProfileManagement.jsx';
import PetProductReview from './pages/PetProductReview.jsx';
import PetDiary from './pages/PetDiary.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
// MyPage 임포트는 ProfileManagement와 경로가 겹치므로 제거하거나 주석 처리합니다.
// import MyPage from './MyPage.jsx'; 


// -------------------------------------------------------------------
// PrivateRoute 컴포넌트 (로그인 상태를 props로 받도록 수정)
// -------------------------------------------------------------------
function PrivateRoute({ isLoggedIn, children }) {
    return isLoggedIn ? children : <Navigate to="/login" replace />; // 👈 로그인 안 했으면 로그인 페이지로 이동
}


function App() {
    
    // 로그인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false); 

    // 로그인/로그아웃 함수
    const handleLogin = () => {
        console.log("로그인 처리됨");
        setIsLoggedIn(true);
    };
    const handleLogout = () => {
        console.log("로그아웃 처리됨");
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <div className="App">
                
                <Navigation isLoggedIn={isLoggedIn} handleLogout={handleLogout} /> 
                
                <Routes>
                    {/* 메인 페이지 */}
                    <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
                    
                    {/* 공개 페이지 */}
                    <Route path="/adoption" element={<PetAdoptionSite />} />
                    <Route path="/reviews" element={<PetProductReview />} />
                    <Route path="/board" element={<BoardWebsite />} />
                    <Route path="/board/write" element={<BoardWrite />} />
                    <Route path="/board/:id" element={<BoardDetail />} />
                    <Route path="/board/edit/:id" element={<BoardEdit />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />

                    {/* 👇 반려동물 일기 경로에 PrivateRoute 적용 */}
                    <Route 
                        path="/diary" 
                        element={
                            <PrivateRoute isLoggedIn={isLoggedIn}>
                                <PetDiary />
                            </PrivateRoute>
                        } 
                    /> 

                    {/* 👇 마이페이지/프로필 관리 (PrivateRoute 적용) */}
                    <Route 
                        path="/mypage" 
                        element={
                            <PrivateRoute isLoggedIn={isLoggedIn}>
                                <ProfileManagement /> 
                            </PrivateRoute>
                        } 
                    /> 
                    {/* /mypage/profile 경로는 /mypage와 중복되므로 제거하거나 다른 구조로 변경 */}
                    {/* <Route 
                        path="/mypage/profile" 
                        element={
                            <PrivateRoute isLoggedIn={isLoggedIn}>
                                <ProfileManagement />
                            </PrivateRoute>
                        } 
                    /> */}
                    
                    {/* 404 페이지 */}
                    <Route path="*" element={<h1>404 페이지를 찾을 수 없습니다.</h1>} />
                </Routes>

                <Footer />
            </div>
        </Router>
    );
}

export default App;