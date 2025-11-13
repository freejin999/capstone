import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🌟 [수정] components/와 pages/ 폴더 구조를 기준으로 임포트합니다.
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
import PetDiaryWrite from './pages/PetDiaryWrite.jsx';
import PetDiaryDetail from './pages/PetDiaryDetail.jsx';
import PetDiaryEdit from './pages/PetDiaryEdit.jsx'; 
import PetProductReviewWrite from './pages/PetProductReviewWrite.jsx';
import PetProductReviewEdit from './pages/PetProductReviewEdit.jsx';
// 🌟 [추가] 입양 공고 상세/작성/수정 페이지 임포트
import PetAdoptionDetail from './pages/PetAdoptionDetail.jsx';
import PetAdoptionWrite from './pages/PetAdoptionWrite.jsx';
import PetAdoptionEdit from './pages/PetAdoptionEdit.jsx';


// -------------------------------------------------------------------
// PrivateRoute 컴포넌트 (currentUser 객체를 받도록 수정)
// -------------------------------------------------------------------
function PrivateRoute({ currentUser, children }) {
    // currentUser 객체가 있으면(true) 자식 컴포넌트(children)를, 없으면(null) /login으로 이동
    return currentUser ? children : <Navigate to="/login" replace />;
}


/**
 * 🌟 앱이 처음 시작될 때 localStorage에서 사용자 정보를 읽어오는 함수
 */
const getInitialUser = () => {
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser); // 저장된 정보가 있으면 객체로 변환
        }
    } catch (error) {
        console.error("localStorage에서 사용자 정보를 파싱하는데 실패했습니다:", error);
        localStorage.removeItem('currentUser'); // 오류 발생 시 저장된 정보 삭제
    }
    return null; // 저장된 정보가 없거나 오류 시 null 반환
};


function App() {
    
    // useState의 초기값으로 getInitialUser() 함수를 실행
    const [currentUser, setCurrentUser] = useState(getInitialUser()); 

    /**
     * 🌟 currentUser 상태가 변경될 때마다 localStorage에 자동으로 저장/삭제하는 Hook
     */
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]); // currentUser 상태가 변경될 때마다 이 함수가 실행됨

    
    const handleLogin = (user) => {
        console.log("App.js: 로그인 처리됨:", user);
        setCurrentUser(user);
    };
    
    const handleLogout = () => {
        console.log("App.js: 로그아웃 처리됨");
        setCurrentUser(null);
    };

    return (
        <Router>
            <div className="App">
                
                <Navigation currentUser={currentUser} handleLogout={handleLogout} /> 
                
                <Routes>
                    {/* 메인 페이지 */}
                    <Route path="/" element={<Home currentUser={currentUser} />} />
                    
                    {/* 공개 페이지 */}
                    <Route path="/board" element={<BoardWebsite />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />

                    {/* 입양 공고 라우트 (상세/작성/수정 추가) */}
                    <Route 
                        path="/adoption" 
                        element={<PetAdoptionSite currentUser={currentUser} />} 
                    />
                    <Route 
                        path="/adoption/write" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetAdoptionWrite currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/adoption/edit/:id" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetAdoptionEdit currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/adoption/:id" 
                        element={<PetAdoptionDetail currentUser={currentUser} />} 
                    />

                    {/* 펫 용품 리뷰 (목록/쓰기/수정) */}
                    <Route 
                        path="/reviews" 
                        element={<PetProductReview currentUser={currentUser} />}
                    />
                    <Route 
                        path="/reviews/write" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetProductReviewWrite currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/reviews/edit/:id" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetProductReviewEdit currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />


                    {/* 게시판 관련 경로 - currentUser를 props로 전달 */}
                    <Route 
                        path="/board/write" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <BoardWrite currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/board/edit/:id" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <BoardEdit currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/board/:id" 
                        element={<BoardDetail currentUser={currentUser} />} 
                    />


                    {/* 반려동물 일기 경로 (목록/쓰기/상세/수정) */}
                    <Route 
                        path="/diary" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetDiary currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/diary/write" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetDiaryWrite currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/diary/:id" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetDiaryDetail currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    /> 
                    <Route 
                        path="/diary/edit/:id" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <PetDiaryEdit currentUser={currentUser} />
                            </PrivateRoute>
                        } 
                    /> 

                    {/* 마이페이지/프로필 관리 (PrivateRoute 적용 및 props 전달) */}
                    <Route 
                        path="/mypage" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                <ProfileManagement currentUser={currentUser} handleLogout={handleLogout} /> 
                            </PrivateRoute>
                        } 
                    /> 
                    
                    {/* 404 페이지 */}
                    <Route path="*" element={<h1>404 페이지를 찾을 수 없습니다.</h1>} />
                </Routes>

                <Footer />
            </div>
        </Router>
    );
}

export default App;