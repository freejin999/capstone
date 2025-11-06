import React, { useState, useEffect } from 'react'; // 1. useEffect 임포트
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
// 🌟 [추가] 일기 쓰기 및 상세보기 컴포넌트 임포트
import PetDiaryWrite from './pages/PetDiaryWrite.jsx';
import PetDiaryDetail from './pages/PetDiaryDetail.jsx';


// -------------------------------------------------------------------
// PrivateRoute 컴포넌트 (currentUser 객체를 받도록 수정)
// -------------------------------------------------------------------
function PrivateRoute({ currentUser, children }) {
    return currentUser ? children : <Navigate to="/login" replace />;
}


/**
 * 🌟 [수정] 앱이 처음 시작될 때 localStorage에서 사용자 정보를 읽어오는 함수
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
    
    // 🌟 2. useState의 초기값으로 getInitialUser() 함수를 실행
    const [currentUser, setCurrentUser] = useState(getInitialUser()); 

    /**
     * 🌟 [수정] currentUser 상태가 변경될 때마다 localStorage에 자동으로 저장/삭제하는 Hook
     */
    useEffect(() => {
        if (currentUser) {
            // currentUser 객체가 있으면 localStorage에 JSON 문자열로 저장
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            // currentUser가 null이면(로그아웃) localStorage에서 정보 삭제
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]); // currentUser 상태가 변경될 때마다 이 함수가 실행됨

    
    // 🌟 3. handleLogin/handleLogout 함수는 이제 localStorage를 직접 건드리지 않고
    // 🌟 'setCurrentUser'만 호출하면, 위의 useEffect가 알아서 처리해줍니다.
    
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
                    <Route path="/adoption" element={<PetAdoptionSite />} />
                    <Route path="/reviews" element={<PetProductReview />} />
                    <Route path="/board" element={<BoardWebsite />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />

                    {/* 👇 게시판 관련 경로 - currentUser를 props로 전달 */}
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


                    {/* 👇 [수정] 반려동물 일기 경로 (목록/쓰기/상세) */}
                    <Route 
                        path="/diary" 
                        element={
                            <PrivateRoute currentUser={currentUser}>
                                {/* 🌟 PetDiary에도 currentUser 전달 (내 일기 목록 조회용) */}
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

                    {/* 👇 마이페이지/프로필 관리 (PrivateRoute 적용 및 props 전달) */}
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